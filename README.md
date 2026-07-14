# Galaxy Device Issue Triage Console - 실습 3 Starter

Codex Desktop에서 **Main / Backend / Frontend / Integration / Tester** 역할이 협업해
디바이스 이슈 분류 콘솔을 완성하는 실습입니다.

- Backend / Frontend 는 **Codex-managed worktree(새 작업 트리)** 에서 **병렬**로 구현합니다.
- Integration 은 두 branch 를 합치고, Tester 는 **Python 스크립트**로 통합 결과를 검증합니다.
- Main / Human 은 증거(diff / report / approval)를 보고 **최종 merge** 를 판단합니다.

> 외부 패키지가 전혀 필요 없습니다. **Python 표준 라이브러리만** 사용합니다.
> `pip install` / `npm install` / FastAPI / Streamlit / Flask 를 쓰지 않습니다.

---

## 0. 폴더 구조

```
practice3_mx_issue_console_starter/
  main_codex_project/          <- 여기가 git 저장소가 됩니다 (Local master)
    README.md  AGENTS.md  index.html  server.py
    src/    (app.js, styles.css)
    data/   (issues.json)
    tasks/  (task_003_*.md, acceptance.json)
    scripts/(check_api.py, check_dom.py, audit.py)
    docs/task_003/             <- 저장소 내부 증거함 (역할별로 분리)
      backend/report.md
      frontend/report.md
      integration/report.md
      test/report.md  test/approval_draft.json  (test/audit.json 은 선택)
```

worktree 는 **사람이 만들지 않습니다.** Codex Desktop 의 "새 작업 트리" 기능이 각 역할 작업장을
`~/.codex/worktrees/...` 아래에 자동으로 만들어 줍니다. `git worktree add` 는 쓰지 않습니다.

---

## 1. 이 실습의 목적

- Galaxy Device Issue Triage Console 을 만든다.
- Backend Agent 와 Frontend Agent 를 **병렬 managed worktree** 에서 동시에 구현한다.
- Integration 이 두 결과를 합치고, Tester 가 스크립트로 통합 결과를 검증한다.
- Main / Human 이 증거를 보고 merge 를 판단한다.

---

## 2. 실행 방법 (starter 확인)

`main_codex_project` 로 이동해서:

```powershell
# 1) git 저장소 초기화 (starter 에는 .git 이 없습니다. 기본 branch = master)
git init -b master
git add .
git commit -m "chore(task_003): import starter"

# 2) 서버 실행 (Windows: py, macOS/Linux: python3)
py server.py
```

브라우저에서 접속:

```
http://127.0.0.1:8000
```

포트를 바꾸려면:

```powershell
py server.py --host 127.0.0.1 --port 8080
```

> `git init -b master` 의 `-b master` 가 안 되는 구버전 git 이면:
> `git init` 후 `git branch -m master` 로 브랜치 이름을 master 로 맞추세요.

---

## 3. 초기 검증 (일부 FAIL 이 정상입니다)

starter 상태에서 검증 스크립트를 돌리면:

```powershell
py scripts/check_api.py   # FAIL 예상 (triage 규칙 미구현)
py scripts/check_dom.py   # FAIL 예상 (카드/필터/P0 강조 미구현)
py scripts/audit.py       # implementationRisk = HIGH 예상
```

**이것은 의도된 상태입니다.**
- `GET /api/health`, `GET /api/issues` 는 정상 동작합니다.
- `POST /api/triage` 는 일부러 미완성이라 `check_api` 가 FAIL 합니다.
- 프론트엔드 카드/필터/summary 가 미완성이라 `check_dom` 이 FAIL 합니다.

즉, Backend / Frontend Agent 가 **채워야 할 목표 지점**이 명확히 보이도록 설계되어 있습니다.

---

## 4. Codex-managed worktree 흐름 (사람이 git worktree add 하지 않음)

각 역할 작업장은 Codex Desktop 에서 만듭니다.

1. **새 작업** 클릭 -> 실행 위치 **새 작업 트리(worktree)** -> 환경 **환경 없음** 선택
2. **시작 branch** 선택 (아래 표)
3. 초기화 프롬프트 전송 -> managed worktree 자동 생성
4. 오른쪽 패널 **브랜치 생성** 클릭 -> 역할 branch 이름 입력
5. 같은 작업 대화에서 구현 프롬프트 실행

| 역할 | 시작 branch | 생성할 역할 branch | 하는 일 |
| --- | --- | --- | --- |
| Backend | `master` | `task/003-backend` | `server.py` 분류 로직 구현 |
| Frontend | `master` | `task/003-frontend` | 대시보드 UI 구현 |
| Integration | `task/003-backend` | `task/003-integration` | `task/003-frontend` 를 merge + 전체 검증 |
| Tester | `task/003-integration` | `task/003-tester` | 검증 후 증거 문서 생성 |

Backend 와 Frontend 는 **둘 다 master 에서 독립적으로** 시작해 동시에 진행합니다.

Final merge (사람 승인 후, Local master 에서만):

```powershell
git switch master
git merge --no-ff task/003-tester -m "merge(task_003): complete parallel issue console implementation"
py scripts/check_api.py
py scripts/check_dom.py
py scripts/audit.py
py server.py
```

---

## 5. 최종 완성 상태 (목표)

- `py scripts/check_api.py`  -> PASS
- `py scripts/check_dom.py`  -> PASS
- `py scripts/audit.py`      -> implementationRisk = LOW
- 브라우저에서 이슈 카드가 표시됨 / P0·P1·P2 summary 표시 / 필터 동작 / P0 카드 강조
- approval draft 의 status 는 항상 `pending`, recommendation 은 `approve_candidate`

---

## 6. 주의사항

- Backend 는 `server.py` + `docs/task_003/backend/report.md` 만 수정한다.
- Frontend 는 `index.html`, `src/app.js`, `src/styles.css` + `docs/task_003/frontend/report.md` 만 수정한다.
- Integration 은 구현 파일을 직접 고치지 않고, merge + `docs/task_003/integration/report.md` 만 작성한다.
- Tester 는 코드를 수정하지 않고 `docs/task_003/test/` 아래 증거만 생성한다.
- `data/issues.json`, `scripts/`, `tasks/acceptance.json` 은 수정 금지.
- approval draft 는 항상 pending. 자동 승인 없음.
- 최종 merge 는 사람이 Local master 에서 한다. `git push` 는 하지 않는다.

---

## 7. 스크립트 요약

| 스크립트 | 역할 |
| --- | --- |
| `check_api.py` | server.py 를 임의 포트로 띄워 API 검증 (PASS/FAIL, 파일 미생성) |
| `check_dom.py` | index.html/app.js/styles.css 정적 검증 (PASS/FAIL, 파일 미생성) |
| `audit.py` | check_api + check_dom -> implementationRisk 산출. `--out <path>` 로 audit.json 저장(Tester 선택) |

report 와 approval 은 스크립트가 아니라 **Agent 가 직접** `docs/task_003/<role>/` 아래에 작성합니다.
patch 파일은 만들지 않습니다 — Git diff 와 commit 이 이미 변경 증거입니다.
