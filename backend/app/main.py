import os
import json
import httpx
import logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import time

# Configure standard logging to console
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("coapply.backend")

app = FastAPI(title="CoApply Backend")

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration from environment variables
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "gemma3:latest")

class JobDescriptionRequest(BaseModel):
    text: str

class JobSummaryResponse(BaseModel):
    years_of_experience: str
    tech_stacks: List[str]

@app.get("/")
def read_root():
    logger.info("Root endpoint hit.")
    return {
        "status": "running", 
        "manager": "uv",
        "ollama_url": OLLAMA_BASE_URL,
        "ollama_model": OLLAMA_MODEL
    }

@app.post("/api/summary", response_model=JobSummaryResponse)
async def summarize_job_description(request: JobDescriptionRequest):
    if not request.text.strip():
        logger.warning("Empty job description submitted.")
        raise HTTPException(status_code=400, detail="Job description text cannot be empty.")
    
    logger.info(f"Summarizing job description. Ollama URL: {OLLAMA_BASE_URL}, Model: {OLLAMA_MODEL}")
    
    prompt = (
        "You are an expert ATS (Applicant Tracking System) assistant.\n"
        "Analyze the following job description. Extract:\n"
        "1. The required years of experience as a short text string (e.g., '3+ years', 'Entry level', or 'Not specified').\n"
        "2. The required tech stacks (technologies, programming languages, libraries, tools, frameworks) as a list of strings.\n\n"
        "You MUST return your response as a JSON object with exactly the following structure:\n"
        "{\n"
        "  \"years_of_experience\": \"string value\",\n"
        "  \"tech_stacks\": [\"tech1\", \"tech2\", ...]\n"
        "}\n\n"
        f"Job Description:\n{request.text}"
    )
    
    async with httpx.AsyncClient(timeout=None) as client:
        try:
            logger.info("Sending request to Ollama...")
            start = time.time()
            response = await client.post(
                f"{OLLAMA_BASE_URL}/api/generate",
                json={
                    "model": OLLAMA_MODEL,
                    "prompt": prompt,
                    "format": "json",
                    "stream": False
                }
            )
            logger.info(f"Ollama took {time.time() - start:.2f}s")
        except httpx.ConnectError as e:
            logger.error(f"Failed to connect to Ollama at {OLLAMA_BASE_URL}: {e}")
            raise HTTPException(
                status_code=503,
                detail=f"Could not connect to Ollama at {OLLAMA_BASE_URL}. Please verify Ollama is running."
            )
        except httpx.TimeoutException as e:
            logger.error(f"Timeout communicating with Ollama at {OLLAMA_BASE_URL}: {e}")
            raise HTTPException(
                status_code=504,
                detail="Ollama request timed out. Make sure the model is pulled and running."
            )
        
        logger.info(f"Ollama returned status code: {response.status_code}")
        
        if response.status_code == 404:
            available_models = []
            try:
                logger.info("Fetching installed models from Ollama to assist troubleshooting...")
                tags_response = await client.get(f"{OLLAMA_BASE_URL}/api/tags")
                if tags_response.status_code == 200:
                    tags_data = tags_response.json()
                    available_models = [m.get("name") for m in tags_data.get("models", [])]
            except Exception as tags_err:
                logger.warning(f"Could not fetch installed Ollama models: {tags_err}")
                
            error_msg = f"Model '{OLLAMA_MODEL}' not found."
            if available_models:
                error_msg += f" Installed models available: {available_models}."
            else:
                error_msg += " No models could be detected."
            error_msg += f" Please pull the model using 'ollama pull {OLLAMA_MODEL}' or update OLLAMA_MODEL environment variable."
            
            logger.error(error_msg)
            raise HTTPException(status_code=404, detail=error_msg)
            
        elif response.status_code != 200:
            logger.error(f"Ollama returned error: {response.text}")
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Ollama returned an error: {response.text}"
            )
            
        try:
            result_json = response.json()
            llm_response_text = result_json.get("response", "")
            data = json.loads(llm_response_text)
            
            # Extract and validate fields
            years = data.get("years_of_experience", "Not specified")
            tech = data.get("tech_stacks", [])
            if not isinstance(tech, list):
                tech = [str(tech)] if tech else []
            else:
                tech = [str(t) for t in tech]
                
            logger.info("Successfully parsed summary response from Ollama.")
            return JobSummaryResponse(years_of_experience=str(years), tech_stacks=tech)
        except (json.JSONDecodeError, KeyError, ValueError) as e:
            logger.error(f"Failed to parse response from Ollama: {e}. Raw response text: {response.text}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to parse Ollama response as valid JSON: {str(e)}. Raw output: {response.text}"
            )
