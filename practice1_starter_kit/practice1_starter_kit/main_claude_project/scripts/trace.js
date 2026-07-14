const fs = require("fs");
const path = require("path");

const tracePath = path.resolve(
  __dirname,
  "..",
  "..",
  "agent_shared",
  "state",
  "trace.jsonl"
);

const agent = process.argv[2] || "unknown";
const event = process.argv[3] || "note";
const message = process.argv.slice(4).join(" ");

if (!fs.existsSync(path.dirname(tracePath))) {
  fs.mkdirSync(path.dirname(tracePath), { recursive: true });
}

const row = {
  time: new Date().toISOString(),
  agent: agent,
  event: event,
  message: message
};

fs.appendFileSync(tracePath, JSON.stringify(row) + "\n");
console.log("trace appended:", JSON.stringify(row));
