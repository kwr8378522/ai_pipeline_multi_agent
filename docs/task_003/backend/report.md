# Backend Report — task/003-backend

- **branch**: `task/003-backend` (started from `master`)
- **allowed files**: `server.py`, `docs/task_003/backend/report.md`

## 변경 파일
- `server.py` — `classify_issue()` stub을 `tasks/acceptance.json` 규칙에 맞게 구현

## 구현 내용
`acceptance.json`의 `priorityRules`를 단일 진실 공급원으로 삼아 구현:

- **priority**
  - P0: `severity == High` 이고 `impactScope ∈ {System, Multi-device}`, **또는** `reproRate >= 70` 이고 `area ∈ {Camera, Battery, Connectivity, Foldable UX}`
  - P1: `severity == Medium` **또는** `reproRate >= 40` **또는** `impactScope == App-wide`
  - P2: 그 외
- **requiredTests**: base `[Smoke]` → P0/P1이면 `Regression` 추가 → `Multi-device`면 `Device Matrix` → area별 테스트(Camera Smoke/Battery Drain/Reconnect/Foldable Layout) 추가 → 중복 제거(순서 보존)
- **ownerReview**: P0이면 true, P1이고 area가 critical이면 true, 그 외 false
- **owner**: area 기준 매핑(항상 설정) — Camera QA/Power QA/Connectivity QA/Foldable UX QA/Performance QA/UX QA
- `reproRate` 결측/비정상 값은 0으로 방어

## 테스트 결과
```
[check-api] PASS - 8 checks
```
- health, issues(≥10건, 필수 필드), triage 6개 케이스(camera-system-p0, connectivity-multidevice-p0, foldable-reprorate-p0, battery-reprorate-p1, performance-appwide-p1, ui-low-p2) 전부 기대값 일치.

## 남은 리스크
- 없음(API 기준). Frontend/DOM은 별도 역할(`task/003-frontend`)에서 처리.
- 구현 파일은 `server.py`만 수정, `data/`·`scripts/`·`tasks/`·frontend 파일은 건드리지 않음(역할 범위 준수).

## 금지사항 준수
- merge / rebase / push 하지 않음. 허용 파일(`server.py`, 본 report)만 stage.
