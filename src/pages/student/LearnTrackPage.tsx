import React, { useState } from 'react';
import { 
  GraduationCap, 
  Lock, 
  Unlock, 
  CheckCircle2, 
  Clock, 
  Code2, 
  ArrowRight, 
  Sparkles,
  BookOpen,
  Filter
} from 'lucide-react';
import { useLearningStore } from '../../store/learningStore';
import { LearningTrack, Topic } from '../../types/learn';

interface LearnTrackPageProps {
  onSelectTopic: (topicId: string) => void;
}

export const LearnTrackPage: React.FC<LearnTrackPageProps> = ({ onSelectTopic }) => {
  const { tracks, userTopicProgress } = useLearningStore();
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'language' | 'cs_core' | 'interview'>('all');
  const [selectedTrackId, setSelectedTrackId] = useState<string>(tracks[0]?.id || 'track-python');

  const filteredTracks = selectedCategory === 'all'
    ? tracks
    : tracks.filter((t) => t.category === selectedCategory);

  const activeTrack = tracks.find((t) => t.id === selectedTrackId) || tracks[0];

  const isTopicLocked = (topic: Topic): boolean => {
    if (!topic.prerequisiteTopicIds || topic.prerequisiteTopicIds.length === 0) return false;
    // Check if all prerequisites have mastery >= 70
    return topic.prerequisiteTopicIds.some((prereqId) => {
      const prog = userTopicProgress[prereqId];
      return !prog || (prog.masteryScore || 0) < 70;
    });
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
            <GraduationCap className="w-4 h-4" />
            <span>Structured Curriculum</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Learning Tracks & Topic Hierarchy
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Enforced prerequisite progression. Master core concepts before unlocking advanced algorithmic modules.
          </p>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto">
          {[
            { id: 'all', label: 'All Tracks' },
            { id: 'language', label: 'Languages' },
            { id: 'cs_core', label: 'CS Core & DSA' },
            { id: 'interview', label: 'Interview Prep' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === cat.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Track Selector Carousel / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filteredTracks.map((track) => {
          const isSelected = track.id === activeTrack.id;
          return (
            <div
              key={track.id}
              onClick={() => setSelectedTrackId(track.id)}
              className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                isSelected
                  ? 'bg-slate-900 border-indigo-500 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500'
                  : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700`}>
                  {track.category.replace('_', ' ')}
                </span>
                <span className="text-xs font-mono text-cyan-400 font-bold">
                  {track.completedTopics} / {track.totalTopics} Done
                </span>
              </div>

              <h3 className="text-base font-bold text-white mb-1">{track.title}</h3>
              <p className="text-xs text-slate-400 line-clamp-2 mb-4">{track.description}</p>

              <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-800/80">
                <span className="text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  ~{track.estimatedHours}h Total
                </span>
                <span className="text-indigo-400 font-semibold flex items-center gap-1">
                  <span>Explore Track</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Selected Track Syllabus / Topic Tree */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">{activeTrack.title} Curriculum</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                Sequential Prerequisite Path
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">{activeTrack.description}</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Mastery Standard:</span>
            <span className="text-xs font-mono font-bold text-emerald-400">≥70% to Unlock Next</span>
          </div>
        </div>

        {/* Topics List with Locks and Badges */}
        <div className="mt-6 space-y-4">
          {activeTrack.topics.length === 0 ? (
            <div className="p-8 text-center bg-slate-950/40 rounded-xl border border-slate-800">
              <p className="text-xs text-slate-400">Additional modules in this track are unlocking as you progress through foundational tracks.</p>
            </div>
          ) : (
            activeTrack.topics.map((topic, index) => {
              const locked = isTopicLocked(topic);
              const progress = userTopicProgress[topic.id];
              const mastery = progress ? progress.masteryScore : 0;
              const isMastered = mastery >= 80;

              return (
                <div
                  key={topic.id}
                  className={`p-5 rounded-xl border transition flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    locked
                      ? 'bg-slate-950/40 border-slate-800/60 opacity-60'
                      : isMastered
                      ? 'bg-slate-900/90 border-emerald-500/30'
                      : 'bg-slate-950 border-slate-800 hover:border-indigo-500/40'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center justify-center shrink-0">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-mono font-bold text-xs ${
                          locked
                            ? 'bg-slate-800 text-slate-500'
                            : isMastered
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                        }`}
                      >
                        {locked ? <Lock className="w-4 h-4" /> : `0${index + 1}`}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-white">{topic.title}</h3>
                        {isMastered && (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" /> Mastered
                          </span>
                        )}
                        {locked && (
                          <span className="text-[10px] font-medium text-slate-500">
                            (Requires prerequisites)
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{topic.summary}</p>
                      
                      <div className="flex items-center gap-4 text-[11px] text-slate-500 mt-2 font-mono">
                        <span>⏱ ~{topic.estimatedMinutes} mins</span>
                        <span>•</span>
                        <span>{topic.relatedProblemIds.length} Practice Challenges</span>
                        <span>•</span>
                        <span>{topic.interviewQuestions.length} Interview Qs</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-800">
                    <div className="text-right">
                      <div className="text-xs font-bold text-slate-300 font-mono">
                        {mastery}% Mastery
                      </div>
                      <div className="w-20 bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
                        <div
                          className={`h-full rounded-full ${
                            isMastered ? 'bg-emerald-400' : 'bg-indigo-500'
                          }`}
                          style={{ width: `${mastery}%` }}
                        />
                      </div>
                    </div>

                    <button
                      disabled={locked}
                      onClick={() => onSelectTopic(topic.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                        locked
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          : isMastered
                          ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                          : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30'
                      }`}
                    >
                      <span>{isMastered ? 'Review Topic' : mastery > 0 ? 'Resume' : 'Start Topic'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
