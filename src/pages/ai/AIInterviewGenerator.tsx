import React, { useState } from "react";
import { Sparkles, CheckCircle2, Loader2, Save, ArrowLeft, Users } from "lucide-react";
import { Link } from "react-router";

export function AIInterviewGenerator() {
  const [roundType, setRoundType] = useState<"Technical" | "Coding" | "HR">("Coding");
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard">("Medium");
  const [loading, setLoading] = useState(false);
  const [interview, setInterview] = useState<any>(null);
  const [saved, setSaved] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSaved(false);
    try {
      const res = await fetch("/api/ai/generate/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roundType, difficulty }),
      });
      const data = await res.json();
      if (data.success) {
        setInterview(data.data);
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
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300">
            <Users className="w-3.5 h-3.5 mr-1" /> AI Mock Interview Generator
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h1 className="text-2xl font-bold tracking-tight mb-2">AI Interview Generator</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
            Generate custom Technical, Coding, and HR interview rounds complete with evaluation guidelines and scoring rubrics.
          </p>

          <form onSubmit={handleGenerate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Round Type</label>
              <select
                value={roundType}
                onChange={(e) => setRoundType(e.target.value as any)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm"
              >
                <option value="Technical">Technical</option>
                <option value="Coding">Coding</option>
                <option value="HR">HR</option>
              </select>
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
            <div className="md:col-span-2 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium py-2.5 px-4 rounded-xl transition-colors flex items-center justify-center space-x-2 shadow-sm disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Generating Interview Round...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Generate Interview</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {interview && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  {roundType} Round • {difficulty}
                </span>
                <h2 className="text-xl font-bold mt-1">Mock Interview Package</h2>
              </div>
              <button
                onClick={() => setSaved(true)}
                className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  saved ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 dark:bg-slate-800"
                }`}
              >
                {saved ? <CheckCircle2 className="w-4 h-4 mr-1.5" /> : <Save className="w-4 h-4 mr-1.5" />}
                {saved ? "Saved" : "Save Interview"}
              </button>
            </div>

            <div className="space-y-4 text-sm leading-relaxed">
              <div>
                <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-1">Evaluation Guidelines</h3>
                <p className="text-slate-600 dark:text-slate-400">{interview.evaluationGuidelines}</p>
              </div>

              <div>
                <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-2">Questions</h3>
                <div className="space-y-3">
                  {interview.questions?.map((q: any, idx: number) => (
                    <div key={idx} className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                      <div className="font-semibold text-xs text-amber-600 dark:text-amber-400">Question {idx + 1}</div>
                      <p className="font-medium">{q.question}</p>
                      <div className="text-xs text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 p-2.5 rounded-lg border">
                        <strong className="text-emerald-600 dark:text-emerald-400">Expected Answer:</strong> {q.expectedAnswer}
                      </div>
                      {q.followUp && (
                        <div className="text-xs text-slate-600 dark:text-slate-400">
                          <strong>Follow-up:</strong> {q.followUp}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-2">Scoring Rubric</h3>
                <div className="space-y-2">
                  {interview.scoringRubric?.map((rub: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                      <span className="font-semibold">{rub.criterion} ({rub.maxPoints} pts)</span>
                      <span className="text-slate-500">{rub.description}</span>
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
