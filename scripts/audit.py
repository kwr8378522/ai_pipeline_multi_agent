"""audit.py - run check_api + check_dom and compute implementationRisk.

  - runs scripts/check_api.py then scripts/check_dom.py (as subprocesses)
  - both PASS -> implementationRisk = LOW
  - any FAIL -> implementationRisk = HIGH
  - prints an ASCII summary; writes no files by default.
  - optional: --out <path> writes a small audit.json (used by the Tester to
    save docs/task_003/test/audit.json). Only the Tester should pass --out.

Exit 0 if LOW, 1 if HIGH. Standard library only.
"""

import argparse
import json
import subprocess
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
SCRIPTS = PROJECT_ROOT / "scripts"


def run_check(script_name):
    result = subprocess.run(
        [sys.executable, str(SCRIPTS / script_name)],
        cwd=str(PROJECT_ROOT),
        capture_output=True,
        text=True,
    )
    # Echo child output so the caller sees it too.
    if result.stdout:
        sys.stdout.write(result.stdout)
    if result.stderr:
        sys.stderr.write(result.stderr)
    return result.returncode == 0


def main(argv):
    parser = argparse.ArgumentParser(description="run check_api + check_dom -> implementationRisk")
    parser.add_argument("--out", default=None,
                        help="optional path to write audit.json (Tester only)")
    args = parser.parse_args(argv)

    print("[audit] running check_api.py ...")
    api_pass = run_check("check_api.py")
    print("[audit] running check_dom.py ...")
    dom_pass = run_check("check_dom.py")

    risk = "LOW" if (api_pass and dom_pass) else "HIGH"

    print("[audit] api=%s dom=%s -> implementationRisk=%s"
          % ("PASS" if api_pass else "FAIL", "PASS" if dom_pass else "FAIL", risk))

    if args.out:
        audit = {
            "task": "task_003",
            "apiPass": api_pass,
            "domPass": dom_pass,
            "implementationRisk": risk,
        }
        out_path = Path(args.out)
        out_path.parent.mkdir(parents=True, exist_ok=True)
        out_path.write_text(json.dumps(audit, indent=2) + "\n", encoding="utf-8")
        print("[audit] saved %s" % out_path)

    return 0 if risk == "LOW" else 1


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
