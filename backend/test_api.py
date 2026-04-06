import os
import time
import subprocess
import requests

# Start the uvicorn server
server_process = subprocess.Popen(
    ["venv/bin/uvicorn", "main:app", "--port", "8000"],
    stdout=subprocess.PIPE,
    stderr=subprocess.PIPE
)

print("Waiting for server to start...")
time.sleep(5)  # give it 5 seconds to load models

try:
    print("Testing /health")
    resp = requests.get("http://localhost:8000/health")
    print("Health response:", resp.json())

    print("Testing /upload")
    with open("test.pdf", "rb") as f:
        resp = requests.post("http://localhost:8000/upload", files={"file": f})
    print("Upload response:", resp.json())
except Exception as e:
    print("Error:", e)
finally:
    # Kill the server
    server_process.terminate()
    server_process.wait()
    print("Server terminated.")
