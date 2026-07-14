# 04 Builder Diff Plan

> 갱신 이력 1: Tester 질문 5개에 대한 교육생 답변(`03A_test_answers.md`)이 도착하여 아래 내용을 반영해 갱신했다.
> 핵심 변화: 우선순위/리뷰 필요 여부는 **자동 규칙 분류가 아니라 사용자의 수동 입력**이므로, 기존 계획의 `classifier.js`(규칙 기반 자동 분류)는 제거하고, 대신 **폼 입력 + 검증 + localStorage 저장/조회**가 핵심 로직이 된다.
>
> 갱신 이력 2: Reviewer 보고서(`02_reviewer_report.md`)의 P0-3, P1-1, P1-2, P1-4, P1-5(Builder 반영 조건 2~6번)를 반영해 아래 항목을 확정/구체화했다.
> - storage 접근을 `getItem/setItem` 최소 인터페이스로 감싸고 storage 백엔드를 함수 파라미터로 주입 가능하게 조정(P0-3 / 반영 조건 2번) — Tester의 in-memory mock 주입 전제와 정합.
> - 이력 목록 개수 상한(최근 20건)과 정렬 기준(최신순, `createdAt` 내림차순)을 명시. 삭제/전체 초기화 기능은 이번 범위에서 제외(P1-1 / 반영 조건 3번).
> - 담당 역할/다음 액션 고정 목록 문자열과 우선순위 선택 UI 타입을 "예시"가 아닌 "확정"으로 명문화(P1-2 / 반영 조건 4번).
> - "빈 입력이라 저장하지 않는다"는 조건이 텍스트 필드에만 적용됨을 명시하고, 나머지 필드는 UI 기본값으로 항상 값이 채워져 있어 별도 필수 검증이 불필요함을 명시(P1-4 / 반영 조건 5번).
> - `loadEntries`의 방어 코드를 try/catch + 빈 배열 폴백으로 구체화(P1-5 / 반영 조건 6번).

## 1. 구현 대상 파일

실습 2 범위(1페이지 웹앱, 외부 npm 패키지 없이 순수 HTML/CSS/JS)를 넘지 않는 최소 파일 세트.

1. `index.html` — 1페이지 앱의 뼈대(입력 폼 + 저장된 요청 목록 표시 영역)
2. `storage.js` — localStorage 저장/조회 담당 함수 모음
3. `app.js` — 폼 값 수집, 입력 검증, `storage.js` 호출, 목록 렌더링
4. `styles.css` — 우선순위(P0/P1/P2)별 시각적 구분 및 폼/목록 레이아웃을 위한 최소 스타일

> 기존 계획에 있던 `classifier.js`(키워드 기반 자동 분류)는 **삭제**한다. 우선순위/리뷰 필요 여부/역할/다음 액션이 모두 사용자의 수동 선택이므로 별도의 분류 로직이 필요 없다. 대신 그 자리를 `storage.js`(저장/조회)가 대체한다.
> 4개 파일 외에 추가 디렉터리(예: `src/`, 프레임워크 설정, 번들러 설정)는 제안하지 않는다.

## 2. 파일별 책임

- **index.html**
  - 코드 변경 요청 텍스트를 입력받는 `<textarea>` — **유일한 필수 입력 필드**(3번 데이터 구조/4번 함수 계획 참고)
  - 우선순위 선택 UI(**확정**: 라디오 버튼, 드롭다운 아님): `<input type="radio" name="priority">` 3개(P0/P1/P2), 기본값으로 하나(P2 등 낮은 우선순위)가 항상 선택되어 있음 — 자동 분류 없음, 사용자가 직접 선택
  - 리뷰 필요 여부: `<input type="checkbox" id="needs-review">` — 체크 시 "리뷰 필요", 미체크 시 "리뷰 불필요"(미체크 상태 자체가 기본값이므로 항상 값이 존재)
  - 담당 역할: `<select id="role">` — 고정 옵션(**확정**, 예시 아님): `Frontend`, `Backend`, `QA`, `Infra`. 첫 옵션이 기본 선택값
  - 다음 액션: `<select id="next-action">` — 고정 옵션(**확정**, 예시 아님): `즉시 수정`, `리뷰 요청`, `백로그 등록`. 첫 옵션이 기본 선택값
  - 제출 버튼(`#submit-btn`)과 빈 입력 안내 문구 영역(`#empty-hint`)
  - 저장된 요청 목록을 표시할 컨테이너(`#history-list`) — 새로고침 후에도 유지되는 목록(최근 20건, 최신순 — 3번/5번 섹션 참고)
  - `storage.js`, `app.js`를 `<script>` 태그로 로드(순서: storage.js 먼저, app.js 나중)
  - `styles.css`를 `<link>`로 연결

- **storage.js**
  - localStorage 키 상수(`STORAGE_KEY`)와 이력 개수 상한 상수(`MAX_ENTRIES = 20`) 정의
  - **storage 백엔드를 주입 가능한 파라미터로 받는 최소 인터페이스**(`getItem`/`setItem`만 사용)로 감싼 저장/조회 함수 모음. 기본값은 `window.localStorage`이지만, 두 번째 인자로 `{ getItem, setItem }` 형태의 mock 객체를 넘기면 그대로 대체 가능(Reviewer P0-3, Tester의 in-memory mock 주입 전제와 합치)
  - `loadEntries`는 `try/catch`로 감싸 JSON 파싱 실패나 저장된 값이 배열이 아닌 등 형식 불일치가 발생하면 **빈 배열로 폴백**(Reviewer P1-5) — DOM 의존 없음 → 테스트 용이
  - app.js와의 경계를 명확히 분리해 Tester가 이 모듈만(실제 `window.localStorage` 없이도) 독립적으로 테스트할 수 있게 한다

- **app.js**
  - 폼 제출(submit) 이벤트 핸들러 등록
  - 폼 값 수집 및 **빈 입력 검증**(텍스트 필드만 필수 — 공백만 있거나 비어있으면 저장하지 않고 안내 문구만 표시). 우선순위/역할/다음 액션/리뷰 체크박스는 UI 기본값이 항상 선택되어 있으므로 별도 필수 검증을 하지 않는다(Reviewer P1-4)
  - 검증 통과 시 `storage.js`의 저장 함수(기본 storage 백엔드로 `window.localStorage` 사용) 호출 → 새 항목 추가, 최신순 정렬 및 20건 상한 적용은 `storage.js` 쪽 책임
  - 페이지 로드 시 `storage.js`의 조회 함수로 기존 목록을 불러와 렌더링(새로고침 후 유지 요건 충족)
  - `#history-list`에 저장된 항목들을 렌더링(우선순위/리뷰 필요 여부/역할/다음 액션 표시)
  - 이번 범위에는 **개별 삭제/전체 초기화 기능을 포함하지 않는다**(Reviewer P1-1 반영, 범위 확대 방지)

- **styles.css**
  - 폼 레이아웃(라디오/체크박스/셀렉트 정렬)
  - `#history-list` 항목 카드 레이아웃
  - 우선순위별 색상 클래스(`.priority-p0`, `.priority-p1`, `.priority-p2`)
  - 디자인 고도화는 실습 2 범위 밖 → 최소한의 가독성만 확보

## 3. 데이터 구조 초안

```js
// storage.js가 저장/조회하는 단일 항목 구조
{
  id: string,          // 생성 시각 기반 문자열(예: Date.now().toString()) 등 간단한 식별자
  text: string,         // 코드 변경 요청 텍스트 (필수 — 검증 통과한 값만 저장, 유일한 필수 필드)
  priority: "P0" | "P1" | "P2",   // 사용자가 라디오로 직접 선택 (UI 기본값 존재, 확정: 라디오 버튼)
  needsReview: true | false,       // 사용자가 체크박스로 직접 선택 (미체크=false가 기본값)
  role: "Frontend" | "Backend" | "QA" | "Infra",   // 고정 목록(확정), select 첫 옵션이 기본값
  nextAction: "즉시 수정" | "리뷰 요청" | "백로그 등록",   // 고정 목록(확정), select 첫 옵션이 기본값
  createdAt: string     // ISO 문자열 타임스탬프 (목록 정렬 기준)
}

// storage.js는 위 항목의 배열을 storage 백엔드(getItem/setItem 인터페이스)를 통해 JSON 문자열로 저장/조회한다
// key: "changeRequestEntries" (STORAGE_KEY)
// value: ChangeRequestEntry[] — 항상 createdAt 내림차순(최신순) 정렬 상태로 유지, 최대 20건(MAX_ENTRIES)까지만 보관
```

- 이전 초안의 `matchedKeywords`(자동 분류 근거)는 자동 분류가 없으므로 제거한다.
- 이 배열 구조가 `storage.js`(저장/조회)와 `app.js`(렌더링) 사이의 유일한 계약(contract)이다.
- **이력 목록 정책(확정)**: 최근 20건(`MAX_ENTRIES = 20`)까지만 유지, 정렬 기준은 `createdAt` 내림차순(최신순). 개별 삭제/전체 초기화 기능은 이번 범위에 포함하지 않는다(Reviewer P1-1).
- **필수 필드 정책(확정)**: `text`만 필수. `priority`/`needsReview`/`role`/`nextAction`은 UI에서 항상 기본값이 선택되어 있으므로("빈 값" 상태 자체가 존재하지 않음) 별도의 필수 검증 로직이 필요 없다(Reviewer P1-4).

## 4. 함수/컴포넌트 단위 계획

**storage.js** (Reviewer P0-3 / 반영 조건 2번, P1-1, P1-5 반영)
- `STORAGE_KEY` — localStorage 키 상수(`"changeRequestEntries"`)
- `MAX_ENTRIES` — 이력 개수 상한 상수(`20`)
- `loadEntries(storage = window.localStorage): ChangeRequestEntry[]` — `storage.getItem(STORAGE_KEY)`로 읽어 `try { JSON.parse(...) } catch { return [] }` 구조로 파싱. 파싱 결과가 배열이 아니거나 값이 없는 경우에도 빈 배열로 폴백(형식 불일치 방어)
- `saveEntries(entries: ChangeRequestEntry[], storage = window.localStorage): void` — 배열 전체를 JSON 문자열로 `storage.setItem(STORAGE_KEY, ...)` 호출
- `addEntry(entry: ChangeRequestEntry, storage = window.localStorage): ChangeRequestEntry[]` — `loadEntries(storage)`로 기존 목록을 불러와 새 항목을 추가 → `createdAt` 내림차순(최신순)으로 정렬 → 앞에서부터 `MAX_ENTRIES`(20)개만 남기고 자름 → `saveEntries(sliced, storage)`로 저장 → 갱신된 배열 반환
- 세 함수 모두 `storage` 인자를 **두 번째(또는 해당) 파라미터로 주입 가능**하게 하여, 실제 코드에서는 기본값 `window.localStorage`를 쓰고 Tester의 테스트 코드에서는 `{ getItem, setItem }`만 흉내 낸 순수 JS mock 객체를 넘겨 브라우저 없이 테스트할 수 있게 한다

**app.js**
- `validateInput(text: string): boolean` — trim 후 빈 문자열이면 false 반환(텍스트 필드만 필수 검증 대상, Reviewer P1-4 — 나머지 필드는 UI 기본값이 항상 존재하므로 검증 불필요)
- `collectFormValues(): {text, priority, needsReview, role, nextAction}` — 폼의 현재 입력값을 읽어 객체로 반환
- `buildEntry(formValues): ChangeRequestEntry` — 폼 값에 `id`, `createdAt`을 붙여 저장용 항목 객체 생성
- `handleSubmit(event)` — `collectFormValues()` → `validateInput()` 실패 시 `#empty-hint` 표시 후 종료(저장 안 함); 성공 시 `buildEntry()` → `storage.addEntry(entry)`(storage 인자 생략 시 기본값 `window.localStorage` 사용) 호출 → 목록 다시 렌더링 → 폼 초기화
- `renderHistoryList(entries: ChangeRequestEntry[])` — `#history-list`를 비우고 각 항목을 카드 형태로 다시 그림(우선순위 클래스 적용). `entries`는 이미 `storage.js`에서 최신순 정렬·20건 상한이 적용된 상태로 전달됨을 전제로 한다
- `init()` — 페이지 로드시(`DOMContentLoaded`) `storage.loadEntries()`로 기존 목록을 읽어 `renderHistoryList()` 호출, 폼에 `handleSubmit` 바인딩

**index.html / styles.css**
- 별도 함수 없음. 컴포넌트 단위로는 "입력 폼 영역"과 "저장된 요청 목록 영역" 2개 블록으로만 구분(기존과 동일 구조 유지, 내부 입력 필드만 자동 분류 → 수동 선택 UI로 변경).

## 5. 구현 순서

1. `index.html` 폼 뼈대 작성 — 텍스트 입력 + 우선순위 라디오(P0/P1/P2, 확정) + 리뷰 필요 체크박스 + 역할(`Frontend`/`Backend`/`QA`/`Infra`, 확정)/다음 액션(`즉시 수정`/`리뷰 요청`/`백로그 등록`, 확정) select + 제출 버튼 + 빈 입력 안내 영역 + 목록 컨테이너(`#history-list`) 배치
2. `storage.js` 구현 — `storage` 인자를 주입받는(기본값 `window.localStorage`) `loadEntries`/`saveEntries`/`addEntry`, `STORAGE_KEY`/`MAX_ENTRIES` 상수, `try/catch` 기반 파싱 오류 방어, 정렬(최신순)·상한(20건) 로직 작성(DOM 없이 독립 검증 가능하게, Tester mock 주입 전제)
3. `app.js`에서 `validateInput`(텍스트 필드만 검증) + `collectFormValues` + `handleSubmit` 연결 — 빈 입력 시 저장하지 않고 안내만 표시하도록 처리
4. `app.js`의 `init()`에서 `storage.loadEntries()`로 초기 로드 후 `renderHistoryList()` 호출 — 새로고침 후에도 이전 목록(최신순, 최대 20건)이 유지되는지 연결
5. `styles.css`로 폼/목록 레이아웃과 우선순위별 색상 스타일링

## 6. Tester 답변 반영 내역 (조정 완료)

`03A_test_answers.md` 도착 이전에는 아래 항목들이 미정이었다. 답변 반영 결과는 다음과 같다.

| 항목 | 이전 상태(미정) | 답변 반영 후 결정 | 계획 변경 사항 |
|---|---|---|---|
| 빈 입력 처리 | 미정 | 빈/공백 입력은 저장하지 않고 안내만 표시 | `validateInput` + `#empty-hint`로 반영(4번 섹션) |
| 우선순위 분류 방식 | 자동 규칙 vs 수동 선택 미정 | 자동 분류 미사용, 사용자가 라디오로 직접 선택 | `classifier.js` 전체 삭제, `index.html`에 라디오 UI 추가 |
| 리뷰 필요 여부 판정 | 자동 판정 vs 수동 입력 미정 | 체크박스로 사용자가 직접 입력 | 자동 판정 로직 없음, 폼 필드로만 처리 |
| 역할/다음 액션 형식 | 자유 텍스트 vs 고정 목록 미정 | 고정 목록에서 선택 | `<select>` 고정 옵션으로 구현(자유 입력 불가) |
| 저장 방식 | localStorage 포함 여부 미정 | 포함, 새로고침 후에도 목록 유지 필요 | `storage.js` 신설, 데이터 구조에 배열/타임스탬프 반영 |

이제 파일 목록(1번), 파일별 책임(2번), 데이터 구조(3번), 함수 계획(4번), 구현 순서(5번)는 위 결정을 모두 반영해 확정했다. Tester가 테스트 스크립트 범위(예: `storage.js` 단위 테스트 vs `app.js` 통합 테스트 포함 여부)를 별도로 확정하면, 그에 따라 `storage.js`의 함수 export 방식 정도만 미세 조정될 수 있다(대형 구조 변경 없음).

### Reviewer 보고서(02) 반영 내역 (조정 완료)

`02_reviewer_report.md`의 Builder 반영 조건 2~6번(P0-3, P1-1, P1-2, P1-4, P1-5)에 대한 반영 결과는 다음과 같다. (반영 조건 1번 — `classifier.js` 자동 분류 폐기 — 은 Tester 답변 반영 시점에 이미 삭제되어 반영 완료 상태였다.)

| Reviewer 항목 | 요구 사항 | 반영 결과 |
|---|---|---|
| P0-3 / 반영 조건 2 | localStorage를 `getItem/setItem` 최소 인터페이스로 감싸 storage 백엔드를 주입 가능하게 할 것 | `storage.js`의 `loadEntries(storage = window.localStorage)`, `saveEntries(entries, storage = window.localStorage)`, `addEntry(entry, storage = window.localStorage)`로 시그니처 확정(2·4번 섹션). Tester의 in-memory mock(`{ getItem, setItem }`) 주입과 정합 |
| P1-1 / 반영 조건 3 | 이력 개수 상한/정렬 기준 명시, 삭제/초기화는 범위 제외 명시 | 최근 20건(`MAX_ENTRIES`), `createdAt` 내림차순(최신순) 정렬로 확정. 개별 삭제/전체 초기화는 이번 범위에 포함하지 않음(2·3·4번 섹션에 명시) |
| P1-2 / 반영 조건 4 | 우선순위 UI 타입, 역할/다음 액션 고정 목록 문자열을 확정본으로 명문화 | 우선순위 = 라디오 버튼(확정). 역할 = `Frontend`/`Backend`/`QA`/`Infra`(확정). 다음 액션 = `즉시 수정`/`리뷰 요청`/`백로그 등록`(확정). 2·3번 섹션에 "예시"가 아닌 "확정"으로 표기 |
| P1-4 / 반영 조건 5 | 필수 입력 범위(텍스트만인지) 명시 | `text` 필드만 필수이며, 우선순위/체크박스/역할/다음 액션은 UI 기본값이 항상 선택되어 있어 별도 필수 검증이 필요 없음을 2·3·4번 섹션에 명시 |
| P1-5 / 반영 조건 6 | JSON 파싱 실패/형식 불일치 방어 코드(try/catch + 폴백) 명시 | `loadEntries`에 `try/catch` + 빈 배열 폴백을 명시적으로 기술(2·4번 섹션) |

이번 반영으로 04 문서 내 모든 P0/P1 관련 Builder 반영 조건이 해소되었다. Tester 반영 조건(mock 객체 직접 구현, 엣지 케이스 범위 등)은 Tester의 몫이며, Builder 쪽 구조(주입 가능한 storage 인터페이스)는 이미 그 전제에 맞춰 설계되었다.

## 7. assumptions

- 실습 2는 순수 HTML/CSS/JS로 진행하며 프레임워크(React 등)나 번들러를 도입하지 않는다고 가정한다.
- 역할/다음 액션 고정 목록 문자열(`Frontend`/`Backend`/`QA`/`Infra`, `즉시 수정`/`리뷰 요청`/`백로그 등록`)은 Reviewer 피드백 반영을 위해 Builder가 확정한 최종본이다. 교육생이 다른 문구를 원하면 구현 시 이 4개/3개 옵션의 텍스트만 교체하면 되며, 구조 변경은 없다고 가정한다.
- 이력 상한(20건)은 실습 시연용으로 Builder가 정한 값이며, 정확한 숫자 자체보다 "상한이 존재하고 정렬 기준이 명확하다"는 점이 핵심이라고 가정한다. 교육생/Tester가 다른 숫자를 원하면 `MAX_ENTRIES` 상수 값만 바꾸면 된다.
- Tester가 주입할 mock storage 객체는 `{ getItem(key), setItem(key, value) }` 형태의 순수 JS 객체(클로저로 내부 Map/object 보관)이며, 외부 패키지(jsdom 등) 없이 손수 작성 가능하다고 가정한다(Reviewer assumptions와 동일 해석).
- 항목 `id`는 별도 라이브러리 없이 `Date.now()` 또는 이와 유사한 간단한 방식으로 생성한다고 가정한다(외부 UUID 패키지 등 미사용).
- 백엔드/서버 로직은 없으며, 모든 처리와 저장(localStorage 또는 주입된 mock storage)은 브라우저(또는 테스트 환경) 클라이언트 사이드에서 이루어진다고 가정한다.
- `file://` 직접 열기 vs 정적 서버 서빙 여부(Reviewer P2-2)는 이번 Builder 조정 범위 밖으로 두고, 필요 시 Main Lead가 실행 방법을 별도로 확정한다고 가정한다.
