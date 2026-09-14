import React, { useState } from "react";
import { Sparkles, CheckCircle2, Loader2, Save, ArrowLeft, Trophy } from "lucide-react";
import { Link } from "react-router";

export function AIContestGenerator() {
  const [contestLevel, setContestLevel] = useState<"Beginner" | "Intermediate" | "Advanced">("Intermediate");
  const [loading, setLoading] = useState(false);
  const [contest, setContest] = useState<any>(null);
  const [saved, setSaved] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSaved(false);
    try {
      const res = await fetch("/api/ai/generate/contest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contestLevel }),
      });
      const data = await res.json();
      if (data.success) {
        setContest(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 md:p-10 text-slate-900 dark:text-slate-100">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link to="/" className="inline-flex items-center text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
          </Link>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300">
            <Trophy className="w-3.5 h-3.5 mr-1" /> AI Contest Generator
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h1 className="text-2xl font-bold tracking-tight mb-2">AI Contest Generator</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
            Generate complete competitive programming rounds with problem sets, difficulty mixes, and scoring rules.
          </p>

          <form onSubmit={handleGenerate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Contest Level</label>
              <select
                value={contestLevel}
                onChange={(e) => setContestLevel(e.target.value as any)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-medium py-2.5 px-4 rounded-xl transition-colors flex items-center justify-center space-x-2 shadow-sm disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Generating Contest...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Generate Contest</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {contest && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                  {contestLevel} Contest • Duration: {contest.durationMinutes} mins
                </span>
                <h2 className="text-xl font-bold mt-1">{contest.name}</h2>
              </div>
              <button
                onClick={() => setSaved(true)}
                className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  saved ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 dark:bg-slate-800"
                }`}
              >
                {saved ? <CheckCircle2 className="w-4 h-4 mr-1.5" /> : <Save className="w-4 h-4 mr-1.5" />}
                {saved ? "Saved" : "Save Contest"}
              </button>
            </div>

            <div className="space-y-4 text-sm leading-relaxed">
              <div>
                <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-1">Description</h3>
                <p className="text-slate-600 dark:text-slate-400">{contest.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Difficulty Mix</div>
                  <div className="font-medium text-xs">{contest.difficultyMix}</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Scoring Rules</div>
                  <div className="font-medium text-xs">{contest.scoringRules}</div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-2">Problem Set</h3>
                <div className="space-y-2">
                  {contest.problemSet?.map((prob: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                      <div>
                        <span className="font-bold text-slate-900 dark:text-slate-100">Problem {String.fromCharCode(65 + idx)}: {prob.title}</span>
                        <div className="text-slate-500 mt-0.5">Topic: {prob.topic}</div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full font-semibold bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300">
                        {prob.difficulty}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
