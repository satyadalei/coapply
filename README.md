## Goal:
   - I want to see what percentage I match to a given Job Description & Resume & then decide whether worth applying or not 
   - Is resume teek needed
   - If yes then how much time it would take to edit, bascucally what percentage of my Resume needs to be chnaged

## Implementations
   ### Input
      - Text based Job Description
      - A resume (Most likely the PDF file)
    
   ### Output
      - Yes/No - for should I apply
      - Number - Match percentage 
      - Yes/No - Resume tweek Needed 
      - Number - Percentage of changes needed in Resume (Estimated Time)

## WBS

   **Frontend Interactions**
   - User entered JD
   - User attached Resume
   - User clicked button

   **Backend Executaions**
   - Docling extracts texts from resume
   - Asks Ollama inference with JD & extracted texts
   - results are normalised 
   - sent back to FE

   - `Shown in FE` 

# Phase 1
Setup Ollama & Pull model in backend to inference.
Task takes Job description & returns summary ofJD in bullet points.
- Summary should be  
  - Years of experience
  - tech stacks


# Setting up docker

To spin up the entire application (frontend and backend services) using Docker Compose, use the following commands:

### 1. Build and Start the Containers
To build the images and start all services in the foreground:
```bash
docker compose up --build
```

To run the services in the background (detached mode):
```bash
docker compose up -d --build
```

### 2. View Real-time Logs
To view logs for all running services:
```bash
docker compose logs -f
```

To view logs for only the backend service:
```bash
docker compose logs -f backend
```

To view logs for only the frontend service:
```bash
docker compose logs -f frontend
```

### 3. Stop and Remove Containers
To stop the services and clean up containers/networks created by compose:
```bash
docker compose down
```
