# Frontend Report — task/003-frontend

- **branch**: `task/003-frontend` (started from `master`, Backend와 병렬)
- **allowed files**: `index.html`, `src/app.js`, `src/styles.css`, `docs/task_003/frontend/report.md`

## 변경 파일
- `src/app.js` — 이슈 로드 → triage 분류 → 카드 렌더 → summary 집계 → 필터 구현
- `src/styles.css` — 카드/필터 버튼 스타일 + P0 강조 클래스 `.card-p0`
- `index.html` — 변경 없음(필수 DOM id는 스타터에 이미 존재; 필터·카드는 JS가 채움)

## 구현 UI
- `GET /api/issues` 로 목록 로드 → 각 이슈를 `POST /api/triage` 로 분류(`Promise.all` 병렬)
- 각 이슈를 카드로 `#issue-board` 렌더: priority 배지, area, title/device, severity·repro·scope, requiredTests, owner(+Review needed)
- **P0 카드는 `card-p0` 클래스로 강조** (붉은 테두리/글로우)
- summary 집계: `#summary-p0/p1/p2` 개수 + `#summary-review`(ownerReview 개수)
- 필터 바: `All / P0 / P1 / P2 / Camera / Battery / Connectivity / Foldable UX / UI / Performance` — 클릭 시 해당 카드만 표시(우선순위 필터는 priority, 영역 필터는 area 기준)
- 사용자 데이터는 `textContent`로만 렌더(안전)

## 테스트 결과
```
[check-dom] PASS - 4 checks
```
- domIds(8개 필수 id), filters(10개), apiCalls(`/api/issues`·`/api/triage`), p0Highlight(`.card-p0`) 모두 통과.

## 남은 리스크
- 실제 카드 렌더/필터 동작은 서버 실행 후 브라우저에서 최종 확인 필요(DOM 자동 테스트는 범위 밖, static check만 수행).
- `server.py`·`data/`·`scripts/`·`tasks/`는 수정하지 않음(역할 범위 준수).

## 금지사항 준수
- merge / rebase / push 하지 않음. 허용 파일만 stage.
