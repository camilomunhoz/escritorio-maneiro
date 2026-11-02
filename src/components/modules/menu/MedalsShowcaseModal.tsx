import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import type { MedalTier } from '../../../types';
import { Modal } from '../../ui/Modal';
import { ProgressBar } from '../../ui/ProgressBar';
import { Award, Lock } from 'lucide-react';

interface MedalsShowcaseModalProps {
  onClose: () => void;
  zIndex?: number;
}

export const MedalsShowcaseModal: React.FC<MedalsShowcaseModalProps> = ({ onClose, zIndex }) => {
  const { state } = useApp();
  const { medals } = state;

  const [activeTier, setActiveTier] = useState<MedalTier | 'all'>('all');

  const filteredMedals = activeTier === 'all' ? medals : medals.filter(m => m.tier === activeTier);

  const tierColors: Record<MedalTier, { border: string; bg: string; text: string; label: string }> = {
    bronze: { border: 'border-amber-700/30', bg: 'bg-amber-700/10', text: 'text-amber-800', label: 'Bronze' },
    silver: { border: 'border-slate-400/40', bg: 'bg-slate-300/20', text: 'text-slate-700', label: 'Prata' },
    gold: { border: 'border-yellow-500/40', bg: 'bg-yellow-400/15', text: 'text-yellow-800', label: 'Ouro' },
    platinum: { border: 'border-teal-400/40', bg: 'bg-teal-400/15', text: 'text-teal-800', label: 'Platina' },
  };

  const unlockedCount = medals.filter(m => m.unlocked).length;

  return (
    <Modal
      title="Medalhas & Conquistas"
      icon={<Award size={15} className="text-amber-600" />}
      onClose={onClose}
      zIndex={zIndex}
      headerRight={
        <span className="text-[10px] text-calm-500 font-medium">
          {unlockedCount}/{medals.length}
        </span>
      }
      contentClassName="flex-1 overflow-y-auto min-h-0 flex flex-col"
    >
      {/* Filter Tabs by Tier */}
      <div className="flex items-center gap-1 px-3 py-2 bg-calm-100/70 border-b border-calm-200 text-[11px] overflow-x-auto shrink-0">
        {(['all', 'bronze', 'silver', 'gold', 'platinum'] as const).map(tier => {
          const isSelected = activeTier === tier;
          const label = tier === 'all' ? 'Todas' : tierColors[tier].label;

          return (
            <button
              key={tier}
              onClick={() => setActiveTier(tier)}
              className={`px-2.5 py-1 rounded-md font-medium transition cursor-pointer shrink-0 ${
                isSelected
                  ? 'bg-white text-calm-900 shadow-xs'
                  : 'text-calm-600 hover:text-calm-900'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Grid of Medals */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {filteredMedals.map(medal => {
          const isUnlocked = medal.unlocked;
          const tier = medal.tier;
          const colors = tierColors[tier];

          return (
            <div
              key={medal.id}
              className={`p-3 rounded-xl border transition-all ${
                isUnlocked
                  ? 'bg-white border-calm-200 shadow-soft'
                  : 'bg-calm-50/70 border-calm-200/60 opacity-70'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${colors.bg} ${colors.border}`}
                >
                  {isUnlocked ? (
                    <Award size={20} className={colors.text} />
                  ) : (
                    <Lock size={18} className="text-calm-400" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-bold text-calm-900 truncate">
                      {medal.title}
                    </h4>
                    <span
                      className={`text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded ${colors.bg} ${colors.text}`}
                    >
                      {colors.label}
                    </span>
                  </div>

                  <p className="text-[11px] text-calm-500 mt-0.5 leading-snug">
                    {medal.description}
                  </p>

                  <div className="mt-2">
                    <div className="flex justify-between text-[10px] text-calm-500 mb-1 font-mono">
                      <span>Progresso</span>
                      <span>
                        {medal.progress} / {medal.maxProgress}
                      </span>
                    </div>
                    <ProgressBar
                      value={medal.progress}
                      max={medal.maxProgress}
                      color={isUnlocked ? 'sage' : 'slate'}
                      height="sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Modal>
  );
};

export default MedalsShowcaseModal;
