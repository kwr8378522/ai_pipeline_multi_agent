# 실습 1 — 가장 먼저 읽어주세요

## 실습 1의 목표
기능 아이디어 1개를 입력해서, `/agents`로 만든 역할별 subagent를
**Agent Teams teammate**로 실행하고, researcher / reviewer / tester / builder가
병렬로 검토한 결과를 Main Claude가 종합해
**MVP 최소 구현 계획서(`05_mvp_implementation_plan.md`)**를 만드는 실습입니다.

> 실습 1은 "코드 구현 실습"이 아닙니다.
> 구현은 실습 2에서 이 계획서를 그대로 이어받아 진행합니다.

---

## 교육생이 직접 만들지 않아도 되는 것 (이미 스타터킷에 포함)
- 폴더 구조 (`main_claude_project`, `agent_shared`)
- `CLAUDE.md` (Team Lead 규칙)
- `.claude/settings.local.json` (Agent Teams 설정)
- `scripts/*.js` (상태/검증/대시보드 스크립트 7개)
- `agent_shared`의 초기 `board.json`, `trace.jsonl`

## 교육생이 직접 해야 하는 것
1. 스타터킷 폴더로 이동한다.
2. `node scripts/validate-starter-kit.js`로 킷 상태를 확인한다.
3. Claude Code를 실행한다.
4. `/agents`로 subagent 4개를 직접 만든다. (프롬프트는 `main_claude_project/agent_prompts/*.md`에서 복사)
5. Main 실행 프롬프트를 붙여넣어 팀을 돌린다.
6. tester가 던지는 질문 5개를 확인한다.
7. tester teammate로 직접 들어가 답변한다.
8. Main Claude에게 답변 반영 + 최종 계획서 생성을 요청한다.
9. `node scripts/validate-practice1.js`로 산출물을 검증한다.
10. `node scripts/render-dashboard.js`로 대시보드를 생성하고 연다.

---

## 폴더 구조
```text
practice1_starter_kit/
├─ README_FIRST.md      <- 지금 이 문서
├─ WINDOWS_RUN.md       <- Windows 교육생용 실행 안내
├─ MAC_RUN.md           <- macOS 교육생용 실행 안내
├─ main_claude_project/ <- Claude Code는 반드시 이 폴더에서 실행
│  ├─ CLAUDE.md
│  ├─ .claude/
│  │  ├─ settings.local.json
│  │  └─ agents/           (비어 있음. /agents로 직접 생성)
│  ├─ agent_prompts/       (복사용 프롬프트 4개)
│  └─ scripts/             (JS 스크립트 7개)
└─ agent_shared/        <- 저장소 밖 공용 산출물 폴더 (형제 폴더)
   ├─ state/  (board.json, trace.jsonl)
   ├─ reports/
   ├─ specs/
   └─ dashboard/
```

---

## 자기 환경에 맞는 문서를 보세요
- Windows 교육생: **`WINDOWS_RUN.md`** (기본 방식: `in-process`)
- macOS 교육생: **`MAC_RUN.md`** (기본 방식: `auto`, 옵션: `tmux`)

> 이 실습의 모든 스크립트는 **Node.js 기본 모듈만** 사용합니다.
> `npm install`이 필요 없고, 외부 패키지도 설치하지 않습니다.

---

## 실습 완료 기준
`main_claude_project`에서 아래를 실행합니다.

```text
node scripts/validate-practice1.js
```

마지막 줄이 아래와 같으면 완료입니다.

```text
RESULT: PRACTICE1_PASS
```

> 참고: 실습을 시작하기 전 초기 상태에서 이 검증을 돌리면
> `RESULT: PRACTICE1_FAIL`이 나옵니다. **이것은 정상입니다.**
> (아직 reports/specs가 비어 있기 때문입니다.)
> 반대로 `node scripts/validate-starter-kit.js`는 처음부터
> `RESULT: STARTER_KIT_PASS`가 나와야 합니다.
