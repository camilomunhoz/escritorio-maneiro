import React from 'react';
import type { Coworker } from '../../../types';
import { useApp } from '../../../context/AppContext';
import { AvatarSvg } from '../../ui/AvatarSvg';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { ProgressBar } from '../../ui/ProgressBar';
import { ArrowLeft, Award, Flame, Tag, ShieldCheck } from 'lucide-react';

interface CoworkerProfileModalProps {
  coworker: Coworker;
  onClose: () => void;
  onInvite: () => void;
}

export const CoworkerProfileModal: React.FC<CoworkerProfileModalProps> = ({
  coworker,
  onClose,
  onInvite,
}) => {
  const { state } = useApp();
  const medals = state.medals;

  // Selected or unlocked medals of this coworker
  const coworkerMedals = medals.filter(m => (coworker.selectedMedalIds || []).includes(m.id));

  // Balanced XP distribution by pillars simulation
  const xpGames = Math.round(coworker.xp * 0.35);
  const xpHealth = Math.round(coworker.xp * 0.4);
  const xpSocial = Math.round(coworker.xp * 0.25);

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
            <ShieldCheck size={14} className="text-sage-700" />
            <span>Perfil do Colega</span>
          </h3>
        </div>
      </div>

      {/* Profile Identity Card & Scrollable Body */}
      <div className="p-4 flex-1 overflow-y-auto flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <AvatarSvg color={coworker.avatarColor} size="lg" projected />
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-calm-900 truncate">{coworker.name}</h3>
              <p className="text-xs text-calm-500 truncate">{coworker.department}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="sage" size="sm">Nível {coworker.level}</Badge>
                <span className="flex items-center gap-0.5 text-xs font-semibold text-amber-700">
                  <Flame size={12} className="text-amber-600 fill-amber-500" />
                  {coworker.streak} dias
                </span>
              </div>
            </div>
          </div>

          {/* Desdobramento de XP por Pilares (Público) */}
          <div className="bg-calm-50 p-3 rounded-xl border border-calm-200 flex flex-col gap-2">
            <div className="flex justify-between text-xs font-semibold text-calm-800">
              <span>Distribuição de Esforço</span>
              <span className="text-calm-600 font-normal">{coworker.xp} XP Totais</span>
            </div>

            <div className="space-y-1.5 text-[11px]">
              <div>
                <div className="flex justify-between text-calm-600 mb-0.5">
                  <span>Jogos & Foco Mental</span>
                  <span className="font-medium text-calm-800">{xpGames} XP</span>
                </div>
                <ProgressBar value={35} max={100} color="slate" height="sm" />
              </div>

              <div>
                <div className="flex justify-between text-calm-600 mb-0.5">
                  <span>Saúde & Postura</span>
                  <span className="font-medium text-calm-800">{xpHealth} XP</span>
                </div>
                <ProgressBar value={40} max={100} color="sage" height="sm" />
              </div>

              <div>
                <div className="flex justify-between text-calm-600 mb-0.5">
                  <span>Social & Integração</span>
                  <span className="font-medium text-calm-800">{xpSocial} XP</span>
                </div>
                <ProgressBar value={25} max={100} color="sand" height="sm" />
              </div>
            </div>
          </div>

          {/* Medalhas Públicas */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-calm-800 flex items-center gap-1">
              <Award size={13} className="text-sand-600" />
              <span>Conquistas em Destaque</span>
            </span>

            <div className="grid grid-cols-3 gap-1.5">
              {coworkerMedals.length > 0 ? (
                coworkerMedals.map(m => (
                  <div
                    key={m.id}
                    className="p-1.5 rounded-lg border border-sand-200 bg-sand-50/60 flex flex-col items-center text-center"
                  >
                    <Award size={14} className="text-amber-600" />
                    <span className="text-[9px] font-medium text-sand-900 mt-0.5 truncate max-w-[70px]">
                      {m.title}
                    </span>
                  </div>
                ))
              ) : (
                <div className="col-span-3 text-[11px] text-calm-400 italic text-center py-1">
                  Nenhuma medalha pública fixada
                </div>
              )}
            </div>
          </div>

          {/* Tags de Afinidade */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-calm-800 flex items-center gap-1">
              <Tag size={12} className="text-calm-500" />
              <span>Interesses Declarados</span>
            </span>
            <div className="flex flex-wrap gap-1">
              {(coworker.interests || []).map(tag => (
                <span
                  key={tag}
                  className="text-[10px] bg-calm-100 text-calm-700 px-2 py-0.5 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Privacidade garantida */}
          <p className="text-[10px] text-calm-400 italic text-center">
            Metas individuais e rotinas de saúde são privadas e nunca exibidas a terceiros.
          </p>
        </div>

        {/* Footer CTA */}
        <div className="p-3 bg-calm-50 border-t border-calm-200 flex items-center justify-end gap-2 shrink-0">
          <Button variant="subtle" size="sm" onClick={onClose} className="text-xs">
            Voltar
          </Button>
          <Button variant="primary" size="sm" onClick={onInvite} className="text-xs">
            Convidar para Pausa
          </Button>
        </div>
      </div>
    );
  };

export default CoworkerProfileModal;
