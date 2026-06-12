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
