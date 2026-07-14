/**
 * storage.test.js — localStorage 저장/조회 (03 질문5, 05 §5)
 * 대상: storage.js 의 loadEntries / saveEntries / addEntry
 * 방식: 순수 JS in-memory mock({getItem,setItem})을 주입해 브라우저 없이 검증.
 */
'use strict';
var assert = require('node:assert');
var Storage = require('../storage.js');

function createMockStorage(seed) {
  var store = Object.assign({}, seed);
  return {
    getItem: function (k) { return Object.prototype.hasOwnProperty.call(store, k) ? store[k] : null; },
    setItem: function (k, v) { store[k] = String(v); }
  };
}

function entry(text, createdAt, over) {
  return Object.assign({
    id: text + '-' + createdAt,
    text: text,
    priority: 'P2',
    needsReview: false,
    role: 'Frontend',
    nextAction: '즉시 수정',
    createdAt: createdAt
  }, over || {});
}

module.exports = [
  { name: '빈 상태 조회 → [] (에러 아님)', fn: function () {
    var s = createMockStorage();
    assert.deepStrictEqual(Storage.loadEntries(s), []);
  }},
  { name: '1건 저장 후 조회 → 필드값 동일', fn: function () {
    var s = createMockStorage();
    Storage.addEntry(entry('결제 API 지연', '2026-07-14T00:00:01.000Z', { priority: 'P1', needsReview: true, role: 'Backend', nextAction: '리뷰 요청' }), s);
    var got = Storage.loadEntries(s);
    assert.strictEqual(got.length, 1);
    assert.strictEqual(got[0].text, '결제 API 지연');
    assert.strictEqual(got[0].priority, 'P1');
    assert.strictEqual(got[0].needsReview, true);
    assert.strictEqual(got[0].role, 'Backend');
    assert.strictEqual(got[0].nextAction, '리뷰 요청');
  }},
  { name: '다건 연속 저장 → 누적 + 최신순 정렬 유지', fn: function () {
    var s = createMockStorage();
    Storage.addEntry(entry('old', '2026-07-14T00:00:01.000Z'), s);
    Storage.addEntry(entry('new', '2026-07-14T00:00:02.000Z'), s);
    var got = Storage.loadEntries(s);
    assert.strictEqual(got.length, 2);
    assert.strictEqual(got[0].text, 'new'); // 최신이 앞
    assert.strictEqual(got[1].text, 'old');
  }},
  { name: '새로고침 시뮬레이션(별도 조회) → 데이터 유지', fn: function () {
    var s = createMockStorage();
    Storage.addEntry(entry('persist', '2026-07-14T00:00:01.000Z'), s);
    var again = Storage.loadEntries(s); // 저장 후 새 조회 호출
    assert.strictEqual(again.length, 1);
    assert.strictEqual(again[0].text, 'persist');
  }},
  { name: '20건 초과 저장 → 최신 20건만 유지(오래된 것 잘림)', fn: function () {
    var s = createMockStorage();
    for (var i = 1; i <= 25; i++) {
      var ca = '2026-07-14T00:00:' + String(i).padStart(2, '0') + '.000Z';
      Storage.addEntry(entry('e' + i, ca), s);
    }
    var got = Storage.loadEntries(s);
    assert.strictEqual(got.length, 20);
    assert.strictEqual(got[0].text, 'e25'); // 최신
    var texts = got.map(function (x) { return x.text; });
    assert.ok(texts.indexOf('e1') === -1, 'e1(가장 오래된) 잘림');
    assert.ok(texts.indexOf('e5') === -1, 'e5 잘림');
    assert.ok(texts.indexOf('e6') !== -1, 'e6 유지');
  }},
  { name: '손상 JSON → 빈 배열 폴백(에러 아님)', fn: function () {
    var s = createMockStorage({ changeRequestEntries: '{not valid json' });
    assert.deepStrictEqual(Storage.loadEntries(s), []);
  }},
  { name: '배열 아닌 값 저장됨 → 빈 배열 폴백', fn: function () {
    var s = createMockStorage({ changeRequestEntries: '{"a":1}' });
    assert.deepStrictEqual(Storage.loadEntries(s), []);
  }}
];
