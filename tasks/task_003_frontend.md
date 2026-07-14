# task_003 - Frontend Agent 작업 명세

## 작업장
Codex-managed worktree (branch: `task/003-frontend`, 시작 branch `master`).
Backend 와 **독립적으로 master 에서** 시작한다. 사람이 `git worktree add` 를 실행하지 않는다.

## 목표
대시보드를 완성해서 `scripts/check_dom.py` 를 PASS 시킨다.

## 구현할 것 (index.html, src/app.js, src/styles.css)
1. src/app.js
   - GET /api/issues 로 이슈 목록을 가져온다
   - 각 issue 를 POST /api/triage 로 보내 분류 결과(priority/requiredTests/ownerReview/owner)를 받는다
   - issue + 분류결과를 카드로 #issue-board 에 렌더링한다
   - #summary-p0 / #summary-p1 / #summary-p2 에 개수, #summary-review 에 ownerReview=true 개수 표시
   - #filter-bar 에 필터 버튼을 만든다
     - All, P0, P1, P2, Camera, Battery, Connectivity, Foldable UX, UI, Performance
   - 필터 클릭 시 해당 카드만 보이게 한다
2. index.html
   - 필수 DOM id 유지: app, summary-p0, summary-p1, summary-p2, summary-review,
     filter-bar, issue-board, error-panel
3. src/styles.css
   - .card 카드 스타일
   - .card-p0 : P0 카드 강조 (check_dom 이 이 클래스를 찾습니다)
   - 반응형은 grid 로 간단히

## 규칙 (acceptance.json)
- allowedFiles: index.html, src/app.js, src/styles.css, docs/task_003/frontend/report.md
- forbiddenFiles: server.py, data/issues.json, scripts/, tasks/acceptance.json
- 외부 폰트/CDN/프레임워크/npm 패키지 금지

## 마무리 (증거 + commit)
- `py scripts/check_dom.py`  -> PASS 확인
- `docs/task_003/frontend/report.md` 작성 (무엇을 왜 바꿨는지, 테스트 결과)
- 구현 3파일 + frontend report 만 `git add` -> `git commit`
  - 예: `git commit -m "feat(task_003): implement issue triage dashboard"`
- merge/rebase/push 금지
