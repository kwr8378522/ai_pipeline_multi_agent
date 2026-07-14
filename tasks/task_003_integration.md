# task_003 - Integration Agent 작업 명세

## 작업장
Codex-managed worktree (branch: `task/003-integration`, 시작 branch `task/003-backend`).
"Integration managed worktree" 는 Codex 작업 표시 이름이고, 실제 Git branch 는 `task/003-integration` 이다.

## 목표
Backend 결과(`task/003-backend`) 위에서 Frontend 결과(`task/003-frontend`)를 합치고,
합쳐진 통합본이 전체 검증을 통과하는지 확인한다.

## 순서
1. 시작 상태 확인 (아직 아무것도 바꾸지 않는다)
   - HEAD 가 `task/003-backend` 최신 commit 과 같은가
   - `task/003-frontend` 가 존재하는가
   - working tree 가 clean 한가
2. 병합
   - `git merge --no-ff task/003-frontend`
   - 충돌이 나면 임의로 해결하지 말고 중단한다 (충돌은 보통 누군가 범위 밖 파일을 건드린 신호).
3. 전체 검증
   - `py scripts/check_api.py`
   - `py scripts/check_dom.py`
   - `py scripts/audit.py`

## 규칙 (acceptance.json)
- allowedFiles: docs/task_003/integration/report.md
- forbiddenFiles: server.py, index.html, src/app.js, src/styles.css, data/issues.json, scripts/, tasks/acceptance.json
- 구현 파일(server.py / 프론트 3파일)을 **직접 수정하지 않는다.**
  테스트가 실패하면 담당 역할(Backend/Frontend) branch 로 되돌린다.

## 마무리 (증거 + commit)
- `docs/task_003/integration/report.md` 작성 (merge 결과, 3개 검증 결과)
- integration report 만 `git add` -> `git commit`
  - 예: `git commit -m "chore(task_003): integrate backend and frontend"`
- master merge/push 금지
