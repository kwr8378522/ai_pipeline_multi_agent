const fs = require("fs");
const path = require("path");

const boardPath = path.resolve(
  __dirname,
  "..",
  "..",
  "agent_shared",
  "state",
  "board.json"
);

if (!fs.existsSync(boardPath)) {
  console.error("board.json not found:", boardPath);
  console.error("run first: node scripts/init-practice1.js");
  process.exit(1);
}

const board = JSON.parse(fs.readFileSync(boardPath, "utf8"));

// 한글 라벨을 포함하되, 콘솔에서 깨져도 실습이 망하지 않도록 단순 텍스트로만 출력한다.
const names = {
  setup: "Setup / 준비",
  agent_creation: "Agent Creation / 에이전트 생성",
  research_agent: "Research Agent / 리서치",
  reviewer_agent: "Reviewer Agent / 리뷰",
  test_agent: "Test Agent / 테스트 질문",
  test_answers: "Test Answers / 테스트 답변",
  builder_agent: "Builder Agent / 빌더",
  synthesis: "Main Synthesis / 종합",
  final_plan: "Final MVP Plan / 최종 계획서",
  validation: "Validation / 검증"
};

const icon = { idle: "-", running: ">", done: "+", blocked: "!" };

console.log("");
console.log("=== Practice 1 Team Agent Board ===");
console.log("feature idea : " + (board.feature_idea || "(not set)"));
console.log("updated_at   : " + (board.updated_at || "(none)"));
console.log("-----------------------------------");

for (const key of Object.keys(board.stages)) {
  const status = board.stages[key];
  const label = names[key] || key;
  console.log("[" + (icon[status] || "?") + "] " + label + " : " + status);
}

console.log("");
