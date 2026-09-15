import React from 'react';
import { ExecutionCenter as ExecutionCenterComponent } from '../components/aios/ExecutionCenter';

export const ExecutionCenterPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-neutral-100 p-8">
      <div className="max-w-7xl mx-auto">
        <ExecutionCenterComponent />
      </div>
    </div>
  );
};

export default ExecutionCenterPage;
