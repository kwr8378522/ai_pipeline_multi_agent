# task_003 - Backend Agent 작업 명세

## 작업장
Codex-managed worktree (branch: `task/003-backend`, 시작 branch `master`).
사람이 `git worktree add` 를 실행하지 않는다. Codex "새 작업 트리" 로 만든다.

## 목표
server.py 의 분류 로직을 완성해서 `scripts/check_api.py` 를 PASS 시킨다.

## 구현할 것 (server.py 의 classify_issue)
정확한 기대값은 tasks/acceptance.json 의 apiCases / priorityRules 를 기준으로 한다.

- priority
  - P0: severity == High 이고 impactScope 가 System 또는 Multi-device
  - P0: 또는 reproRate >= 70 이고 area 가 Camera/Battery/Connectivity/Foldable UX
  - P1: severity == Medium, 또는 reproRate >= 40, 또는 impactScope == App-wide
  - P2: 그 외
- requiredTests
  - 기본 ["Smoke"]
  - P0 또는 P1 이면 "Regression" 추가
  - Multi-device 면 "Device Matrix" 추가
  - area 별: Camera->"Camera Smoke", Battery->"Battery Drain",
    Connectivity->"Reconnect", Foldable UX->"Foldable Layout"
  - 중복 제거
- ownerReview
  - P0 이면 true
  - P1 이고 area 가 Camera/Battery/Connectivity/Foldable UX 이면 true
  - 그 외 false
- owner
  - Camera->"Camera QA", Battery->"Power QA", Connectivity->"Connectivity QA",
    Foldable UX->"Foldable UX QA", Performance->"Performance QA", UI->"UX QA"
- reasons: 분류 근거 문자열 배열 (참고용)

## 유지할 것
- GET /api/issues 는 매 요청마다 data/issues.json 을 다시 읽어야 한다 (이미 그렇게 되어 있음)
- GET /api/health 는 그대로 동작해야 한다
- Python 표준 라이브러리만 사용 (외부 패키지 금지)

## 규칙 (acceptance.json)
- allowedFiles: server.py, docs/task_003/backend/report.md
- forbiddenFiles: index.html, src/app.js, src/styles.css, data/issues.json, scripts/, tasks/acceptance.json

## 마무리 (증거 + commit)
- `py scripts/check_api.py`  -> PASS 확인
- `docs/task_003/backend/report.md` 작성 (무엇을 왜 바꿨는지, 테스트 결과)
- server.py 와 backend report 만 `git add` -> `git commit`
  - 예: `git commit -m "feat(task_003): implement issue triage backend"`
- merge/rebase/push 금지
