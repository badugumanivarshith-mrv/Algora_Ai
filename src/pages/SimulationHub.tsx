import React from 'react';
import { SimulationCenter } from '../components/aios/SimulationCenter';

export const SimulationHub: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-neutral-100 p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <SimulationCenter />
      </div>
    </div>
  );
};

export default SimulationHub;
