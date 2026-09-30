import React, { useState } from 'react';
import {
  Code2,
  Plus,
  Trash2,
  Edit2,
  Search,
  CheckCircle2,
  Building2,
  Save,
  X
} from 'lucide-react';
import { useLearningStore } from '../../store/learningStore';
import { Problem } from '../../types/problem';

export const AdminProblemsPage: React.FC = () => {
  const { problems, addProblem, updateProblem, deleteProblem } = useLearningStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProblem, setEditingProblem] = useState<Problem | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Easy');
  const [subtopic, setSubtopic] = useState('');
  const [tags, setTags] = useState('');
  const [companies, setCompanies] = useState('');
  const [description, setDescription] = useState('');
  const [pythonStarter, setPythonStarter] = useState('class Solution:\n    def solve(self):\n        pass');

  const handleOpenAdd = () => {
    setEditingProblem(null);
    setTitle('');
    setDifficulty('Easy');
    setSubtopic('');
    setTags('Array, Hash Table');
    setCompanies('Google, Amazon');
    setDescription('Given an input array, return the optimal output.');
    setPythonStarter('class Solution:\n    def solve(self):\n        pass');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (prob: Problem) => {
    setEditingProblem(prob);
    setTitle(prob.title);
    setDifficulty(prob.difficulty);
    setSubtopic(prob.subtopic);
    setTags(prob.tags.join(', '));
    setCompanies(prob.companies.join(', '));
    setDescription(prob.description);
    setPythonStarter(prob.starterCode.python);
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!title.trim()) return;

    const newProb: Problem = {
      id: editingProblem ? editingProblem.id : `prob-${Date.now()}`,
      title,
      slug: title.toLowerCase().replace(/\s+/g, '-'),
      difficulty,
      topicId: 'py-03',
      topicTitle: 'Hash Maps & Arrays',
      subtopic: subtopic || 'Pattern Mastery',
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      companies: companies.split(',').map((c) => c.trim()).filter(Boolean),
      learningObjectives: ['Master time-space tradeoffs'],
      description,
      examples: [
        { input: 'nums = [1, 2, 3]', output: '6' }
      ],
      constraints: ['1 <= nums.length <= 10^5'],
      starterCode: {
        python: pythonStarter,
        cpp: 'class Solution {\npublic:\n    void solve() {}\n};',
        java: 'class Solution {\n    public void solve() {}\n}',
        c: 'void solve() {}'
      },
      hints: [
        { level: 1, title: 'Consider Data Structures', content: 'What lookup structure achieves O(1) time?' },
        { level: 2, title: 'Approach', content: 'Use single-pass hash mapping.' },
        { level: 3, title: 'Algorithm', content: 'Iterate and store complements.' },
        { level: 4, title: 'Pseudocode', content: 'for x in nums: map[x] = index' }
      ],
      acceptanceRate: 50,
      totalSubmissions: 100,
      xpReward: difficulty === 'Easy' ? 40 : difficulty === 'Medium' ? 80 : 150
    };

    if (editingProblem) {
      updateProblem(newProb);
    } else {
      addProblem(newProb);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Problem Studio</h1>
          <p className="text-xs text-slate-400 mt-0.5">Author and manage coding challenges, starter templates, and test cases.</p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-md shadow-rose-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add Problem</span>
        </button>
      </div>

      {/* Problems List */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-800">
        {problems.map((prob) => (
          <div key={prob.id} className="p-4 flex items-center justify-between hover:bg-slate-800/40 transition">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold text-white">{prob.title}</h3>
                <span
                  className={`px-2 py-0.2 rounded text-[10px] font-bold ${
                    prob.difficulty === 'Easy'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : prob.difficulty === 'Medium'
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'bg-rose-500/20 text-rose-400'
                  }`}
                >
                  {prob.difficulty}
                </span>
                <span className="text-[10px] font-mono text-slate-500">{prob.subtopic}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                <span>Companies: {prob.companies.join(', ')}</span>
                <span>•</span>
                <span>+{prob.xpReward} XP</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleOpenEdit(prob)}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
                title="Edit Problem"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => deleteProblem(prob.id)}
                className="p-2 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 rounded-lg transition"
                title="Delete Problem"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">
                {editingProblem ? 'Edit Problem' : 'Create New Coding Challenge'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Problem Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Invert Binary Tree"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Subtopic / Category</label>
                <input
                  type="text"
                  value={subtopic}
                  onChange={(e) => setSubtopic(e.target.value)}
                  placeholder="e.g. Tree Traversal, BFS"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Tags (comma separated)</label>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Companies (comma separated)</label>
                  <input
                    type="text"
                    value={companies}
                    onChange={(e) => setCompanies(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Problem Description</label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Python Starter Code</label>
                <textarea
                  rows={4}
                  value={pythonStarter}
                  onChange={(e) => setPythonStarter(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-emerald-300 font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Problem</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
