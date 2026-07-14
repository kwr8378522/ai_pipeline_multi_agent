const fs = require("fs");
const path = require("path");

// 이 스크립트는 main_claude_project/scripts 안에 있다.
// 공용 폴더는 저장소 밖 형제 폴더 agent_shared 이다.
const project = path.resolve(__dirname, "..");
const shared = path.resolve(project, "..", "agent_shared");

// 필요한 폴더만 보정한다. 기존 reports/specs/dashboard 내용은 지우지 않는다.
const dirs = [
  shared,
  path.join(shared, "state"),
  path.join(shared, "reports"),
  path.join(shared, "specs"),
  path.join(shared, "dashboard")
];

for (const d of dirs) {
  fs.mkdirSync(d, { recursive: true });
}

const boardPath = path.join(shared, "state", "board.json");
const tracePath = path.join(shared, "state", "trace.jsonl");

const board = {
  feature_idea: "",
  updated_at: new Date().toISOString(),
  stages: {
    setup: "done",
    agent_creation: "idle",
    research_agent: "idle",
    reviewer_agent: "idle",
    test_agent: "idle",
    test_answers: "idle",
    builder_agent: "idle",
    synthesis: "idle",
    final_plan: "idle",
    validation: "idle"
  }
};

fs.writeFileSync(boardPath, JSON.stringify(board, null, 2) + "\n");
fs.writeFileSync(tracePath, "");

console.log("Practice 1 initialized.");
console.log("shared :", shared);
console.log("board  :", boardPath);
console.log("trace  :", tracePath);
