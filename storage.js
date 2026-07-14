/**
 * storage.js — 코드 변경 요청 이력의 저장/조회 담당
 *
 * 설계 원칙 (05_mvp_implementation_plan.md §6, 04_builder_diff_plan.md 반영):
 *  - storage 백엔드를 파라미터로 주입 가능 (기본값 window.localStorage).
 *    → Tester가 { getItem, setItem } 형태의 순수 JS mock을 주입해 브라우저 없이 테스트 가능.
 *  - loadEntries 는 try/catch + 빈 배열 폴백 (손상 JSON / 형식 불일치 방어).
 *  - addEntry 는 최신순(createdAt 내림차순) 정렬 후 MAX_ENTRIES(20)건만 유지.
 *  - DOM 의존 없음 → 단독 단위 테스트 가능.
 *
 * 브라우저에서는 <script>로 로드되어 window.AppStorage 로 노출되고,
 * Node.js 에서는 require('./storage.js') 로 동일 API를 사용한다 (UMD 패턴).
 */
(function (global) {
  'use strict';

  var STORAGE_KEY = 'changeRequestEntries';
  var MAX_ENTRIES = 20;

  function resolveStorage(storage) {
    if (storage) return storage;
    if (typeof window !== 'undefined' && window.localStorage) return window.localStorage;
    return null;
  }

  function loadEntries(storage) {
    var backend = resolveStorage(storage);
    if (!backend) return [];
    try {
      var raw = backend.getItem(STORAGE_KEY);
      if (!raw) return [];
      var parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed;
    } catch (e) {
      // 손상 데이터(잘못된 JSON 등) → 에러 대신 빈 배열 폴백
      return [];
    }
  }

  function saveEntries(entries, storage) {
    var backend = resolveStorage(storage);
    if (!backend) return;
    backend.setItem(STORAGE_KEY, JSON.stringify(entries || []));
  }

  function addEntry(entry, storage) {
    var backend = resolveStorage(storage);
    var entries = loadEntries(backend);
    entries.push(entry);
    entries.sort(function (a, b) {
      // createdAt 내림차순 (최신이 앞)
      var ca = a && a.createdAt ? a.createdAt : '';
      var cb = b && b.createdAt ? b.createdAt : '';
      if (ca < cb) return 1;
      if (ca > cb) return -1;
      return 0;
    });
    var sliced = entries.slice(0, MAX_ENTRIES);
    saveEntries(sliced, backend);
    return sliced;
  }

  var api = {
    STORAGE_KEY: STORAGE_KEY,
    MAX_ENTRIES: MAX_ENTRIES,
    loadEntries: loadEntries,
    saveEntries: saveEntries,
    addEntry: addEntry
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    global.AppStorage = api;
  }
})(typeof window !== 'undefined' ? window : this);
