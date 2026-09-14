import React, { useState } from "react";
import { Building, Award, CheckCircle, Clock } from "lucide-react";

interface InterviewPanelProps {
  company?: string;
  onEvaluate: () => void;
  evaluationResult?: any;
  loading?: boolean;
}

export const InterviewPanel: React.FC<InterviewPanelProps> = ({
  company = "Amazon",
  onEvaluate,
  evaluationResult,
  loading = false,
}) => {
  return (
    <div className="bg-purple-50/50 p-4 rounded-2xl border border-purple-100 mb-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Building className="w-4 h-4 text-purple-700" />
          <h4 className="text-sm font-bold text-purple-900">{company} Mock Interview Mode</h4>
        </div>
        <button
          onClick={onEvaluate}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-700 text-white font-medium text-xs rounded-xl hover:bg-purple-800 transition-colors disabled:opacity-50"
        >
          <Award className="w-3.5 h-3.5" />
          {loading ? "Evaluating..." : "Evaluate Bar Raiser Session"}
        </button>
      </div>

      {evaluationResult && (
        <div className="bg-white p-3.5 rounded-xl border border-purple-100 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-neutral-800">Recommendation:</span>
            <span className="font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">
              {evaluationResult.hiringRecommendation}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 py-1 text-center font-mono">
            <div className="bg-neutral-50 p-1.5 rounded-lg border border-neutral-100">
              <span className="text-[10px] text-neutral-400 block">Overall</span>
              <span className="font-bold text-neutral-900">{evaluationResult.overallScore}%</span>
            </div>
            <div className="bg-neutral-50 p-1.5 rounded-lg border border-neutral-100">
              <span className="text-[10px] text-neutral-400 block">Technical</span>
              <span className="font-bold text-neutral-900">{evaluationResult.technicalScore}%</span>
            </div>
            <div className="bg-neutral-50 p-1.5 rounded-lg border border-neutral-100">
              <span className="text-[10px] text-neutral-400 block">Communication</span>
              <span className="font-bold text-neutral-900">{evaluationResult.communicationScore}%</span>
            </div>
          </div>

          <p className="text-neutral-600 leading-relaxed pt-1">{evaluationResult.detailedFeedback}</p>
        </div>
      )}
    </div>
  );
};
