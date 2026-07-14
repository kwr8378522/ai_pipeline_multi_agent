// Galaxy Device Issue Triage Console - frontend
//
// 흐름:
//   1. GET /api/issues 로 이슈 목록을 가져온다.
//   2. 각 issue 를 POST /api/triage 로 분류한다.
//   3. issue + 분류결과를 카드로 #issue-board 에 렌더링한다. (P0 은 card-p0 강조)
//   4. P0/P1/P2 개수와 Owner Review 개수를 #summary-* 에 표시한다.
//   5. #filter-bar 에 필터 버튼(All/P0/P1/P2/영역별)을 만들고, 클릭 시 해당 카드만 보인다.

const FILTERS = [
  "All", "P0", "P1", "P2",
  "Camera", "Battery", "Connectivity", "Foldable UX", "UI", "Performance",
];

let cards = [];          // [{ issue, triage, el }]
let activeFilter = "All";

async function fetchJSON(url, options) {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(url + " -> " + res.status);
  return res.json();
}

function triageIssue(issue) {
  return fetchJSON("/api/triage", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(issue),
  });
}

function el(tag, cls, text) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text !== undefined) node.textContent = text; // 사용자 데이터는 textContent 로만
  return node;
}

function renderCard(issue, t) {
  const priority = t.priority || "P2";
  const card = el("article", "card priority-" + priority.toLowerCase());
  if (priority === "P0") card.classList.add("card-p0"); // P0 강조
  card.dataset.priority = priority;
  card.dataset.area = issue.area || "";

  const head = el("div", "card-head");
  head.appendChild(el("span", "badge badge-" + priority.toLowerCase(), priority));
  head.appendChild(el("span", "card-area", issue.area || ""));
  card.appendChild(head);

  card.appendChild(el("h3", "card-title", issue.title || issue.id || ""));
  card.appendChild(el("div", "card-device", issue.device || ""));

  const meta = el("div", "card-meta");
  meta.appendChild(el("span", "meta-item", "severity: " + issue.severity));
  meta.appendChild(el("span", "meta-item", "repro: " + issue.reproRate + "%"));
  meta.appendChild(el("span", "meta-item", "scope: " + issue.impactScope));
  card.appendChild(meta);

  card.appendChild(el("div", "card-tests", "Tests: " + (t.requiredTests || []).join(", ")));

  const ownerText = "Owner: " + (t.owner || "-") + (t.ownerReview ? "  •  Review needed" : "");
  const owner = el("div", "card-owner" + (t.ownerReview ? " owner-review" : ""), ownerText);
  card.appendChild(owner);

  return card;
}

function applyFilter(f) {
  activeFilter = f;
  document.querySelectorAll("#filter-bar .filter-btn").forEach((b) => {
    b.classList.toggle("active", b.dataset.filter === f);
  });
  cards.forEach(({ issue, triage, el: cardEl }) => {
    let show;
    if (f === "All") show = true;
    else if (f === "P0" || f === "P1" || f === "P2") show = triage.priority === f;
    else show = issue.area === f;
    cardEl.style.display = show ? "" : "none";
  });
}

function buildFilterBar() {
  const bar = document.getElementById("filter-bar");
  bar.textContent = "";
  FILTERS.forEach((f) => {
    const btn = el("button", "filter-btn", f);
    btn.type = "button";
    btn.dataset.filter = f;
    if (f === activeFilter) btn.classList.add("active");
    btn.addEventListener("click", () => applyFilter(f));
    bar.appendChild(btn);
  });
}

function renderSummary(triages) {
  const count = (p) => triages.filter((t) => t.priority === p).length;
  document.getElementById("summary-p0").textContent = count("P0");
  document.getElementById("summary-p1").textContent = count("P1");
  document.getElementById("summary-p2").textContent = count("P2");
  document.getElementById("summary-review").textContent =
    triages.filter((t) => t.ownerReview).length;
}

async function init() {
  const board = document.getElementById("issue-board");
  const panel = document.getElementById("error-panel");
  try {
    const issues = await fetchJSON("/api/issues");
    const triages = await Promise.all(issues.map(triageIssue));

    board.textContent = "";
    cards = issues.map((issue, i) => {
      const t = triages[i];
      const cardEl = renderCard(issue, t);
      board.appendChild(cardEl);
      return { issue, triage: t, el: cardEl };
    });

    renderSummary(triages);
    buildFilterBar();
    applyFilter(activeFilter);
    if (panel) panel.textContent = "";
  } catch (err) {
    console.error(err);
    if (panel) {
      panel.textContent =
        "이슈를 불러오지 못했습니다. 서버가 실행 중인지 확인하세요. (" + err.message + ")";
    }
  }
}

init();
