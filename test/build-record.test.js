/**
 * build-record.test.js — 값 보존 + 고정 목록 검증 (03 질문2·3·4, 05 §5)
 * 대상: app.js 의 buildEntry(formValues)
 * 핵심: 사용자가 고른 값을 재판정 없이 그대로 보존하되, 고정 목록 밖 값은 거부.
 */
'use strict';
var assert = require('node:assert');
var App = require('../app.js');

function valid(over) {
  return Object.assign({
    text: '결제 API 응답 지연 개선 필요',
    priority: 'P1',
    needsReview: true,
    role: 'Backend',
    nextAction: '리뷰 요청'
  }, over || {});
}

module.exports = [
  { name: '사용자 선택값 재판정 없이 그대로 보존', fn: function () {
    var e = App.buildEntry(valid());
    assert.strictEqual(e.text, '결제 API 응답 지연 개선 필요');
    assert.strictEqual(e.priority, 'P1');
    assert.strictEqual(e.needsReview, true);
    assert.strictEqual(e.role, 'Backend');
    assert.strictEqual(e.nextAction, '리뷰 요청');
    assert.ok(typeof e.id === 'string' && e.id.length > 0, 'id 부여');
    assert.ok(typeof e.createdAt === 'string' && e.createdAt.length > 0, 'createdAt 부여');
  }},
  { name: 'P0/Backend/즉시 수정/리뷰 true 보존', fn: function () {
    var e = App.buildEntry(valid({ text: '운영 서버 로그인 장애 긴급 수정', priority: 'P0', needsReview: true, role: 'Backend', nextAction: '즉시 수정' }));
    assert.strictEqual(e.priority, 'P0');
    assert.strictEqual(e.role, 'Backend');
    assert.strictEqual(e.nextAction, '즉시 수정');
    assert.strictEqual(e.needsReview, true);
  }},
  { name: 'P2/Frontend/백로그 등록/리뷰 false 보존', fn: function () {
    var e = App.buildEntry(valid({ text: '버튼 색상 오타 수정', priority: 'P2', needsReview: false, role: 'Frontend', nextAction: '백로그 등록' }));
    assert.strictEqual(e.priority, 'P2');
    assert.strictEqual(e.role, 'Frontend');
    assert.strictEqual(e.nextAction, '백로그 등록');
    assert.strictEqual(e.needsReview, false);
  }},
  { name: '허용 안 된 priority "P9" → 거부(throw)', fn: function () {
    assert.throws(function () { App.buildEntry(valid({ priority: 'P9' })); });
  }},
  { name: '고정 목록 밖 role "Sales" → 거부(throw)', fn: function () {
    assert.throws(function () { App.buildEntry(valid({ role: 'Sales' })); });
  }},
  { name: '고정 목록 밖 nextAction "폐기" → 거부(throw)', fn: function () {
    assert.throws(function () { App.buildEntry(valid({ nextAction: '폐기' })); });
  }},
  { name: 'needsReview 비boolean("yes") → 거부(throw)', fn: function () {
    assert.throws(function () { App.buildEntry(valid({ needsReview: 'yes' })); });
  }},
  { name: '빈 텍스트 → 거부(throw)', fn: function () {
    assert.throws(function () { App.buildEntry(valid({ text: '   ' })); });
  }}
];
