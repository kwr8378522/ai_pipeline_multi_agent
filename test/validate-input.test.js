/**
 * validate-input.test.js — 빈 입력 검증 로직 (03 질문1, 05 §5)
 * 대상: app.js 의 validateInput(text)
 * Node 내장 assert 만 사용, 외부 npm 없음.
 */
'use strict';
var assert = require('node:assert');
var App = require('../app.js');

module.exports = [
  { name: '빈 문자열 "" → false (저장 거부)', fn: function () {
    assert.strictEqual(App.validateInput(''), false);
  }},
  { name: '공백만 "   " → false (저장 거부)', fn: function () {
    assert.strictEqual(App.validateInput('   '), false);
  }},
  { name: '탭/개행만 → false', fn: function () {
    assert.strictEqual(App.validateInput('\t\n '), false);
  }},
  { name: '정상 텍스트 → true (통과)', fn: function () {
    assert.strictEqual(App.validateInput('결제 API 응답 지연 개선 필요'), true);
  }},
  { name: '비문자열(null) → false (방어)', fn: function () {
    assert.strictEqual(App.validateInput(null), false);
  }}
];
