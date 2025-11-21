import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="OpenDream API", version="0.1.0")

# CORS Configuration
origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
	CORSMiddleware,
	allow_origins=origins,
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"],
)

class HealthResponse(BaseModel):
	status: str
	version: str
	message: str

@app.get("/health", response_model=HealthResponse)
async def health_check():
	return {
		"status": "online",
		"version": "0.1.0",
		"message": "OpenDream Backend is ready for miracles."
	}

# Placeholder for the AI Engine
@app.get("/engine/status")
async def engine_status():
	# This will eventually check if Flux.1 is loaded in VRAM
	return {"model": "Flux.1 (Schnell)", "loaded": False, "vram_usage": "0MB"}