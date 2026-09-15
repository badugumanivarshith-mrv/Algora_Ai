import React from "react";
import { CognitiveIntelligenceCenter } from "../components/aios/CognitiveIntelligenceCenter";

export const CognitiveHub: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-neutral-100 p-8">
      <div className="max-w-7xl mx-auto">
        <CognitiveIntelligenceCenter />
      </div>
    </div>
  );
};

export default CognitiveHub;
