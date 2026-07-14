# task_003 - Main (Orchestrator) 작업 명세

## 역할
Codex Desktop에서 전체 파이프라인을 분해하고 조율한다. 코드는 직접 짜지 않는다.
증거를 모으고, 사람(Human)이 최종 merge를 판단하도록 돕는다.

## 순서
1. 작업 분해
   - Backend: server.py 의 분류 로직(classify_issue, POST /api/triage)
   - Frontend: index.html / src/app.js / src/styles.css 의 대시보드
   - Integration: 두 branch 통합 + 전체 검증
   - Tester: 통합본 위에서 검증 + 증거 문서
2. 역할별 작업장은 Codex Desktop 의 "새 작업 트리(managed worktree)" 로 만든다.
   사람이 `git worktree add` 를 실행하지 않는다.
3. 각 Agent 의 allowedFiles / forbiddenFiles 확인 (tasks/acceptance.json 이 단일 진실)
   - Backend: server.py (+ docs/task_003/backend/report.md)
   - Frontend: index.html/app.js/styles.css (+ docs/task_003/frontend/report.md)
4. 병렬 실행 순서
   - Backend, Frontend 는 둘 다 master 에서 독립적으로 시작해 동시에 구현한다.
   - 각 Agent 는 자기 branch 에서 테스트 통과 후 report 작성 + commit 까지 수행한다.
5. 통합
   - Integration: 시작 branch `task/003-backend` -> `task/003-integration` 생성 -> `task/003-frontend` 를 `--no-ff` merge
   - Integration 에서 check_api / check_dom / audit 를 모두 실행한다.
6. 검증
   - Tester: 시작 branch `task/003-integration` -> `task/003-tester` 생성
   - Tester 는 코드 수정 없이 docs/task_003/test/ 에 report.md, approval_draft.json 작성
7. 최종 리뷰
   - Main Reviewer 는 Local master 에서 branch diff / report / approval draft / Git graph 만 읽고 판단을 제안한다.
   - approval draft 의 status 는 항상 pending. recommendation 은 참고만.
8. 사람 승인 전에는 절대 master 로 merge 하지 않는다.

## 금지
- 코드/문서 직접 수정, git add/commit/merge/push (Main 은 판단만 제안)
- 사람 승인 없는 최종 merge 금지
- `git worktree add` 등 수동 worktree 조작 금지
- scripts/ 와 tasks/acceptance.json 수정 금지
