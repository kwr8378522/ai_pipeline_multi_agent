const fs = require("fs");
const path = require("path");

// 실습 1 완료 후, 최종 산출물이 준비되었는지 검증한다.
// 초기 스타터킷 상태에서는 reports/specs 가 비어 있으므로 FAIL 이 정상이다.
const shared = path.resolve(__dirname, "..", "..", "agent_shared");

const requiredFiles = [
  "reports/01_research_report.md",
  "reports/02_reviewer_report.md",
  "reports/03_test_questions_and_plan.md",
  "reports/03A_test_answers.md",
  "reports/04_builder_diff_plan.md",
  "specs/05_mvp_implementation_plan.md"
];

let ok = true;

console.log("");
console.log("=== Practice 1 Validation ===");

for (const rel of requiredFiles) {
  const target = path.join(shared, rel);
  if (!fs.existsSync(target)) {
    console.log("MISSING   : " + rel);
    ok = false;
    continue;
  }
  const text = fs.readFileSync(target, "utf8").trim();
  if (text.length < 120) {
    console.log("TOO_SHORT : " + rel + " (" + text.length + " chars)");
    ok = false;
    continue;
  }
  console.log("OK        : " + rel);
}

const finalPath = path.join(shared, "specs", "05_mvp_implementation_plan.md");
if (fs.existsSync(finalPath)) {
  const finalText = fs.readFileSync(finalPath, "utf8");
  const sections = [
    "## 1. 원래 아이디어",
    "## 2. MVP 범위",
    "## 3. 제외 범위",
    "## 4. 구현 단계",
    "## 5. 테스트 기준",
    "## 6. 구현 Diff 계획",
    "## 7. 리스크와 대응",
    "## 8. 실습 2 전달 메모"
  ];
  for (const s of sections) {
    if (!finalText.includes(s)) {
      console.log("MISSING_SECTION : " + s);
      ok = false;
    }
  }
}

console.log("-----------------------------------");

if (ok) {
  console.log("RESULT: PRACTICE1_PASS");
  process.exit(0);
} else {
  console.log("RESULT: PRACTICE1_FAIL");
  process.exit(1);
}
