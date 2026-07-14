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

const stage = process.argv[2];
const status = process.argv[3] || "done";

if (!stage) {
  console.error("usage: node scripts/update-board.js <stage> <status>");
  process.exit(1);
}

if (!fs.existsSync(boardPath)) {
  console.error("board.json not found:", boardPath);
  console.error("run first: node scripts/init-practice1.js");
  process.exit(1);
}

const board = JSON.parse(fs.readFileSync(boardPath, "utf8"));

if (!(stage in board.stages)) {
  console.error("unknown stage:", stage);
  console.error("available:", Object.keys(board.stages).join(", "));
  process.exit(1);
}

board.stages[stage] = status;
board.updated_at = new Date().toISOString();

fs.writeFileSync(boardPath, JSON.stringify(board, null, 2) + "\n");
console.log("updated: " + stage + " -> " + status);
