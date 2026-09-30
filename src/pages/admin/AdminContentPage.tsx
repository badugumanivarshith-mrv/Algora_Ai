import React, { useState } from 'react';
import { BookOpen, Plus, Layers, Edit2, CheckCircle2 } from 'lucide-react';
import { useLearningStore } from '../../store/learningStore';
import { Topic } from '../../types/learn';

export const AdminContentPage: React.FC = () => {
  const { tracks, addTopic } = useLearningStore();
  const [selectedTrackId, setSelectedTrackId] = useState(tracks[0]?.id || 'track-python');

  const activeTrack = tracks.find((t) => t.id === selectedTrackId) || tracks[0];

  const handleAddNewTopic = () => {
    const newTopic: Topic = {
      id: `topic-${Date.now()}`,
      trackId: activeTrack.id,
      title: 'Advanced Module ' + (activeTrack.topics.length + 1),
      slug: 'advanced-module-' + (activeTrack.topics.length + 1),
      order: activeTrack.topics.length + 1,
      summary: 'Comprehensive module on systems and memory optimizations.',
      prerequisiteTopicIds: [],
      masteryPercentage: 0,
      estimatedMinutes: 30,
      conceptNotes: '### Core Theory\nExplain the foundational axioms and mental models here.',
      syntaxBreakdown: [
        { language: 'Python', code: '# Implementation snippet', explanation: 'Clean code.' }
      ],
      interactiveExamples: [
        { title: 'Interactive Example', language: 'python', code: 'print("Hello from Algora")', explanation: 'Execution demo.', output: 'Hello from Algora' }
      ],
      commonMistakes: [
        { title: 'Anti-pattern', badCode: 'bad()', goodCode: 'good()', explanation: 'Avoid bad patterns.' }
      ],
      assignment: {
        id: `asg-${Date.now()}`,
        title: 'Module Assignment',
        instructions: 'Implement the function.',
        starterCode: 'def solve(): pass',
        solutionPattern: 'pass',
        testCases: [{ input: '1', expected: '1' }]
      },
      interviewQuestions: [
        { question: 'Explain Big-O trade-offs.', type: 'complexity', expectedAnswer: 'Trade space for time.', companyTags: ['Google'] }
      ],
      relatedProblemIds: ['prob-two-sum'],
      relatedProjectIds: ['proj-calc']
    };

    addTopic(activeTrack.id, newTopic);
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Curriculum & Topics Management</h1>
          <p className="text-xs text-slate-400 mt-0.5">Author 8-stage topic progression sequences and prerequisite locks.</p>
        </div>

        <button
          onClick={handleAddNewTopic}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Topic</span>
        </button>
      </div>

      {/* Track Selector */}
      <div className="flex gap-2 border-b border-slate-800 pb-3">
        {tracks.map((t) => (
          <button
            key={t.id}
            onClick={() => setSelectedTrackId(t.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              t.id === activeTrack.id
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            {t.title}
          </button>
        ))}
      </div>

      {/* Topics list for active track */}
      <div className="space-y-3">
        {activeTrack.topics.map((tp, idx) => (
          <div key={tp.id} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-indigo-400 font-bold">#{idx + 1}</span>
                <h3 className="text-xs font-bold text-white">{tp.title}</h3>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">{tp.summary}</p>
            </div>
            <span className="text-xs text-emerald-400 font-mono">8 Stages Configured</span>
          </div>
        ))}
      </div>
    </div>
  );
};
