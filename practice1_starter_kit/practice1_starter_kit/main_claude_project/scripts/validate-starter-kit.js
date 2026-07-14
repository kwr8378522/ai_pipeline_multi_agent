const fs = require("fs");
const path = require("path");

// 실습 시작 전, 스타터킷이 정상인지 검증한다.
// agent 산출물(reports/specs)이 아직 없어도 이 검증은 PASS 여야 한다.
const project = path.resolve(__dirname, "..");
const shared = path.resolve(project, "..", "agent_shared");

let ok = true;

function checkFile(target, label) {
  if (fs.existsSync(target) && fs.statSync(target).isFile()) {
    console.log("OK   file : " + label);
  } else {
    console.log("MISS file : " + label);
    ok = false;
  }
}

function checkDir(target, label) {
  if (fs.existsSync(target) && fs.statSync(target).isDirectory()) {
    console.log("OK   dir  : " + label);
  } else {
    console.log("MISS dir  : " + label);
    ok = false;
  }
}

console.log("");
console.log("=== Starter Kit Validation ===");

checkFile(path.join(project, "CLAUDE.md"), "CLAUDE.md");
checkFile(
  path.join(project, ".claude", "settings.local.json"),
  ".claude/settings.local.json"
);
checkDir(path.join(project, ".claude", "agents"), ".claude/agents");

const prompts = [
  "mx-research-agent.md",
  "mx-reviewer-agent.md",
  "mx-test-agent.md",
  "mx-builder-agent.md"
];
for (const f of prompts) {
  checkFile(path.join(project, "agent_prompts", f), "agent_prompts/" + f);
}

const scripts = [
  "init-practice1.js",
  "status.js",
  "update-board.js",
  "trace.js",
  "validate-starter-kit.js",
  "validate-practice1.js",
  "render-dashboard.js"
];
for (const f of scripts) {
  checkFile(path.join(project, "scripts", f), "scripts/" + f);
}

checkFile(
  path.join(shared, "state", "board.json"),
  "agent_shared/state/board.json"
);
checkFile(
  path.join(shared, "state", "trace.jsonl"),
  "agent_shared/state/trace.jsonl"
);
checkDir(path.join(shared, "reports"), "agent_shared/reports");
checkDir(path.join(shared, "specs"), "agent_shared/specs");
checkDir(path.join(shared, "dashboard"), "agent_shared/dashboard");

console.log("-----------------------------------");

if (ok) {
  console.log("RESULT: STARTER_KIT_PASS");
  process.exit(0);
} else {
  console.log("RESULT: STARTER_KIT_FAIL");
  process.exit(1);
}
