import React, { useState } from "react";
import { Sparkles, CheckCircle2, Loader2, Save, ArrowLeft, HelpCircle } from "lucide-react";
import { Link } from "react-router";

export function AIQuizGenerator() {
  const [topic, setTopic] = useState("Graph Algorithms");
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard">("Medium");
  const [loading, setLoading] = useState(false);
  const [quiz, setQuiz] = useState<any>(null);
  const [saved, setSaved] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSaved(false);
    setSelectedAnswers({});
    setSubmitted(false);
    try {
      const res = await fetch("/api/ai/generate/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, difficulty }),
      });
      const data = await res.json();
      if (data.success) {
        setQuiz(data.data);
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
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">
            <HelpCircle className="w-3.5 h-3.5 mr-1" /> AI Quiz Engine
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h1 className="text-2xl font-bold tracking-tight mb-2">AI Quiz Generator</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
            Generate custom topic-based quizzes with multiple-choice questions, explanations, and instant grading.
          </p>

          <form onSubmit={handleGenerate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Topic</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm"
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
            <div className="md:col-span-2 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 px-4 rounded-xl transition-colors flex items-center justify-center space-x-2 shadow-sm disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Generating Quiz...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Generate Quiz</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {quiz && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <h2 className="text-xl font-bold">{quiz.title}</h2>
              <button
                onClick={() => setSaved(true)}
                className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  saved ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 dark:bg-slate-800"
                }`}
              >
                {saved ? <CheckCircle2 className="w-4 h-4 mr-1.5" /> : <Save className="w-4 h-4 mr-1.5" />}
                {saved ? "Saved" : "Save Quiz"}
              </button>
            </div>

            <div className="space-y-6">
              {quiz.questions?.map((q: any, qIdx: number) => (
                <div key={q.id || qIdx} className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="font-semibold text-sm">
                    {qIdx + 1}. {q.question}
                  </div>
                  <div className="space-y-2">
                    {q.options?.map((opt: string, optIdx: number) => {
                      const isSelected = selectedAnswers[q.id || qIdx] === opt;
                      const isCorrect = submitted && opt === q.correctAnswer;
                      const isWrong = submitted && isSelected && opt !== q.correctAnswer;
                      return (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={() => !submitted && setSelectedAnswers({ ...selectedAnswers, [q.id || qIdx]: opt })}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm border transition-colors ${
                            isCorrect
                              ? "bg-emerald-50 border-emerald-300 text-emerald-900 dark:bg-emerald-950/50 dark:border-emerald-700 dark:text-emerald-200"
                              : isWrong
                              ? "bg-rose-50 border-rose-300 text-rose-900 dark:bg-rose-950/50 dark:border-rose-700 dark:text-rose-200"
                              : isSelected
                              ? "bg-indigo-50 border-indigo-300 text-indigo-900 dark:bg-indigo-950/50 dark:border-indigo-700 dark:text-indigo-200"
                              : "border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                  {submitted && (
                    <div className="text-xs text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 mt-2">
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">Explanation:</span> {q.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {!submitted && (
              <button
                onClick={() => setSubmitted(true)}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-4 rounded-xl transition-colors"
              >
                Submit Answers & Check Explanation
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
