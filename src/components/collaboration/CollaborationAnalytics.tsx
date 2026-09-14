import React from "react";
import { CollaborationAnalyticsData } from "../../services/collaborationApi";
import { Clock, Users, Code, Award, Sparkles } from "lucide-react";

interface CollaborationAnalyticsProps {
  analytics: CollaborationAnalyticsData | null;
}

export const CollaborationAnalytics: React.FC<CollaborationAnalyticsProps> = ({ analytics }) => {
  if (!analytics) return null;

  return (
    <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-xs mb-6">
      <h3 className="text-base font-bold text-neutral-900 mb-4 flex items-center gap-2">
        <Award className="w-4 h-4 text-indigo-600" />
        Your Collaboration & Pair Coding Metrics
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100">
          <div className="flex items-center gap-2 text-neutral-500 text-xs mb-1">
            <Users className="w-3.5 h-3.5" />
            Sessions Participated
          </div>
          <p className="text-xl font-extrabold text-neutral-900">{analytics.sessions_participated}</p>
        </div>

        <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100">
          <div className="flex items-center gap-2 text-neutral-500 text-xs mb-1">
            <Clock className="w-3.5 h-3.5" />
            Time Collaborating
          </div>
          <p className="text-xl font-extrabold text-neutral-900">{analytics.time_collaborating_minutes} mins</p>
        </div>

        <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100">
          <div className="flex items-center gap-2 text-neutral-500 text-xs mb-1">
            <Code className="w-3.5 h-3.5" />
            Pair Sessions
          </div>
          <p className="text-xl font-extrabold text-neutral-900">{analytics.pair_sessions}</p>
        </div>

        <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100">
          <div className="flex items-center gap-2 text-neutral-500 text-xs mb-1">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            AI Co-Pilot Interactions
          </div>
          <p className="text-xl font-extrabold text-neutral-900">{analytics.ai_interactions}</p>
        </div>
      </div>
    </div>
  );
};
