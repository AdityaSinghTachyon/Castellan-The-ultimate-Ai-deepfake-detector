import sys, os
libs = ["fastapi", "uvicorn", "cv2", "torch", "torchvision", "PIL", "numpy"]
for lib in libs:
    try:
        mod = __import__(lib)
        print(f"  OK   {lib}")
    except ImportError:
        print(f"  MISS {lib}")
