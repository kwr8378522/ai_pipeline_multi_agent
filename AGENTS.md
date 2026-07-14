# AGENTS.md - Codex Desktop 프로젝트 공통 지침

이 저장소는 "Galaxy Device Issue Triage Console" 실습용 starter 다.
모든 Agent(Main / Backend / Frontend / Integration / Tester)는 아래 규칙을 지킨다.

## worktree 규칙 (매우 중요)
- worktree 는 사람이 손으로 만들지 않는다. `git worktree add` / `git worktree remove` 를 실행하지 마라.
- 각 역할 작업장은 Codex Desktop 의 "새 작업 트리(worktree)" 기능이 자동으로 만든다(= managed worktree).
  Codex 가 만든 작업장의 실제 경로는 보통 `~/.codex/worktrees/...` 아래에 있다.
- 역할 branch 는 Codex 작업 오른쪽 패널의 "브랜치 생성"으로 만든다. 이름 규칙은 아래 "역할 branch" 참고.

## 환경 규칙
- 외부 dependency 금지. `pip install`, `npm install`, FastAPI, Streamlit, Flask 등을 쓰지 않는다.
- 서버와 검증은 Python 표준 라이브러리만으로 동작해야 한다.
- Node.js 가 없어도 검증(scripts/*.py)이 가능해야 한다.
- 콘솔/로그 출력은 ASCII 우선, 상태값은 영어(PASS/FAIL/LOW/HIGH 등)로 쓴다.
  - 문서(.md)와 웹 UI(HTML) 에는 한글 설명을 넣어도 된다.

## 역할 branch
- Backend: 시작 branch `master` -> 역할 branch `task/003-backend`
- Frontend: 시작 branch `master` -> 역할 branch `task/003-frontend`
- Integration: 시작 branch `task/003-backend` -> 역할 branch `task/003-integration` (여기서 `task/003-frontend` 를 merge)
- Tester: 시작 branch `task/003-integration` -> 역할 branch `task/003-tester`

## 역할별 파일 권한 (tasks/acceptance.json 이 단일 진실)
- Backend: `server.py`, `docs/task_003/backend/report.md` 만 수정
- Frontend: `index.html`, `src/app.js`, `src/styles.css`, `docs/task_003/frontend/report.md` 만 수정
- Integration: 구현 파일 직접 수정 금지. `task/003-frontend` merge + `docs/task_003/integration/report.md` 만 작성
- Tester: 코드 수정 금지. `docs/task_003/test/report.md`, `docs/task_003/test/approval_draft.json`(필요시 `docs/task_003/test/audit.json`) 만 작성
- 공통 금지: `data/issues.json`, `scripts/`, `tasks/acceptance.json` 수정 금지

## 검증/승인 규칙
- 검증 스크립트나 acceptance 기준을 바꿔서 억지로 통과시키지 않는다.
- approval draft 의 status 는 항상 `pending` 이다. 자동 승인 금지.
- 최종 merge 는 사람(Human) 이 Local master 에서만 한다.
- `git merge`(역할 branch 통합 제외), `git push` 는 하지 않는다. Backend/Frontend/Integration/Tester 는 자기 branch 에만 commit 한다.

## 증거 위치 (저장소 내부)
- 모든 증거는 저장소 안 `docs/task_003/<role>/` 아래에 역할별로 분리 저장한다.
  - `docs/task_003/backend/report.md`
  - `docs/task_003/frontend/report.md`
  - `docs/task_003/integration/report.md`
  - `docs/task_003/test/report.md`, `docs/task_003/test/approval_draft.json`
- 구현 전달은 Git branch + commit, 판단/검증 전달은 위 report/approval 파일이다.
- 별도 patch 파일은 만들지 않는다. Git diff 와 commit 이 이미 변경 증거다.
