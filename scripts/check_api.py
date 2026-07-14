"""check_api.py - verify the server API against tasks/acceptance.json.

- Picks a free port and starts server.py in a subprocess (same Python).
- Waits for GET /api/health.
- Checks: health, issues list, and each POST /api/triage case.
- Prints an ASCII PASS/FAIL summary. Writes no files (evidence = console + git).
- Exit 0 on PASS, 1 on FAIL.

Python standard library only.
"""

import json
import socket
import subprocess
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
ACCEPTANCE_FILE = PROJECT_ROOT / "tasks" / "acceptance.json"
SERVER_FILE = PROJECT_ROOT / "server.py"


def load_json(path):
    return json.loads(path.read_text(encoding="utf-8-sig"))


def free_port():
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    try:
        sock.bind(("127.0.0.1", 0))
        return sock.getsockname()[1]
    finally:
        sock.close()


def http_get(url, timeout=3):
    req = urllib.request.Request(url, method="GET")
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return resp.status, json.loads(resp.read().decode("utf-8"))


def http_post(url, payload, timeout=3):
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url, data=data, headers={"Content-Type": "application/json"}, method="POST"
    )
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return resp.status, json.loads(resp.read().decode("utf-8"))


def wait_for_health(base_url, proc, timeout=15.0):
    deadline = time.time() + timeout
    while time.time() < deadline:
        if proc.poll() is not None:
            return False  # server process exited early
        try:
            status, body = http_get(base_url + "/api/health", timeout=1)
            if status == 200 and body.get("ok") is True:
                return True
        except (urllib.error.URLError, ConnectionError, OSError):
            time.sleep(0.3)
        except Exception:
            time.sleep(0.3)
    return False


def check_health(base_url, checks):
    try:
        status, body = http_get(base_url + "/api/health")
    except Exception as exc:
        checks.append({"name": "health", "pass": False, "detail": "request failed: %s" % exc})
        return
    ok = status == 200 and body.get("ok") is True and body.get("service") == "galaxy-issue-triage"
    checks.append({
        "name": "health",
        "pass": bool(ok),
        "expected": {"ok": True, "service": "galaxy-issue-triage"},
        "actual": body,
    })


def check_issues(base_url, required_fields, checks):
    try:
        status, body = http_get(base_url + "/api/issues")
    except Exception as exc:
        checks.append({"name": "issues", "pass": False, "detail": "request failed: %s" % exc})
        return
    if status != 200 or not isinstance(body, list) or len(body) < 10:
        checks.append({
            "name": "issues",
            "pass": False,
            "detail": "expected a JSON list of >= 10 issues",
            "actualCount": (len(body) if isinstance(body, list) else None),
        })
        return
    missing = []
    for idx, item in enumerate(body):
        if not isinstance(item, dict):
            missing.append("item %d is not an object" % idx)
            continue
        for field in required_fields:
            if field not in item:
                missing.append("item %d missing '%s'" % (idx, field))
    checks.append({
        "name": "issues",
        "pass": len(missing) == 0,
        "count": len(body),
        "fieldErrors": missing,
    })


def check_triage_cases(base_url, api_cases, checks):
    for case in api_cases:
        name = case.get("name", "case")
        expect = case.get("expect", {})
        try:
            status, actual = http_post(base_url + "/api/triage", case.get("input", {}))
        except Exception as exc:
            checks.append({"name": "triage:" + name, "pass": False, "detail": "request failed: %s" % exc})
            continue

        diffs = []
        if status != 200:
            diffs.append("http status %s" % status)
        if actual.get("priority") != expect.get("priority"):
            diffs.append("priority expected %s got %s" % (expect.get("priority"), actual.get("priority")))
        if set(actual.get("requiredTests", []) or []) != set(expect.get("requiredTests", []) or []):
            diffs.append("requiredTests expected %s got %s"
                         % (expect.get("requiredTests"), actual.get("requiredTests")))
        if actual.get("ownerReview") != expect.get("ownerReview"):
            diffs.append("ownerReview expected %s got %s" % (expect.get("ownerReview"), actual.get("ownerReview")))
        if actual.get("owner") != expect.get("owner"):
            diffs.append("owner expected %s got %s" % (expect.get("owner"), actual.get("owner")))

        checks.append({
            "name": "triage:" + name,
            "pass": len(diffs) == 0,
            "diffs": diffs,
            "expected": expect,
            "actual": actual,
        })


def main():
    if not SERVER_FILE.exists():
        print("[check-api] FAIL - server.py not found")
        return 1

    acceptance = load_json(ACCEPTANCE_FILE)
    required_fields = acceptance.get("requiredIssueFields", [])
    api_cases = acceptance.get("apiCases", [])

    port = free_port()
    base_url = "http://127.0.0.1:%d" % port
    checks = []

    proc = subprocess.Popen(
        [sys.executable, str(SERVER_FILE), "--host", "127.0.0.1", "--port", str(port)],
        cwd=str(PROJECT_ROOT),
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    try:
        if not wait_for_health(base_url, proc):
            print("[check-api] FAIL - server did not become healthy on port %d" % port)
            return 1
        check_health(base_url, checks)
        check_issues(base_url, required_fields, checks)
        check_triage_cases(base_url, api_cases, checks)
    finally:
        proc.terminate()
        try:
            proc.wait(timeout=5)
        except subprocess.TimeoutExpired:
            proc.kill()

    failures = [c for c in checks if not c["pass"]]

    if failures:
        print("[check-api] FAIL - %d failures" % len(failures))
        for c in failures:
            reason = c.get("detail") or "; ".join(c.get("diffs", [])) or "mismatch"
            print("  - %s: %s" % (c["name"], reason))
        return 1

    print("[check-api] PASS - %d checks" % len(checks))
    return 0


if __name__ == "__main__":
    sys.exit(main())
