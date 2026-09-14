import React from "react";
import { Users, RefreshCw, Eye, Edit3 } from "lucide-react";

interface PairProgrammingPanelProps {
  driverId?: string;
  navigatorId?: string;
  currentUserId: string;
  participants: any[];
  onSwitchRoles: (driverId: string, navigatorId: string) => void;
}

export const PairProgrammingPanel: React.FC<PairProgrammingPanelProps> = ({
  driverId,
  navigatorId,
  currentUserId,
  participants,
  onSwitchRoles,
}) => {
  const driver = participants.find((p) => p.user_id === driverId) || { user_name: "Host (Driver)" };
  const navigator = participants.find((p) => p.user_id === navigatorId) || { user_name: "Collaborator (Navigator)" };

  const handleSwap = () => {
    const nextDriver = navigatorId || currentUserId;
    const nextNavigator = driverId || currentUserId;
    onSwitchRoles(nextDriver, nextNavigator);
  };

  return (
    <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 mb-4 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-6 text-xs">
        <div className="flex items-center gap-2">
          <Edit3 className="w-4 h-4 text-emerald-600" />
          <div>
            <span className="text-neutral-400 block font-sans text-[10px]">DRIVER (Coding)</span>
            <span className="font-bold text-neutral-900">{driver.user_name}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-amber-600" />
          <div>
            <span className="text-neutral-400 block font-sans text-[10px]">NAVIGATOR (Reviewing)</span>
            <span className="font-bold text-neutral-900">{navigator.user_name}</span>
          </div>
        </div>
      </div>

      <button
        onClick={handleSwap}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 text-neutral-800 font-medium text-xs rounded-xl hover:bg-neutral-200 transition-colors"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        Swap Driver / Navigator
      </button>
    </div>
  );
};
