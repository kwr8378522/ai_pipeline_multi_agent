// Galaxy Device Issue Triage Console - frontend (STARTER skeleton)
//
// 현재는 GET /api/issues 만 호출하는 뼈대입니다.
// Frontend Agent(task_003_frontend)가 아래 TODO를 완성해야 합니다.
//   1. GET /api/issues 로 이슈 목록을 가져온다.
//   2. 각 issue 를 triage 엔드포인트로 POST 해서 분류 결과를 받는다. (정확한 경로는 task 명세 참고)
//   3. issue + 분류결과를 카드로 #issue-board 에 렌더링한다.
//   4. P0/P1/P2 개수와 Owner Review 개수를 #summary-* 에 표시한다.
//   5. #filter-bar 에 필터 버튼(All/P0/P1/P2/Camera/Battery/Connectivity/Foldable UX/UI/Performance)을 만든다.
//   6. 필터 클릭 시 해당 카드만 보이도록 한다.
//   7. P0 카드는 card-p0 클래스로 강조한다.
//
// 이 상태에서는 scripts/check_dom.py 가 FAIL 이어야 정상입니다.

async function loadIssues() {
  const res = await fetch("/api/issues");
  if (!res.ok) {
    throw new Error("failed to fetch issues: " + res.status);
  }
  const issues = await res.json();
  console.log("[app] loaded issues:", issues.length);

  // TODO: 각 issue 를 triage 엔드포인트로 POST 해서 분류하고, 카드로 렌더링하세요.
  // TODO: summary 집계와 필터 버튼을 구현하세요.
}

loadIssues().catch((err) => {
  console.error(err);
  const panel = document.getElementById("error-panel");
  if (panel) {
    panel.textContent = "이슈를 불러오지 못했습니다. 서버가 실행 중인지 확인하세요.";
  }
});
