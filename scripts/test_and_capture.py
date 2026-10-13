import http.server
import socketserver
import threading
import subprocess
import time
import os
import sys

PORT = 8991
DIRECTORY = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)
    def log_message(self, format, *args):
        # Print requests to verify what's requested
        sys.stderr.write(f"[HTTP {self.address_string()}] {format % args}\n")

httpd = socketserver.TCPServer(("", PORT), Handler)
server_thread = threading.Thread(target=httpd.serve_forever, daemon=True)
server_thread.start()
print(f"Server started on port {PORT} serving {DIRECTORY}")

CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
OUTPUT_DIR = os.path.join(DIRECTORY, "scripts", "screenshots")
os.makedirs(OUTPUT_DIR, exist_ok=True)

test_cases = [
    {"name": "index_desktop", "url": f"http://localhost:{PORT}/index.html", "w": 1280, "h": 900},
    {"name": "index_mobile_390", "url": f"http://localhost:{PORT}/index.html", "w": 390, "h": 844},
    {"name": "examen_desktop_light", "url": f"http://localhost:{PORT}/examen.html", "w": 1280, "h": 1200},
    {"name": "examen_mobile_light", "url": f"http://localhost:{PORT}/examen.html", "w": 390, "h": 844},
    {"name": "module05_desktop", "url": f"http://localhost:{PORT}/modules/view.html?id=m05", "w": 1280, "h": 900},
]

for tc in test_cases:
    out_file = os.path.join(OUTPUT_DIR, f"{tc['name']}.png")
    cmd = [
        CHROME,
        "--headless=new",
        f"--window-size={tc['w']},{tc['h']}",
        f"--screenshot={out_file}",
        "--hide-scrollbars",
        "--virtual-time-budget=5000",
        tc["url"]
    ]
    print(f"Capturing {tc['name']} -> {out_file}...")
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode == 0 and os.path.exists(out_file) and os.path.getsize(out_file) > 0:
        print(f"  [OK] {tc['name']} ({os.path.getsize(out_file)} bytes)")
    else:
        print(f"  [FAIL] {tc['name']}: {res.stderr}")

httpd.shutdown()
print("Screenshot capture completed.")
