import sys
import os
sys.path.insert(0, os.path.dirname(__file__))  # ensure model/fusion/rppg importable

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from routes import analyze

# Load environment variables
load_dotenv()

app = FastAPI(title="Castellan API", version="1.0.0")

# Allow CORS for local frontend execution
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "https://adityasinghtachyon.github.io",  # GitHub Pages
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analyze.router)

@app.get("/")
def read_root():
    return {"message": "Castellan API is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
