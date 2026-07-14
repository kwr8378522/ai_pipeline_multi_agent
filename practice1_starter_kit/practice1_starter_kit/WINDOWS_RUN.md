# 실습 1 — Windows 실행 안내

Windows 교육생의 기본 실행 방식은 **`in-process`**입니다.

> Windows Terminal에서는 split-pane 방식의 teammate 표시가 직관적이지 않을 수 있어,
> 한 터미널 안에서 teammate 목록을 보고 선택하는 `in-process`를 기본으로 사용합니다.

---

## 0. 시작 (PowerShell)

```powershell
Set-Location C:\Users\computer\Desktop\NEW_LECTURE\practice1_starter_kit\main_claude_project
node scripts\validate-starter-kit.js
claude --teammate-mode in-process
```

- `validate-starter-kit.js`의 마지막 줄이 `RESULT: STARTER_KIT_PASS`인지 확인합니다.
- 압축을 다른 위치에 풀었다면 첫 줄의 경로만 자기 위치에 맞게 바꿉니다.

---

## 1. `/agents`로 subagent 4개 만들기

Claude Code가 열리면 `/agents`를 입력합니다.

1. `/agents` → **New agent** → scope는 **Project**로 선택
2. 아래 4개를 각각 만듭니다. 프롬프트는 `agent_prompts\*.md`의 코드블록을 복사해 붙여넣습니다.

| 이름 | 복사할 프롬프트 파일 |
| --- | --- |
| `mx-research-agent` | `agent_prompts\mx-research-agent.md` |
| `mx-reviewer-agent` | `agent_prompts\mx-reviewer-agent.md` |
| `mx-test-agent` | `agent_prompts\mx-test-agent.md` |
| `mx-builder-agent` | `agent_prompts\mx-builder-agent.md` |

> 4개를 다 만든 뒤 Claude Code를 한 번 종료하고 다시 실행하면 인식이 안정적입니다.
> ```powershell
> claude --teammate-mode in-process
> ```

---

## 2. 팀 실행

`practice1_marp.md`의 "Main 실행 프롬프트 1 — 팀 생성"을 그대로 붙여넣습니다.
teammate 4명이 병렬로 검토를 시작합니다.

### in-process teammate 조작법

| 행동 | 방법 |
| --- | --- |
| teammate 선택 | 방향키 ↑ / ↓ |
| transcript 열기 | Enter |
| 해당 teammate에게 답변 | 열린 화면에서 그대로 입력 |
| lead로 돌아오기 | Escape |
| task list 보기 | Ctrl+T |

---

## 3. tester 질문에 답하기

1. agent panel에서 **tester** row를 방향키로 선택합니다.
2. **Enter**로 transcript를 엽니다.
3. tester가 던진 질문 5개 아래에 그대로 답변을 입력합니다.
4. **Escape**로 lead(Main)로 돌아옵니다.

그다음 "Main 실행 프롬프트 2 — Tester 답변 저장 요청"을 Main에 붙여넣습니다.

---

## 4. 최종 계획서 생성

"Main 실행 프롬프트 3 — 최종 계획서 작성"을 Main에 붙여넣습니다.
`../agent_shared/specs/05_mvp_implementation_plan.md`가 생성됩니다.

---

## 5. 검증과 대시보드

```powershell
node scripts\status.js
node scripts\render-dashboard.js
node scripts\validate-practice1.js
start ..\agent_shared\dashboard\practice1_dashboard.html
```

- `validate-practice1.js`의 마지막 줄이 `RESULT: PRACTICE1_PASS`이면 실습 1 완료입니다.

---

## 자주 겪는 문제

| 증상 | 먼저 볼 것 | 해결 |
| --- | --- | --- |
| agent가 안 보임 | `/agents` 목록 | Claude Code 재시작 |
| 파일이 안 생김 | 현재 폴더 | `main_claude_project`에서 실행 중인지 확인 |
| 스크립트 실패 | 실행 위치 | `Set-Location`으로 `main_claude_project` 이동 |
| tester 질문을 못 찾음 | agent panel | tester row 선택 → Enter |

> WSL2 + tmux는 옵션입니다. 강의장 기본값은 Windows Terminal + `in-process`입니다.
