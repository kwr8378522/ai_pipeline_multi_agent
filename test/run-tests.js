/**
 * run-tests.js — 3개 테스트 스위트를 실행하고 결과를 집계한다.
 * 로그: ../../agent_shared/logs/practice2_test.log (공용 증거함, 저장소 밖 형제 위치)
 * 마지막 줄: RESULT: PRACTICE2_TEST_PASS 또는 RESULT: PRACTICE2_TEST_FAIL
 * 외부 npm 없음 (node:fs, node:path, node:assert 내장 모듈만).
 */
'use strict';
var fs = require('node:fs');
var path = require('node:path');

var suites = [
  ['validate-input', require('./validate-input.test.js')],
  ['build-record', require('./build-record.test.js')],
  ['storage', require('./storage.test.js')]
];

var lines = [];
function log(s) { lines.push(s); }

log('=== Practice 2 Test Run ===');
var total = 0, passed = 0, failed = 0;

suites.forEach(function (pair) {
  var suiteName = pair[0];
  var cases = pair[1];
  log('');
  log('# ' + suiteName + '.test.js');
  cases.forEach(function (c) {
    total += 1;
    try {
      c.fn();
      passed += 1;
      log('  PASS  ' + c.name);
    } catch (e) {
      failed += 1;
      log('  FAIL  ' + c.name + '  ->  ' + (e && e.message ? e.message : String(e)));
    }
  });
});

log('');
log('-----------------------------------');
log('total=' + total + '  passed=' + passed + '  failed=' + failed);
var result = failed === 0 ? 'RESULT: PRACTICE2_TEST_PASS' : 'RESULT: PRACTICE2_TEST_FAIL';
log(result);

var out = lines.join('\n') + '\n';
process.stdout.write(out);

// 공용 증거함에 로그 저장 (tester_worktree/test → ../../agent_shared)
try {
  var logDir = path.resolve(__dirname, '..', '..', 'agent_shared', 'logs');
  fs.mkdirSync(logDir, { recursive: true });
  fs.writeFileSync(path.join(logDir, 'practice2_test.log'), out, 'utf8');
} catch (e) {
  process.stderr.write('로그 저장 실패: ' + e.message + '\n');
}

process.exitCode = failed === 0 ? 0 : 1;
