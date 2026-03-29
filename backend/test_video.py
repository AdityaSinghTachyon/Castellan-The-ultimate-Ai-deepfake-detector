import urllib.request
import os
import json

TEST_VIDEO = r"C:\Users\Rockstar Sunita S\Videos\Captures\test.mp4" # Likely location
if not os.path.exists(TEST_VIDEO):
    # Just try any mp4 on the system
    for root, dirs, files in os.walk(r"C:\Users\Rockstar Sunita S\Videos"):
        for f in files:
            if f.endswith(".mp4"):
                TEST_VIDEO = os.path.join(root, f)
                break
        if os.path.exists(TEST_VIDEO): break

if os.path.exists(TEST_VIDEO):
    boundary = "----TestBoundary123"
    with open(TEST_VIDEO, "rb") as f: content = f.read()
    body = (
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="file"; filename="{os.path.basename(TEST_VIDEO)}"\r\n'
        f"Content-Type: video/mp4\r\n\r\n"
    ).encode() + content + f"\r\n--{boundary}--\r\n".encode()

    req = urllib.request.Request("http://localhost:8000/analyze", data=body, headers={"Content-Type": f"multipart/form-data; boundary={boundary}"})
    try:
        res = urllib.request.urlopen(req)
        print("VIDEO TEST SUCCESS:", json.loads(res.read().decode()))
    except urllib.error.HTTPError as e:
        print("VIDEO TEST FAIL:", e.code, e.read().decode())
    except Exception as e:
        print("ERROR:", e)
else:
    print("NO VIDEO FOUND TO TEST")
