/**
 * app.js — 폼 값 수집 · 입력 검증 · 레코드 생성 · 목록 렌더링 · 초기 로드
 *
 * 설계 원칙 (05 §6, 04 §4 반영):
 *  - validateInput: 텍스트 필드만 필수 검증 (나머지는 UI 기본값 존재).
 *  - buildEntry: 사용자가 고른 값을 재판정 없이 그대로 보존하되,
 *    고정 목록(priority/role/nextAction) 밖의 값은 거부(throw). needsReview는 boolean.
 *  - 사용자 입력은 innerHTML 이 아니라 textContent 로만 렌더 (XSS 방지).
 *  - 순수 로직 함수는 Node 에서 require 해 단위 테스트 가능 (DOM 접근은 init 시점에만).
 */
(function (global) {
  'use strict';

  var PRIORITIES = ['P0', 'P1', 'P2'];
  var ROLES = ['Frontend', 'Backend', 'QA', 'Infra'];
  var NEXT_ACTIONS = ['즉시 수정', '리뷰 요청', '백로그 등록'];

  // storage API 해석: 브라우저=window.AppStorage, Node=require('./storage.js')
  var storageApi = (typeof module !== 'undefined' && module.exports)
    ? require('./storage.js')
    : global.AppStorage;

  var idCounter = 0;
  function makeId() {
    idCounter += 1;
    return Date.now().toString() + '-' + idCounter;
  }

  function validateInput(text) {
    return typeof text === 'string' && text.trim().length > 0;
  }

  function buildEntry(formValues) {
    var v = formValues || {};
    if (!validateInput(v.text)) {
      throw new Error('text is required');
    }
    if (PRIORITIES.indexOf(v.priority) === -1) {
      throw new Error('invalid priority: ' + v.priority);
    }
    if (ROLES.indexOf(v.role) === -1) {
      throw new Error('invalid role: ' + v.role);
    }
    if (NEXT_ACTIONS.indexOf(v.nextAction) === -1) {
      throw new Error('invalid nextAction: ' + v.nextAction);
    }
    if (typeof v.needsReview !== 'boolean') {
      throw new Error('needsReview must be boolean');
    }
    return {
      id: makeId(),
      text: v.text,
      priority: v.priority,
      needsReview: v.needsReview,
      role: v.role,
      nextAction: v.nextAction,
      createdAt: new Date().toISOString()
    };
  }

  function collectFormValues() {
    var textEl = document.getElementById('request-text');
    var priorityEl = document.querySelector('input[name="priority"]:checked');
    var reviewEl = document.getElementById('needs-review');
    var roleEl = document.getElementById('role');
    var actionEl = document.getElementById('next-action');
    return {
      text: textEl ? textEl.value : '',
      priority: priorityEl ? priorityEl.value : 'P2',
      needsReview: reviewEl ? !!reviewEl.checked : false,
      role: roleEl ? roleEl.value : 'Frontend',
      nextAction: actionEl ? actionEl.value : '즉시 수정'
    };
  }

  function renderHistoryList(entries) {
    var list = document.getElementById('history-list');
    if (!list) return;
    list.textContent = '';
    (entries || []).forEach(function (entry) {
      var li = document.createElement('li');
      li.className = 'history-item priority-' + String(entry.priority).toLowerCase();

      var textDiv = document.createElement('div');
      textDiv.className = 'item-text';
      textDiv.textContent = entry.text; // 사용자 입력은 textContent 로만
      li.appendChild(textDiv);

      var meta = document.createElement('div');
      meta.className = 'item-meta';
      meta.textContent = [
        entry.priority,
        entry.needsReview ? '리뷰 필요' : '리뷰 불필요',
        entry.role,
        entry.nextAction
      ].join(' · ');
      li.appendChild(meta);

      list.appendChild(li);
    });
  }

  function handleSubmit(event) {
    if (event && typeof event.preventDefault === 'function') event.preventDefault();
    var values = collectFormValues();
    var hint = document.getElementById('empty-hint');

    if (!validateInput(values.text)) {
      if (hint) hint.hidden = false; // 빈 입력: 저장하지 않고 안내만
      return;
    }
    if (hint) hint.hidden = true;

    var entry = buildEntry(values);
    var entries = storageApi.addEntry(entry);
    renderHistoryList(entries);

    var textEl = document.getElementById('request-text');
    if (textEl) textEl.value = ''; // 텍스트만 초기화 (나머지 선택값은 유지)
  }

  function init() {
    var form = document.getElementById('request-form');
    if (form) form.addEventListener('submit', handleSubmit);
    renderHistoryList(storageApi.loadEntries());
  }

  var api = {
    PRIORITIES: PRIORITIES,
    ROLES: ROLES,
    NEXT_ACTIONS: NEXT_ACTIONS,
    validateInput: validateInput,
    buildEntry: buildEntry,
    collectFormValues: collectFormValues,
    renderHistoryList: renderHistoryList,
    handleSubmit: handleSubmit,
    init: init
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    global.App = api;
  }

  // 브라우저에서만 자동 초기화 (Node require 시에는 실행하지 않음)
  if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', init);
  }
})(typeof window !== 'undefined' ? window : this);
