const fs = require("fs");
const path = require("path");

const shared = path.resolve(__dirname, "..", "..", "agent_shared");
const boardPath = path.join(shared, "state", "board.json");
const tracePath = path.join(shared, "state", "trace.jsonl");
const outPath = path.join(shared, "dashboard", "practice1_dashboard.html");

if (!fs.existsSync(boardPath)) {
  console.error("board.json not found:", boardPath);
  console.error("run first: node scripts/init-practice1.js");
  process.exit(1);
}

const board = JSON.parse(fs.readFileSync(boardPath, "utf8"));

let trace = [];
if (fs.existsSync(tracePath)) {
  const lines = fs.readFileSync(tracePath, "utf8").trim().split("\n");
  for (const line of lines) {
    if (!line) continue;
    try {
      trace.push(JSON.parse(line));
    } catch (e) {
      // 깨진 줄은 건너뛴다.
    }
  }
}

function esc(value) {
  return String(value === undefined || value === null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

const stageRows = Object.keys(board.stages)
  .map(function (k) {
    return "<tr><td>" + esc(k) + "</td><td>" + esc(board.stages[k]) + "</td></tr>";
  })
  .join("");

const traceRows = trace
  .slice(-30)
  .map(function (t) {
    return (
      "<tr><td>" +
      esc(t.time) +
      "</td><td>" +
      esc(t.agent) +
      "</td><td>" +
      esc(t.event) +
      "</td><td>" +
      esc(t.message) +
      "</td></tr>"
    );
  })
  .join("");

const html =
  "<!doctype html>\n" +
  '<html lang="ko">\n' +
  "<head>\n" +
  '<meta charset="utf-8" />\n' +
  "<title>Practice 1 Dashboard</title>\n" +
  "<style>\n" +
  "body { font-family: Arial, sans-serif; margin: 32px; background:#0f172a; color:#e5e7eb; }\n" +
  "h1 { color:#fff; }\n" +
  ".card { border:1px solid #334155; border-radius:12px; padding:16px; margin:16px 0; background:#111827; }\n" +
  "table { width:100%; border-collapse:collapse; }\n" +
  "td, th { border:1px solid #334155; padding:8px; text-align:left; }\n" +
  "th { background:#1e293b; }\n" +
  "</style>\n" +
  "</head>\n" +
  "<body>\n" +
  "<h1>Practice 1 - Team Agent Dashboard</h1>\n" +
  '<div class="card">\n' +
  "<h2>Board</h2>\n" +
  "<p><b>Feature Idea:</b> " +
  esc(board.feature_idea || "(not set)") +
  "</p>\n" +
  "<p><b>Updated:</b> " +
  esc(board.updated_at || "(none)") +
  "</p>\n" +
  "<table><tr><th>Stage</th><th>Status</th></tr>" +
  stageRows +
  "</table>\n" +
  "</div>\n" +
  '<div class="card">\n' +
  "<h2>Recent Trace</h2>\n" +
  "<table><tr><th>Time</th><th>Agent</th><th>Event</th><th>Message</th></tr>" +
  traceRows +
  "</table>\n" +
  "</div>\n" +
  "</body>\n" +
  "</html>\n";

fs.writeFileSync(outPath, html);
console.log("dashboard written:", outPath);
