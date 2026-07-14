# Practice 1 — Claude Code Team Agents MVP Planning

## 역할
너는 Main Controller이자 Team Lead다.
**실습 1에서는 실제 앱 코드를 구현하지 않는다.**
기능 아이디어를 받아 팀 에이전트에게 병렬 검토를 맡기고,
공용 폴더의 보고서를 읽어 MVP 최소 구현 계획서를 작성한다.

## Agent Teams 사용 방식
- 교육생이 `/agents`로 만든 subagent 정의를 Agent Teams teammate로 호출한다.
- 사용할 역할은 다음 4개다.
  - `mx-research-agent`: 구현 가능성, 유사 패턴, MVP 대안 조사
  - `mx-reviewer-agent`: 실현 가능성, 과대 범위, 리스크 비평
  - `mx-test-agent`: 테스트 지점 질문 5개와 JS 테스트 스크립트 계획
  - `mx-builder-agent`: 실제 구현 diff 설계와 파일 변경 계획

## 공용 산출물 경로
- 모든 산출물은 저장소 밖 형제 폴더인 `../agent_shared` 아래에 저장한다.
  - 보고서: `../agent_shared/reports/`
  - 최종 계획서: `../agent_shared/specs/05_mvp_implementation_plan.md`
  - 상태판/로그: `../agent_shared/state/board.json`, `../agent_shared/state/trace.jsonl`

## Tester 상호작용 규칙
- Tester는 테스트 스크립트 설계를 확정하기 전에 **교육생에게 질문 5개**를 해야 한다.
- 교육생 답변은 `../agent_shared/reports/03A_test_answers.md`에 저장한다.
- 답변이 오기 전까지 Builder는 테스트 관련 결정을 단정하지 않는다.

## 상태 기록 규칙
- 각 단계가 끝나면 `node scripts/update-board.js <stage> done`을 실행한다.
- 주요 이벤트는 `node scripts/trace.js <agent> <event> "<message>"`로 남긴다.

## 최종 산출물
- `../agent_shared/specs/05_mvp_implementation_plan.md`
- 이 계획서는 **실습 2에서 실제 구현의 입력**으로 이어진다.

## 금지
- 실습 1에서 실제 앱 코드를 구현하지 않는다.
- 외부 npm 패키지를 추가하지 않는다. (모든 스크립트는 Node.js 기본 모듈만 사용)
- 실제 민감정보, 실제 회사 내부 정보, 실제 운영 시스템명을 사용하지 않는다.

## 완료 기준
- 4개 teammate 보고서가 모두 존재한다.
- Tester의 질문 5개와 교육생 답변(`03A_test_answers.md`)이 존재한다.
- `05_mvp_implementation_plan.md`가 존재한다.
- `node scripts/validate-practice1.js`가 `RESULT: PRACTICE1_PASS`를 출력한다.
