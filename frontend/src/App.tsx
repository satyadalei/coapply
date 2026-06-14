import { useState, type FormEvent } from "react";

interface JobSummary {
  years_of_experience: string;
  tech_stacks: string[];
}

function App() {
  const [jobDescription, setJobDescription] = useState("");
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
      const response = await fetch("http://localhost:8000/api/summary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: jobDescription }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        throw new Error(
          errorData.detail || `Server returned status ${response.status}`
        );
      }

      const data: JobSummary = await response.json();
      setSummary(data);
    } catch (err: any) {
      console.error(err);
      setError(
        err.message ||
        "An unexpected error occurred while communicating with the backend."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setJobDescription("");
    setSummary(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-12">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <header className="mb-10 text-center">
          <div className="mb-4 flex items-center justify-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-white font-semibold">
              C
            </div>

            <h1 className="text-3xl font-bold text-slate-900">
              CoApply
            </h1>
          </div>

          <p className="mx-auto max-w-2xl text-slate-600">
            Optimize your job search. Paste a job description and instantly
            extract experience requirements and technology stacks.
          </p>
        </header>

        {/* Form */}
        {!summary && !isLoading && !error && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <form onSubmit={handleAnalyze} className="space-y-6">
              <div>
                <label
                  htmlFor="jd-input"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Job Description
                </label>

                <textarea
                  id="jd-input"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  disabled={isLoading}
                  placeholder="Paste the job description details here..."
                  className="min-h-[320px] w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <button
                type="submit"
                disabled={!jobDescription.trim() || isLoading}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Analyze Job Description
              </button>
            </form>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 shadow-sm">
            <div className="flex flex-col items-center gap-4">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />

              <h3 className="text-lg font-semibold text-slate-900">
                Analyzing Job Description
              </h3>

              <p className="text-center text-sm text-slate-500">
                This may take a few seconds depending on the model response.
              </p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
            <h3 className="mb-3 text-lg font-semibold text-red-700">
              Analysis Failed
            </h3>

            <p className="mb-5 text-red-600">{error}</p>

            <div className="mb-6 text-sm text-red-700">
              <p className="mb-2 font-medium">Troubleshooting Tips</p>

              <ul className="list-disc space-y-1 pl-5">
                <li>Check if FastAPI is running on port 8000.</li>
                <li>Ensure Ollama is running.</li>
                <li>Verify the model is installed.</li>
              </ul>
            </div>

            <button
              onClick={handleReset}
              className="rounded-xl border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Results */}
        {summary && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="mb-8">
                <p className="mb-2 text-sm font-medium text-slate-500">
                  Experience Required
                </p>

                <h2 className="text-4xl font-bold text-slate-900">
                  {summary.years_of_experience}
                </h2>
              </div>

              <div>
                <p className="mb-4 text-sm font-medium text-slate-500">
                  Technology Stack
                </p>

                <div className="flex flex-wrap gap-2">
                  {summary.tech_stacks.length > 0 ? (
                    summary.tech_stacks.map((tech, index) => (
                      <span
                        key={index}
                        className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700"
                      >
                        {tech}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-slate-500">
                      No technologies detected.
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <button
                onClick={handleReset}
                className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Analyze Another
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;