# 06 Builder Implementation Report

> 작성자: Builder (worktree=`builder_worktree`, branch=`practice2/builder`)
> 입력: `05_mvp_implementation_plan.md`, `01_research_report.md`, `02_reviewer_report.md`, `03A_test_answers.md`, `04_builder_diff_plan.md`
> 구현 표면: static_web_mvp (1페이지: 입력 → 처리 → 결과 표시)

## 1. 구현 요약

계획서(05)의 최종 결정 — **"수동 입력 폼 + localStorage 이력 목록 뷰어"** — 를 그대로 구현했다.
자동 분류(`classifier.js`)는 계획대로 폐기했고, 우선순위/리뷰 필요/역할/다음 액션은 모두 사용자가 직접 선택한다.

## 2. 만든 파일 (4개)

| 파일 | 책임 |
|---|---|
| `index.html` | 입력 폼(textarea + 우선순위 라디오 + 리뷰 체크박스 + 역할/다음액션 select) + 이력 목록 영역. 스크립트 로드 순서 `storage.js` → `app.js` |
| `storage.js` | localStorage 저장/조회. storage 백엔드 주입 가능, try/catch 폴백, 최신순·20건 상한. **DOM 의존 없음** |
| `app.js` | 폼 값 수집·검증·레코드 생성·목록 렌더·초기 로드 |
| `styles.css` | 폼/목록 레이아웃 + 우선순위 색상(`.priority-p0/p1/p2`) |

> 계획서 §4의 예시 표기(`src/app.js` 등 `src/` 경로, `package.json`)와 달리, 04/05 §6 확정본의 **플랫 파일 구조**(`storage.js`/`app.js`)를 정본으로 채택했다. 외부 npm 의존이 없어 `package.json`은 불필요하다.

## 3. 앱 계약 (데이터 contract)

localStorage key = `changeRequestEntries`, 값 = `ChangeRequestEntry[]` (createdAt 내림차순, 최대 20건):

```
{ id, text, priority:"P0"|"P1"|"P2", needsReview:boolean,
  role:"Frontend"|"Backend"|"QA"|"Infra",
  nextAction:"즉시 수정"|"리뷰 요청"|"백로그 등록", createdAt:ISO string }
```

- **리뷰 필드명은 `needsReview`로 확정**(04/05 §6 데이터 계약 기준). 03 초안 표의 `reviewNeeded` 표기와 상충하던 부분을 정본에 맞춰 정리했다. Tester는 `needsReview`를 기준으로 검증할 것.

## 4. 계약 이행 체크 (테스트가 검사할 약속)

- [x] 필수 필드는 `text`만 — 빈/공백 입력은 저장하지 않고 `#empty-hint` 안내만 표시 (`validateInput`)
- [x] 사용자가 고른 priority/needsReview/role/nextAction을 **재판정 없이 그대로** 레코드에 보존 (`buildEntry`)
- [x] 고정 목록 밖 값(priority ∉ {P0,P1,P2}, role ∉ {…}, nextAction ∉ {…})은 `buildEntry`가 throw로 거부, `needsReview`는 boolean 강제
- [x] `storage.js`는 `{getItem,setItem}` 주입 가능 → 브라우저 없이 Node 테스트 가능 (기본값 `window.localStorage`)
- [x] `loadEntries` try/catch + 빈 배열 폴백 (손상 JSON 방어)
- [x] `addEntry` 최신순 정렬 + `MAX_ENTRIES=20` 상한
- [x] 사용자 입력은 `innerHTML`이 아니라 `textContent`로만 렌더 (XSS 방지)
- [x] 외부 npm 패키지 없음 (순수 HTML/CSS/JS)
- [x] 삭제/전체 초기화 기능 없음 (Reviewer P1-1, 범위 확대 방지)

## 5. 셀프 스모크 확인 (참고)

Node에서 모듈 로드 및 핵심 함수 동작 확인:
- `require('./storage.js')`, `require('./app.js')` 로드 성공 (UMD 패턴, DOM 없이 로드됨)
- `buildEntry(...)` → 값 보존 레코드 반환, `addEntry(entry, mockStorage)` → 저장 후 배열 반환 확인

> 정식 테스트(파일 스모크 / contract / storage)는 **Tester가 tester_worktree에서 작성·실행**한다. Builder는 테스트 파일을 만들지 않는다.

## 6. 제외/보류 (계획 범위 밖)

- 자동 분류, LLM/API 연동, 인증/다중 사용자, 알림, 페이지네이션, 이력 삭제/초기화, DOM 자동 테스트
- 실행 환경 주의(P2-2): `file://` 직접 열기보다 정적 서버 서빙 권장

## 7. 금지사항 준수

- 테스트 파일 미작성 · tester report 미작성 · main merge 미수행 (모두 Builder 금지사항)
