import os
from dotenv import load_dotenv

# Load env before importing engine
load_dotenv()

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from app.engine import engine

app = FastAPI(title="OpenDream API (Cloud)")

origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
	CORSMiddleware,
	allow_origins=origins,
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"],
)

class GenerateRequest(BaseModel):
	image: str
	mask: str
	prompt: str

@app.get("/health")
async def health_check():
	# Check if key is present
	status = "online" if os.getenv("REPLICATE_API_TOKEN") else "online (missing key)"
	return {"status": status, "provider": "Replicate/Flux-Fill"}

@app.post("/generate")
async def generate_image(req: GenerateRequest):
	try:
		print("📩 Processing Generation Request...")
		result_b64 = engine.generate(req.image, req.mask, req.prompt)
		return {"status": "success", "image": result_b64}
	except Exception as e:
		print(f"❌ Error: {str(e)}")
		raise HTTPException(status_code=500, detail=str(e))