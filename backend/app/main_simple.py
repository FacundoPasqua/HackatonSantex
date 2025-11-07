"""
Versión simplificada para debugging - sin middleware ni dependencias complejas
"""
from fastapi import FastAPI
import os

app = FastAPI(title="Test Results API Simple")

@app.get("/")
def read_root():
    return {
        "message": "Test Results API - Simple Version",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/health")
def health_check():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)

