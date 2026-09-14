import React, { useState } from "react";
import { Sparkles, CheckCircle2, Loader2, Save, ArrowLeft, BookOpen } from "lucide-react";
import { Link } from "react-router";

export function AIAssignmentGenerator() {
  const [topic, setTopic] = useState("Dynamic Programming");
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard">("Medium");
  const [loading, setLoading] = useState(false);
  const [assignment, setAssignment] = useState<any>(null);
  const [saved, setSaved] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSaved(false);
    try {
      const res = await fetch("/api/ai/generate/assignment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, difficulty }),
      });
      const data = await res.json();
      if (data.success) {
        setAssignment(data.data);
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
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-violet-100 text-violet-800 dark:bg-violet-900/50 dark:text-violet-300">
            <BookOpen className="w-3.5 h-3.5 mr-1" /> AI Curriculum Generator
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h1 className="text-2xl font-bold tracking-tight mb-2">AI Assignment Generator</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
            Generate multi-task hands-on programming assignments for Arrays, Strings, Linked Lists, Trees, Graphs, and DP.
          </p>

          <form onSubmit={handleGenerate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Topic</label>
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm"
              >
                <option value="Arrays">Arrays</option>
                <option value="Strings">Strings</option>
                <option value="Linked Lists">Linked Lists</option>
                <option value="Trees">Trees</option>
                <option value="Graphs">Graphs</option>
                <option value="Dynamic Programming">Dynamic Programming</option>
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
                className="w-full bg-violet-600 hover:bg-violet-700 text-white font-medium py-2.5 px-4 rounded-xl transition-colors flex items-center justify-center space-x-2 shadow-sm disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Generating Assignment...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Generate Assignment</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {assignment && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-violet-600 dark:text-violet-400">
                  {topic} • {difficulty} • Expected Time: {assignment.expectedCompletionTime}
                </span>
                <h2 className="text-xl font-bold mt-1">Assignment Objectives</h2>
              </div>
              <button
                onClick={() => setSaved(true)}
                className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  saved ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 dark:bg-slate-800"
                }`}
              >
                {saved ? <CheckCircle2 className="w-4 h-4 mr-1.5" /> : <Save className="w-4 h-4 mr-1.5" />}
                {saved ? "Saved" : "Save Assignment"}
              </button>
            </div>

            <div className="space-y-4 text-sm leading-relaxed">
              <div>
                <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-1">Objective</h3>
                <p className="text-slate-600 dark:text-slate-400">{assignment.objective}</p>
              </div>

              <div>
                <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-2">Requirements</h3>
                <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
                  {assignment.requirements?.map((req: string, idx: number) => (
                    <li key={idx}>{req}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-2">Tasks</h3>
                <div className="space-y-3">
                  {assignment.tasks?.map((t: any, idx: number) => (
                    <div key={idx} className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
                      <div className="font-semibold text-xs text-indigo-600 dark:text-indigo-400 mb-1">Task {idx + 1}: {t.title}</div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">{t.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-2">Evaluation Criteria</h3>
                <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
                  {assignment.evaluationCriteria?.map((crit: string, idx: number) => (
                    <li key={idx}>{crit}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
