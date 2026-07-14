# 실습 1 — macOS 실행 안내

macOS 교육생은 **`auto`**(기본) 또는 **`tmux`**(옵션)로 진행할 수 있습니다.
tmux를 쓰면 teammate별 pane이 분리되어 더 직관적입니다.

---

## 0-A. 시작 (기본: auto)

```bash
cd ~/Desktop/NEW_LECTURE/practice1_starter_kit/main_claude_project
node scripts/validate-starter-kit.js
claude --teammate-mode auto
```

## 0-B. 시작 (옵션: tmux)

```bash
cd ~/Desktop/NEW_LECTURE/practice1_starter_kit/main_claude_project
node scripts/validate-starter-kit.js
tmux new -s cc-team
claude --teammate-mode tmux
```

- `validate-starter-kit.js`의 마지막 줄이 `RESULT: STARTER_KIT_PASS`인지 확인합니다.
- tmux가 없다면 `brew install tmux`로 설치합니다.

---

## 1. `/agents`로 subagent 4개 만들기

Claude Code가 열리면 `/agents`를 입력합니다.

1. `/agents` → **New agent** → scope는 **Project**로 선택
2. 아래 4개를 각각 만듭니다. 프롬프트는 `agent_prompts/*.md`의 코드블록을 복사해 붙여넣습니다.

| 이름 | 복사할 프롬프트 파일 |
| --- | --- |
| `mx-research-agent` | `agent_prompts/mx-research-agent.md` |
| `mx-reviewer-agent` | `agent_prompts/mx-reviewer-agent.md` |
| `mx-test-agent` | `agent_prompts/mx-test-agent.md` |
| `mx-builder-agent` | `agent_prompts/mx-builder-agent.md` |

> 4개를 다 만든 뒤 Claude Code를 한 번 종료하고 다시 실행하면 인식이 안정적입니다.

---

## 2. 팀 실행

`practice1_marp.md`의 "Main 실행 프롬프트 1 — 팀 생성"을 그대로 붙여넣습니다.

### tmux pane 조작법

| 행동 | 방법 |
| --- | --- |
| pane 이동 | 마우스 클릭 또는 `Ctrl+b` 후 방향키 |
| 세션 분리 | `Ctrl+b` → `d` |
| 다시 붙기 | `tmux attach -t cc-team` |
| 세션 목록 | `tmux ls` |

`auto` 모드에서는 teammate 목록에서 방향키로 선택하고 Enter로 transcript에 들어갑니다.

---

## 3. tester 질문에 답하기

- tmux: **tester pane**을 클릭한 뒤 질문 아래에 답변을 입력합니다.
- auto: teammate 목록에서 **tester**를 선택하고 Enter로 들어가 답변합니다.

그다음 "Main 실행 프롬프트 2 — Tester 답변 저장 요청"을 Main(lead)에 붙여넣습니다.

---

## 4. 최종 계획서 생성

"Main 실행 프롬프트 3 — 최종 계획서 작성"을 Main에 붙여넣습니다.
`../agent_shared/specs/05_mvp_implementation_plan.md`가 생성됩니다.

---

## 5. 검증과 대시보드

```bash
node scripts/status.js
node scripts/render-dashboard.js
node scripts/validate-practice1.js
open ../agent_shared/dashboard/practice1_dashboard.html
```

- `validate-practice1.js`의 마지막 줄이 `RESULT: PRACTICE1_PASS`이면 실습 1 완료입니다.

---

## tmux 세션 정리 (선택)

```bash
tmux ls
tmux attach -t cc-team
# 분리: Ctrl+b d
```

> tmux는 선택 사항입니다. `auto` 모드만으로도 실습 1을 완료할 수 있습니다.
