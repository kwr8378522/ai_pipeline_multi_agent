# 07 Tester Validation Report

> 작성자: Tester (worktree=`tester_worktree`, branch=`practice2/tester`, `practice2/builder` 위에서 생성)
> 입력: `05_mvp_implementation_plan.md`, `03_test_questions_and_plan.md`, `03A_test_answers.md`, `06_builder_implementation_report.md`
> 제약: Node 내장 모듈(`assert`/`fs`/`path`)만 사용, 외부 npm 없음. 앱 코드 수정하지 않음.

## 1. 결과 요약

**RESULT: PRACTICE2_TEST_PASS** — 20개 케이스 전부 통과 (passed=20, failed=0, exit code 0).
로그: `../agent_shared/logs/practice2_test.log`

## 2. 만든 파일 (테스트만, 앱 코드 미수정)

| 파일 | 검증 대상 |
|---|---|
| `test/validate-input.test.js` | `app.js` `validateInput` — 빈/공백/비문자열 거부, 정상 통과 (5) |
| `test/build-record.test.js` | `app.js` `buildEntry` — 값 보존, 고정 목록 밖 값 거부, needsReview boolean (8) |
| `test/storage.test.js` | `storage.js` `loadEntries/saveEntries/addEntry` — 저장·조회·정렬·상한·폴백 (7) |
| `test/run-tests.js` | 러너 — 3스위트 실행·집계, 로그 저장, `RESULT:` 마지막 줄 출력 |

## 3. 검증 항목별 결과

### validate-input (질문1) — 5/5 PASS
- `""`, `"   "`, `"\t\n "`, `null` → 저장 거부(false)
- `"결제 API 응답 지연 개선 필요"` → 통과(true)

### build-record (질문2·3·4) — 8/8 PASS
- 사용자가 고른 `priority/needsReview/role/nextAction`을 **재판정 없이 그대로 보존**, `id`·`createdAt` 부여 확인
- 계획서 예시 3행(P0/Backend/즉시 수정/true, P2/Frontend/백로그 등록/false, P1/Backend/리뷰 요청/true) 보존 확인
- 방어: `priority="P9"`, `role="Sales"`, `nextAction="폐기"`, `needsReview="yes"`(비boolean), 빈 텍스트 → 전부 거부(throw)

### storage (질문5) — 7/7 PASS
- 빈 조회 → `[]` (에러 아님)
- 1건 저장·복원 필드값 동일
- 다건 누적 + 최신순(createdAt 내림차순) 정렬 유지
- 새로고침 시뮬레이션(별도 `loadEntries` 호출) → 데이터 유지
- 25건 저장 → 최신 20건만 유지, 오래된 e1~e5 잘림, e6·e25 유지 (`MAX_ENTRIES=20`)
- 손상 JSON / 배열 아닌 값 → 빈 배열 폴백

## 4. 검증 방식 노트

- localStorage는 브라우저 전용이므로, `{getItem,setItem}`만 흉내 낸 **순수 JS in-memory mock**을 `storage.js` 함수에 주입해 브라우저 없이 검증했다. Builder가 storage 백엔드 주입 구조(05 §6, P0-3)를 구현해 두어 그대로 성립했다.
- 리뷰 필드명은 앱 계약(04/05 §6) 및 06 리포트 확정대로 **`needsReview`** 기준으로 검증했다.
- DOM 렌더링 자동 테스트는 계획서(05 §3)대로 범위 제외 — 수동 확인 항목으로 남긴다.

## 5. 실패/이상 원인

없음. 모든 케이스 통과. Builder 구현이 계획서 계약(검증/값 보존/저장·조회)을 충족.

## 6. 금지사항 준수

- 앱 코드(`index.html`/`app.js`/`storage.js`/`styles.css`) 수정하지 않음 (테스트 파일만 추가)
- tester가 앱을 고쳐 통과시키지 않음 · main merge 미수행
