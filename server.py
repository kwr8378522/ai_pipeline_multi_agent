"""Galaxy Device Issue Triage Console - static + API server.

Python standard library only. No pip install, no external framework.
Run:
    py server.py            (Windows)
    python server.py
    python3 server.py       (macOS / Linux)

Options:
    --host 127.0.0.1  (default)
    --port 8000       (default)

Routes:
    GET  /                 -> index.html
    GET  /index.html       -> index.html
    GET  /src/app.js       -> src/app.js
    GET  /src/styles.css   -> src/styles.css
    GET  /api/health       -> {"ok": true, "service": "galaxy-issue-triage"}
    GET  /api/issues       -> data/issues.json (re-read every request)
    POST /api/triage       -> classification result for one issue
"""

import argparse
import json
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

BASE = Path(__file__).resolve().parent
DATA_FILE = BASE / "data" / "issues.json"

# Only these paths are served as static files (no directory traversal).
STATIC_ROUTES = {
    "/": (BASE / "index.html", "text/html; charset=utf-8"),
    "/index.html": (BASE / "index.html", "text/html; charset=utf-8"),
    "/src/app.js": (BASE / "src" / "app.js", "text/javascript; charset=utf-8"),
    "/src/styles.css": (BASE / "src" / "styles.css", "text/css; charset=utf-8"),
}

CRITICAL_AREAS = ("Camera", "Battery", "Connectivity", "Foldable UX")
OWNER_BY_AREA = {
    "Camera": "Camera QA",
    "Battery": "Power QA",
    "Connectivity": "Connectivity QA",
    "Foldable UX": "Foldable UX QA",
    "Performance": "Performance QA",
    "UI": "UX QA",
}


def classify_issue(issue):
    """STARTER STUB - intentionally incomplete.

    Backend Agent (task_003_backend) must implement the full rules described
    in tasks/acceptance.json so that scripts/check_api.py passes.
    Right now every issue is forced to P2 with the minimum fields, so the
    API check is expected to FAIL until this function is completed.
    """
    return {
        "id": issue.get("id"),
        "priority": "P2",
        "requiredTests": ["Smoke"],
        "ownerReview": False,
        "owner": "",
        "reasons": ["TODO: classify_issue is not implemented yet"],
    }


class Handler(BaseHTTPRequestHandler):
    server_version = "GalaxyTriage/0.1"

    def _send_json(self, obj, code=200):
        body = json.dumps(obj, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _send_file(self, path, ctype):
        try:
            data = path.read_bytes()
        except FileNotFoundError:
            self._send_json({"error": "file not found", "path": self.path}, 404)
            return
        self.send_response(200)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def do_GET(self):
        path = self.path.split("?", 1)[0]
        if path == "/api/health":
            self._send_json({"ok": True, "service": "galaxy-issue-triage"})
            return
        if path == "/api/issues":
            try:
                # Re-read every request so new data shows up on browser refresh.
                text = DATA_FILE.read_text(encoding="utf-8-sig")
                issues = json.loads(text)
            except FileNotFoundError:
                self._send_json({"error": "issues.json not found"}, 500)
                return
            except json.JSONDecodeError as exc:
                self._send_json({"error": "issues.json is not valid JSON", "detail": str(exc)}, 500)
                return
            self._send_json(issues)
            return
        if path in STATIC_ROUTES:
            file_path, ctype = STATIC_ROUTES[path]
            self._send_file(file_path, ctype)
            return
        self._send_json({"error": "not found", "path": path}, 404)

    def do_POST(self):
        path = self.path.split("?", 1)[0]
        if path == "/api/triage":
            try:
                length = int(self.headers.get("Content-Length") or 0)
            except ValueError:
                length = 0
            raw = self.rfile.read(length) if length > 0 else b"{}"
            try:
                issue = json.loads(raw.decode("utf-8"))
            except (json.JSONDecodeError, UnicodeDecodeError):
                self._send_json({"error": "request body is not valid JSON"}, 400)
                return
            self._send_json(classify_issue(issue))
            return
        self._send_json({"error": "not found", "path": path}, 404)

    def log_message(self, *args):
        # Keep the console quiet; tests capture responses over HTTP.
        return


def main():
    parser = argparse.ArgumentParser(description="Galaxy Device Issue Triage Console server")
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=8000)
    args = parser.parse_args()

    httpd = ThreadingHTTPServer((args.host, args.port), Handler)
    print("[server] galaxy-issue-triage listening on http://%s:%d" % (args.host, args.port))
    print("[server] press Ctrl+C to stop")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n[server] stopping")
    finally:
        httpd.server_close()


if __name__ == "__main__":
    main()
