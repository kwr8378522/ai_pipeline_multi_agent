# task_003 - Tester Agent 작업 명세

## 작업장
Codex-managed worktree (branch: `task/003-tester`, 시작 branch `task/003-integration`).
integration 결과(Backend + Frontend 병합본) 위에서 검증한다.

## 규칙
- 구현 코드(server.py / index.html / src / data)를 수정하지 않는다.
- scripts/ 와 tasks/acceptance.json 을 수정하지 않는다.
- 테스트를 통과시키려고 결과를 조작하지 않는다.
- 증거는 저장소 안 `docs/task_003/test/` 에만 생성한다.

## 시작 확인 (아직 아무것도 바꾸지 않는다)
- branch 생성 전 HEAD 가 integration 최신 commit 과 같은가
- working tree 가 clean 한가

## 실행 (스크립트 기반 검증)
- `py scripts/check_api.py`
- `py scripts/check_dom.py`
- `py scripts/audit.py --out docs/task_003/test/audit.json`  (audit.json 은 선택)

## 증거 작성 (Agent 가 직접 작성)
- `docs/task_003/test/report.md`
  - 실제 PASS/FAIL, implementationRisk, 남은 리스크를 기록
- `docs/task_003/test/approval_draft.json`
  - status 는 항상 "pending"
  - 모두 통과하면 recommendation 은 "approve_candidate"
  - 하나라도 실패하면 recommendation 은 "hold"

## 마무리 (commit)
- 위 증거 파일만 `git add` -> `git commit`
  - 예: `git commit -m "test(task_003): record integration audit evidence"`
- merge/push 금지

## 남는 증거 (docs/task_003/test)
- report.md
- approval_draft.json
- audit.json (선택)
