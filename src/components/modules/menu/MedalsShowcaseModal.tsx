import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import type { MedalTier } from '../../../types';
import { ProgressBar } from '../../ui/ProgressBar';
import { Award, ArrowLeft, Lock } from 'lucide-react';

interface MedalsShowcaseModalProps {
  onClose: () => void;
}

export const MedalsShowcaseModal: React.FC<MedalsShowcaseModalProps> = ({ onClose }) => {
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

  return (
    <div className="absolute inset-0 z-40 bg-white flex flex-col select-none overflow-hidden">
      {/* Header with back button */}
      <div className="p-3 border-b border-calm-200 flex items-center justify-between bg-calm-50/90 shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="flex items-center gap-1 px-2 py-1 rounded-md text-calm-700 hover:text-calm-900 hover:bg-calm-200/70 transition cursor-pointer text-xs font-medium"
            title="Retornar à tela anterior"
          >
            <ArrowLeft size={15} />
            <span>Voltar</span>
          </button>
          <div className="h-4 w-px bg-calm-300" />
          <h3 className="text-xs font-semibold text-calm-900 flex items-center gap-1.5">
            <Award size={15} className="text-amber-600" />
            <span>Medalhas & Conquistas</span>
          </h3>
        </div>
        <span className="text-[10px] text-calm-500 font-medium">
          {medals.filter(m => m.unlocked).length}/{medals.length}
        </span>
      </div>

        {/* Filter Tabs by Tier */}
        <div className="flex items-center gap-1 px-3 py-2 bg-calm-100/70 border-b border-calm-200 text-[11px] overflow-x-auto">
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

        {/* Medals List */}
        <div className="p-3 overflow-y-auto space-y-2 flex-1">
          {filteredMedals.map(medal => {
            const tierStyle = tierColors[medal.tier];
            const isUnlocked = medal.unlocked;

            return (
              <div
                key={medal.id}
                className={`p-2.5 rounded-xl border transition flex items-start gap-3 ${
                  isUnlocked
                    ? `${tierStyle.bg} ${tierStyle.border}`
                    : 'bg-calm-50/50 border-calm-200/70 opacity-60'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                    isUnlocked ? 'bg-white shadow-soft text-amber-600' : 'bg-calm-200 text-calm-400'
                  }`}
                >
                  {isUnlocked ? <Award size={18} /> : <Lock size={16} />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold text-calm-900 truncate">{medal.title}</h4>
                    <span className={`text-[9px] font-bold uppercase tracking-wider ${tierStyle.text}`}>
                      {tierStyle.label}
                    </span>
                  </div>

                  <p className="text-[10px] text-calm-600 leading-tight mt-0.5">{medal.description}</p>

                  <div className="mt-2 space-y-0.5">
                    <div className="flex justify-between text-[9px] text-calm-500">
                      <span>Progresso</span>
                      <span className="font-mono font-medium">
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
            );
          })}
        </div>
      </div>
    );
  };

export default MedalsShowcaseModal;
