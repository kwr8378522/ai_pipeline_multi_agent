"""check_dom.py - static check of the frontend against acceptance.json.

Verifies (no browser, no server needed):
  - requiredDomIds exist in index.html
  - requiredFilters appear as strings in app.js or index.html
  - app.js references /api/issues and /api/triage
  - the P0 highlight class exists in styles.css

Prints an ASCII PASS/FAIL summary. Writes no files (evidence = console + git).
Exit 0 on PASS, 1 on FAIL. Standard library only.
"""

import json
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
ACCEPTANCE_FILE = PROJECT_ROOT / "tasks" / "acceptance.json"

INDEX_HTML = PROJECT_ROOT / "index.html"
APP_JS = PROJECT_ROOT / "src" / "app.js"
STYLES_CSS = PROJECT_ROOT / "src" / "styles.css"


def load_json(path):
    return json.loads(path.read_text(encoding="utf-8-sig"))


def read_text(path):
    try:
        return path.read_text(encoding="utf-8-sig")
    except FileNotFoundError:
        return None


def main():
    acceptance = load_json(ACCEPTANCE_FILE)
    required_dom_ids = acceptance.get("requiredDomIds", [])
    required_filters = acceptance.get("requiredFilters", [])
    required_api_calls = acceptance.get("requiredApiCallsInAppJs", [])
    p0_class = acceptance.get("p0HighlightClass", "card-p0")

    html = read_text(INDEX_HTML)
    app = read_text(APP_JS)
    css = read_text(STYLES_CSS)

    checks = []

    # 1) DOM ids in index.html
    if html is None:
        checks.append({"name": "index.html", "pass": False, "detail": "index.html not found"})
    else:
        missing_ids = [i for i in required_dom_ids
                       if ('id="%s"' % i) not in html and ("id='%s'" % i) not in html]
        checks.append({
            "name": "domIds",
            "pass": len(missing_ids) == 0,
            "missing": missing_ids,
        })

    # 2) filters present in app.js or index.html
    haystack = (app or "") + "\n" + (html or "")
    missing_filters = [f for f in required_filters if ('"%s"' % f) not in haystack
                       and ("'%s'" % f) not in haystack and (">%s<" % f) not in haystack]
    checks.append({
        "name": "filters",
        "pass": len(missing_filters) == 0,
        "missing": missing_filters,
    })

    # 3) API calls in app.js
    if app is None:
        checks.append({"name": "apiCalls", "pass": False, "detail": "src/app.js not found"})
    else:
        missing_calls = [c for c in required_api_calls if c not in app]
        checks.append({
            "name": "apiCalls",
            "pass": len(missing_calls) == 0,
            "missing": missing_calls,
        })

    # 4) P0 highlight class in styles.css
    if css is None:
        checks.append({"name": "p0Highlight", "pass": False, "detail": "src/styles.css not found"})
    else:
        found = ("." + p0_class) in css
        checks.append({
            "name": "p0Highlight",
            "pass": found,
            "expectedSelector": "." + p0_class,
        })

    failures = [c for c in checks if not c["pass"]]

    if failures:
        print("[check-dom] FAIL - %d failures" % len(failures))
        for c in failures:
            if c.get("detail"):
                reason = c["detail"]
            elif "missing" in c:
                reason = "missing %s" % c["missing"]
            else:
                reason = "not found: %s" % c.get("expectedSelector", "")
            print("  - %s: %s" % (c["name"], reason))
        return 1

    print("[check-dom] PASS - %d checks" % len(checks))
    return 0


if __name__ == "__main__":
    sys.exit(main())
