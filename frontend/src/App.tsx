import { useState, type FormEvent } from 'react';
import './App.css';

interface JobSummary {
  years_of_experience: string;
  tech_stacks: string[];
}

function App() {
  const [jobDescription, setJobDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState<JobSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (e: FormEvent) => {
    e.preventDefault();
    if (!jobDescription.trim()) return;

    setIsLoading(true);
    setError(null);
    setSummary(null);

    try {
      const response = await fetch('http://localhost:8000/api/summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: jobDescription }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Server returned status ${response.status}`);
      }

      const data: JobSummary = await response.json();
      setSummary(data);
    } catch (err: any) {
      console.error('API Error:', err);
      setError(err.message || 'An unexpected error occurred while communicating with the backend.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setJobDescription('');
    setSummary(null);
    setError(null);
  };

  return (
    <div className="container">
      <header className="header">
        <div className="logo-container">
          <div className="logo-icon">C</div>
          <h1 className="logo-text">CoApply</h1>
        </div>
        <p className="subtitle">
          Optimize your job search. Paste a job description to extract experience levels and technology stacks instantly.
        </p>
      </header>

      {!summary && !isLoading && !error && (
        <div className="card">
          <form className="form" onSubmit={handleAnalyze}>
            <div className="form-group">
              <label htmlFor="jd-input" className="label">
                Job Description
              </label>
              <div className="textarea-wrapper">
                <textarea
                  id="jd-input"
                  className="textarea"
                  placeholder="Paste the job description details here (roles, responsibilities, requirements)..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            <button
              type="submit"
              className="button"
              disabled={isLoading || !jobDescription.trim()}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275Z" />
                <path d="m5 3 1 2.5L8.5 6 6 7 5 9.5 4 7 1.5 6 4 5.5Z" />
                <path d="m19 17 1 2.5 2.5.5-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1Z" />
              </svg>
              Analyze Job Description
            </button>
          </form>
        </div>
      )}

      {isLoading && (
        <div className="card loading-container">
          <div className="spinner"></div>
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span className="loading-text">Analyzing job description...</span>
            <span className="loading-subtext">This might take a moment depending on Ollama's response time.</span>
          </div>
        </div>
      )}

      {error && (
        <div className="card error-card">
          <div className="error-title">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            Analysis Failed
          </div>
          <div className="error-message">{error}</div>
          <div className="error-suggestions">
            <strong>Troubleshooting tips:</strong>
            <ul>
              <li>Check if the FastAPI backend server is running on port 8000.</li>
              <li>Ensure Ollama is running on your machine.</li>
              <li>Make sure you have pulled the required model (e.g. <code>ollama pull llama3</code>).</li>
            </ul>
          </div>
          <div className="action-bar">
            <button className="button button-secondary" onClick={handleReset}>
              Try Again
            </button>
          </div>
        </div>
      )}

      {summary && (
        <div className="results-grid">
          <div className="card results-card">
            <div className="label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              </svg>
              Experience
            </div>
            <div className="experience-value">{summary.years_of_experience}</div>
          </div>

          <div className="card results-card">
            <div className="label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="16 18 22 12 16 6" />
                <polyline points="8 6 2 12 8 18" />
              </svg>
              Tech Stack
            </div>
            <div className="tech-tags">
              {summary.tech_stacks.length > 0 ? (
                summary.tech_stacks.map((tech, idx) => (
                  <span key={idx} className="tag">
                    {tech}
                  </span>
                ))
              ) : (
                <span className="loading-subtext">No tech stack extracted.</span>
              )}
            </div>
          </div>

          <div className="action-bar" style={{ gridColumn: '1 / -1' }}>
            <button className="button button-secondary" onClick={handleReset}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                <path d="M21 3v5h-5" />
                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                <path d="M3 21v-5h5" />
              </svg>
              Analyze Another
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
