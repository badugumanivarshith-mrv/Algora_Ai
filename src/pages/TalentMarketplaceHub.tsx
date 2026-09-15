import React from 'react';
import { TalentMarketplace } from '../components/aios/TalentMarketplace';

export const TalentMarketplaceHub: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-neutral-100 p-8">
      <div className="max-w-7xl mx-auto">
        <TalentMarketplace />
      </div>
    </div>
  );
};

export default TalentMarketplaceHub;
