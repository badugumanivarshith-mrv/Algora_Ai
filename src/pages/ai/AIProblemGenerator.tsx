import React, { useState } from "react";
import { Sparkles, Code2, CheckCircle2, Loader2, Save, ArrowLeft } from "lucide-react";
import { Link } from "react-router";

export function AIProblemGenerator() {
  const [language, setLanguage] = useState("Python");
  const [topic, setTopic] = useState("Arrays");
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard">("Medium");
  const [learningLevel, setLearningLevel] = useState<"Beginner" | "Intermediate" | "Advanced">("Intermediate");
  const [loading, setLoading] = useState(false);
  const [generatedProblem, setGeneratedProblem] = useState<any>(null);
  const [saved, setSaved] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSaved(false);
    try {
      const res = await fetch("/api/ai/generate/problem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language, topic, difficulty, learningLevel }),
      });
      const data = await res.json();
      if (data.success) {
        setGeneratedProblem(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    setSaved(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 md:p-10 text-slate-900 dark:text-slate-100">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link to="/" className="inline-flex items-center text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
          </Link>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300">
            <Sparkles className="w-3.5 h-3.5 mr-1" /> AI Generated Learning v2.0
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h1 className="text-2xl font-bold tracking-tight mb-2">AI Coding Problem Generator</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
            Configure parameters below to generate bespoke, high-quality algorithmic challenges tailored to your learning level.
          </p>

          <form onSubmit={handleGenerate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm"
              >
                <option value="Python">Python</option>
                <option value="C++">C++</option>
                <option value="Java">Java</option>
                <option value="JavaScript">JavaScript</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Topic</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm"
                placeholder="e.g. Dynamic Programming, Trees"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Learning Level</label>
              <select
                value={learningLevel}
                onChange={(e) => setLearningLevel(e.target.value as any)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            <div className="md:col-span-2 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-4 rounded-xl transition-colors flex items-center justify-center space-x-2 shadow-sm disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Generating Problem via Gemini AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Generate AI Problem</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {generatedProblem && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  {generatedProblem.language} • {generatedProblem.topic} • {generatedProblem.difficulty}
                </span>
                <h2 className="text-xl font-bold mt-1">{generatedProblem.title}</h2>
              </div>
              <button
                onClick={handleSave}
                className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  saved
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300"
                    : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700"
                }`}
              >
                {saved ? <CheckCircle2 className="w-4 h-4 mr-1.5" /> : <Save className="w-4 h-4 mr-1.5" />}
                {saved ? "Saved to Library" : "Save Problem"}
              </button>
            </div>

            <div className="space-y-4 text-sm leading-relaxed">
              <div>
                <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-1">Problem Statement</h3>
                <p className="text-slate-600 dark:text-slate-400 whitespace-pre-wrap">{generatedProblem.problemStatement}</p>
              </div>

              <div>
                <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-1">Constraints</h3>
                <code className="bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg block text-xs">{generatedProblem.constraints}</code>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-1">Input Format</h3>
                  <p className="text-slate-600 dark:text-slate-400">{generatedProblem.inputFormat}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-1">Output Format</h3>
                  <p className="text-slate-600 dark:text-slate-400">{generatedProblem.outputFormat}</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-1">Sample Test Cases</h3>
                <div className="space-y-2">
                  {generatedProblem.sampleInputs?.map((inp: string, idx: number) => (
                    <div key={idx} className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                      <div className="text-xs font-mono text-slate-500 mb-1">Input {idx + 1}:</div>
                      <pre className="text-xs font-mono mb-2">{inp}</pre>
                      <div className="text-xs font-mono text-slate-500 mb-1">Output {idx + 1}:</div>
                      <pre className="text-xs font-mono">{generatedProblem.sampleOutputs?.[idx]}</pre>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-1">Explanation & Approach</h3>
                <p className="text-slate-600 dark:text-slate-400">{generatedProblem.explanation}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
