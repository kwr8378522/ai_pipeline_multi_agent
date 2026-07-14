# 05 MVP Implementation Plan

> 작성자: Main Lead
> 입력: `01_research_report.md`, `02_reviewer_report.md`, `03_test_questions_and_plan.md`, `03A_test_answers.md`, `04_builder_diff_plan.md`
> 성격: 실습 2에서 사람이 그대로 구현할 수 있는 최소 구현 계획서. **실습 1에서는 실제 앱 코드를 작성하지 않는다.**
> 제약: 외부 npm 패키지 미사용(브라우저 순수 HTML/CSS/JS + 테스트는 Node.js 기본 모듈만), 실제 민감정보/실제 조직명 미사용.

---

## 1. 원래 아이디어

코드 변경 요청을 입력하면 **우선순위(P0/P1/P2), 리뷰 필요 여부, 담당 역할, 다음 액션**을 보여주는 1페이지 웹앱.

**⚠️ 팀 검토 중 기능 정체성이 조정됨 (Reviewer P0-1):**
Research(01)는 "키워드 기반 자동 판정 엔진"을 MVP로 추천했으나, Tester의 질문 5개에 대한 교육생 답변(`03A_test_answers.md`)에서 네 항목을 **모두 사용자가 직접 입력/선택하는 수동 방식**으로 확정했다. 그 결과 앱의 성격이 **"자동 분류기" → "수동 입력 폼 + 저장된 이력 목록 뷰어"**로 바뀌었다. 이는 교육생이 명시적으로 선택한 방향이며, 본 계획서의 모든 범위·설계는 이 최종 결정을 기준으로 한다. (원래의 "입력하면 자동으로 보여준다"는 자동 판정 가치는 이번 MVP에서 의도적으로 제외되었음을 기록해 둔다.)

교육생 답변 요약(`03A_test_answers.md`):

| 항목 | 결정 |
|---|---|
| 빈 입력 | 저장하지 않음 (안내만 표시) |
| 우선순위 P0/P1/P2 | 사용자가 직접 선택(수동), 자동 규칙 미사용 |
| 리뷰 필요 여부 | 체크박스로 사용자가 직접 입력 |
| 담당 역할 / 다음 액션 | 고정 목록에서 선택 |
| localStorage 저장 | 포함 (새로고침 후에도 이전 입력 목록 유지) |

---

## 2. MVP 범위

한 화면(1페이지)에서 아래를 수행한다.

**입력 폼 (모두 수동 입력)**
- 코드 변경 요청 텍스트: `<textarea>` — **유일한 필수 필드**
- 우선순위: 라디오 버튼 `P0` / `P1` / `P2` (기본값 `P2` 선택)
- 리뷰 필요 여부: 체크박스 (미체크 = 리뷰 불필요가 기본값)
- 담당 역할: `<select>` 고정 목록 `Frontend` / `Backend` / `QA` / `Infra` (첫 옵션 기본값)
- 다음 액션: `<select>` 고정 목록 `즉시 수정` / `리뷰 요청` / `백로그 등록` (첫 옵션 기본값)
- 제출 버튼

**동작**
- 제출 시 텍스트 필드 검증 → 비어있거나 공백만이면 저장하지 않고 안내 문구 표시
- 검증 통과 시 입력값을 **가공 없이 그대로** 레코드로 만들어 localStorage에 저장
- 저장된 요청 목록을 화면 하단에 카드 목록으로 표시 (우선순위/리뷰 필요/역할/다음 액션 포함)
- 페이지 로드/새로고침 시 localStorage에서 이전 목록을 복원 (최근 20건, 최신순)

**비기능 요건**
- 외부 npm 패키지·서버·DB 없음. 순수 HTML/CSS/JS 파일 4개로 완결
- 저장 로직은 storage 백엔드를 주입 가능한 구조로 설계 → 브라우저 없이 Node.js 테스트 가능

---

## 3. 제외 범위

Research(01) "제외할 기능" + Reviewer(02) 리스크 조정 결과를 종합.

- 실제 코드 diff/AST 파싱·정적 분석
- **키워드 기반 자동 우선순위/리뷰 필요 여부 분류** (교육생 답변으로 수동 입력이 확정되어 불필요 — `classifier.js`/`determinePriority`/`matchedKeywords` 등 폐기)
- LLM/외부 API 연동
- 사용자 인증, 다중 사용자
- 실제 조직도/실제 팀원 자동 배정 연동
- 알림(이메일/슬랙 등) 발송
- 다국어 지원, 반응형 디자인 고도화
- **이력 개별 삭제 / 전체 초기화 기능** (localStorage 저장은 포함하되, 삭제/초기화는 Reviewer P1-1에 따라 범위 제외 — 범위 확대 방지)
- 이력 페이지네이션, 20건 초과 알림, 저장 스키마 버전 관리
- DOM 렌더링 자동 테스트 (수동 확인 항목으로 분리, Tester 반영 조건 2)

---

## 4. 구현 단계

Builder(04) 구현 순서를 그대로 채택. 5단계.

1. **`index.html` 폼 뼈대** — `<textarea>` + 우선순위 라디오(P0/P1/P2, 기본 P2) + 리뷰 체크박스 + 역할 `<select>`(Frontend/Backend/QA/Infra) + 다음 액션 `<select>`(즉시 수정/리뷰 요청/백로그 등록) + 제출 버튼(`#submit-btn`) + 빈 입력 안내 영역(`#empty-hint`) + 이력 컨테이너(`#history-list`). `storage.js` → `app.js` 순으로 `<script>` 로드, `styles.css` `<link>` 연결.
2. **`storage.js` 구현** — `STORAGE_KEY`, `MAX_ENTRIES(20)` 상수 + `loadEntries`/`saveEntries`/`addEntry` (storage 백엔드 주입 파라미터, try/catch 폴백, 최신순 정렬·20건 상한). DOM 의존 없음.
3. **`app.js` 폼 로직** — `validateInput`(텍스트만 검증) + `collectFormValues` + `buildEntry` + `handleSubmit` 연결. 빈 입력 시 저장하지 않고 안내만 표시.
4. **`app.js` 초기 로드/렌더** — `init()`에서 `loadEntries()` → `renderHistoryList()` 호출, 폼에 `handleSubmit` 바인딩. 새로고침 후에도 최신순 20건 유지 확인.
5. **`styles.css`** — 폼/목록 레이아웃 + 우선순위 색상 클래스(`.priority-p0/p1/p2`). 최소 가독성만.

> 각 단계 종료 후 실습 2에서 `node scripts/update-board.js <stage> done`으로 진행 상태를 기록하는 것을 권장.

---

## 5. 테스트 기준

Tester(03) 확정본 + Reviewer(02) Tester 반영 조건 준수. **외부 프레임워크 없이 Node.js 내장 `assert`(또는 `node:test`)만 사용.** 실행: `node --test test/` 또는 `node test/<파일>.js`.

핵심 전제: 자동 분류가 없으므로 테스트 무게중심은 "분류 정확성"이 아니라 **검증 / 값 보존 / 저장·조회**이다. `storage.js`가 storage 백엔드를 주입받는 구조(§6)이므로 브라우저 없이 순수 JS mock으로 테스트 가능하다.

**테스트 파일 3개**

- **`test/validate-input.test.js`** (빈 입력, 답변 Q1)
  - `""` → 저장 거부(false/안내 플래그)
  - `"   "`(공백만) → 저장 거부
  - `"결제 API 응답 지연 개선 필요"` → 통과(true)

- **`test/build-record.test.js`** (값 보존 + 고정 목록 검증, 답변 Q2·3·4)
  - 사용자가 고른 `priority`/`reviewNeeded`/`role`/`nextAction`을 **재판정 없이 그대로** 레코드에 보존
  - `priority` ∉ {P0,P1,P2} → 에러/거부, `role` ∉ {Frontend,Backend,QA,Infra} → 에러/거부, `nextAction` ∉ {즉시 수정,리뷰 요청,백로그 등록} → 에러/거부
  - `reviewNeeded`는 boolean

- **`test/storage.test.js`** (저장/조회, 답변 Q5) — in-memory mock 주입
  - 빈 상태 조회 → `[]`
  - 1건 저장 후 조회 → 필드값 동일한 1건
  - 다건 연속 저장 → 누적, 최신순 정렬 유지
  - "새로고침" 시뮬레이션(별도 조회 호출) → 데이터 유지
  - 20건 초과 저장 → 오래된 항목이 잘려 20건만 유지
  - 손상 데이터(`getItem`이 잘못된 JSON 반환) → 빈 배열 폴백(에러 아님)

**mock storage (Node.js 기본 모듈만, 외부 패키지 없음)** — 테스트 파일에서 아래 형태의 순수 JS 객체를 직접 만들어 `loadEntries/saveEntries/addEntry`의 storage 인자로 주입한다(이것은 계획 예시이며 실제 코드는 실습 2에서 작성):

```
// 개념 설계 (의사 구조) — 클로저로 내부 store 보관
function createMockStorage(seed) {
  const store = { ...seed };        // { key: jsonString }
  return {
    getItem: (k) => (k in store ? store[k] : null),
    setItem: (k, v) => { store[k] = String(v); },
  };
}
```

**PASS/FAIL**
- PASS: 모든 `assert` 통과 + 프로세스 종료 코드 0
- FAIL: AssertionError, 또는 함수가 예상 타입/값과 다른 결과(값 임의 변경, 고정 목록 밖 값 통과, 레코드 누락/순서 오류 등)

---

## 6. 구현 Diff 계획

Builder(04) 최종 확정본(Reviewer 피드백까지 반영 완료) 요약. 상세는 `../reports/04_builder_diff_plan.md`.

**파일 4개** (자동 분류용 `classifier.js`는 폐기)

| 파일 | 책임 |
|---|---|
| `index.html` | 입력 폼(텍스트/라디오/체크박스/select 2개) + 이력 목록 영역. 스크립트 로드 순서 storage.js → app.js |
| `storage.js` | localStorage 저장/조회. **DOM 의존 없음** → 단독 테스트 가능 |
| `app.js` | 폼 값 수집·검증, storage 호출, 목록 렌더링, 초기 로드 |
| `styles.css` | 폼/목록 레이아웃 + 우선순위 색상. 최소 스타일 |

**데이터 계약 (storage.js ↔ app.js 유일한 contract)**

```
// ChangeRequestEntry (localStorage key: "changeRequestEntries", 값: 배열)
{
  id:         string,   // Date.now().toString() 등 간단 식별자 (외부 UUID 미사용)
  text:       string,   // 요청 텍스트 (필수, 검증 통과분만)
  priority:   "P0" | "P1" | "P2",              // 라디오 선택
  needsReview: boolean,                         // 체크박스 (기본 false)
  role:       "Frontend" | "Backend" | "QA" | "Infra",   // select 고정 목록(확정)
  nextAction: "즉시 수정" | "리뷰 요청" | "백로그 등록",   // select 고정 목록(확정)
  createdAt:  string    // ISO 타임스탬프, 최신순 정렬 기준
}
// 배열은 항상 createdAt 내림차순 정렬, 최대 20건(MAX_ENTRIES) 보관
```

**함수 시그니처 (구현 대상, 실제 본문은 실습 2에서 작성)**

- `storage.js` — Reviewer P0-3/P1-1/P1-5 반영, 모두 storage 주입 가능
  - `loadEntries(storage = window.localStorage): ChangeRequestEntry[]` — `getItem` → `try { JSON.parse } catch { return [] }`, 배열 아니면 `[]` 폴백
  - `saveEntries(entries, storage = window.localStorage): void` — `setItem(STORAGE_KEY, JSON.stringify(entries))`
  - `addEntry(entry, storage = window.localStorage): ChangeRequestEntry[]` — 로드 → 추가 → 최신순 정렬 → 앞에서 20건 slice → 저장 → 반환
- `app.js`
  - `validateInput(text): boolean` — trim 후 빈 문자열이면 false (**텍스트만 필수**, 나머지는 UI 기본값 존재 → 검증 불필요, Reviewer P1-4)
  - `collectFormValues(): {text, priority, needsReview, role, nextAction}`
  - `buildEntry(formValues): ChangeRequestEntry` — `id`/`createdAt` 부여
  - `handleSubmit(event)` — 수집 → 검증 실패 시 `#empty-hint` 표시 후 종료 / 성공 시 `addEntry` → 재렌더 → 폼 초기화
  - `renderHistoryList(entries)` — `#history-list` 비우고 카드 재생성(우선순위 클래스 적용). 정렬·상한은 storage에서 이미 적용됨 전제
  - `init()` — `DOMContentLoaded` 시 `loadEntries()` → `renderHistoryList()`, 폼 바인딩

**확정 정책**
- 필수 필드: `text`만
- 이력: 최신순, 최대 20건, 삭제/초기화 없음
- 파싱 방어: `loadEntries` try/catch + 빈 배열 폴백
- 우선순위 UI: 라디오(드롭다운 아님)

---

## 7. 리스크와 대응

Reviewer(02)의 P0/P1/P2 전 항목에 대한 현재 처리 상태.

| # | 리스크 | 등급 | 대응 / 상태 |
|---|---|---|---|
| P0-1 | 자동 분류 제거로 "입력→자동 판정" 정체성 상실 | P0 | 교육생이 명시 선택한 트레이드오프. §1에 변경 사유 명문화 → **해소(문서화)** |
| P0-2 | Research가 제외했던 localStorage 이력 저장 재포함 | P0 | 교육생 Q5 답변에 따른 의도적 재포함. 삭제/초기화·페이지네이션 제외로 시간 예산 상쇄(§3) → **해소(범위 조정)** |
| P0-3 | localStorage(브라우저 API)를 Node 기본 모듈로 테스트 불가 위험 | P0 | storage 백엔드 주입 인터페이스(`getItem/setItem`) + 순수 JS mock으로 해결(§5·§6) → **해소(설계)** |
| P1-1 | 이력 개수/정렬/삭제 미정 | P1 | 최신순·20건·삭제 없음으로 확정(§3·§6) → 해소 |
| P1-2 | 역할/다음 액션 고정 목록 미확정 | P1 | Frontend/Backend/QA/Infra, 즉시 수정/리뷰 요청/백로그 등록으로 확정(§2·§6) → 해소 |
| P1-3 | Builder 초안에 자동 분류 함수 잔존 | P1 | `classifier.js` 전체 삭제로 해소(04 갱신 이력 1) → 해소 |
| P1-4 | 필수 입력 범위 불명확 | P1 | 텍스트 필드만 필수로 확정(§6) → 해소 |
| P1-5 | 손상 JSON 방어 없음 | P1 | `loadEntries` try/catch + 빈 배열 폴백(§6) → 해소 |
| P2-1 | 우선순위 UI 타입 미정 | P2 | 라디오 버튼으로 확정 → 해소 |
| P2-2 | `file://` vs 정적 서버 시 localStorage 동작 차이 | P2 | **잔여** — §8에서 정적 서버 실행 권장으로 완화 |
| P2-3 | localStorage quota 초과 | P2 | 20건 상한으로 사실상 완화 → 해소 |

> 남은 실질 리스크는 P2-2(실행 환경) 하나이며, §8의 실행 방법 권장으로 완화한다.

---

## 8. 실습 2 전달 메모

- **함께 볼 문서**: 본 계획서 + `../reports/04_builder_diff_plan.md`(파일별 책임·데이터 구조·함수) + `../reports/03_test_questions_and_plan.md`(테스트 파일·PASS/FAIL).
- **구현 착수 지점**: `storage.js`의 **storage 주입 구조(§6)를 먼저 구현**할 것. 이 구조가 없으면 Node.js 테스트에서 `window.localStorage`가 없어 `storage.test.js`가 전부 실패한다. Reviewer Tester 반영 조건 4(저장/조회 테스트가 브라우저 없이 실행 가능한지 Builder와 교차 확인)를 구현 초반에 반드시 확인.
- **실행 방법(P2-2 대응)**: `file://`로 직접 여는 것보다 **정적 서버 서빙 권장** — 예: `node scripts` 스타일의 내장 `http` 서버, 또는 VSCode Live Server. localStorage가 `file://`에서 브라우저별로 다르게 동작할 수 있음.
- **조정 여지(구조 변경 없음)**: 역할/다음 액션 문구는 `<select>` 옵션 텍스트만, 이력 상한은 `MAX_ENTRIES` 상수만 바꾸면 됨.
- **테스트 원칙**: 순수 로직(검증/레코드/저장·조회)만 자동화, DOM 렌더링은 수동 확인. 엣지 케이스에 빈 입력·손상 데이터·20건 초과·고정 목록 밖 값 복원 포함(Tester 반영 조건 3).
- **금지 재확인**: 외부 npm 패키지 금지(mock도 순수 JS로 손수 작성), 실제 앱 코드는 실습 2에서 작성. 실습 1 산출물은 계획까지다.
