import React, { useState } from 'react';
import type { Coworker } from '../../../types';
import { useApp } from '../../../context/AppContext';
import { AvatarSvg } from '../../ui/AvatarSvg';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { ArrowLeft, Award, Flame, Tag, ShieldCheck, Plus, X } from 'lucide-react';

interface CoworkerProfileModalProps {
  coworker?: Coworker | null;
  isOwnProfile?: boolean;
  onClose: () => void;
  onInvite?: () => void;
}

export const CoworkerProfileModal: React.FC<CoworkerProfileModalProps> = ({
  coworker,
  isOwnProfile = false,
  onClose,
  onInvite,
}) => {
  const { state, updateUserInterests } = useApp();
  const medals = state.medals;

  const profile = isOwnProfile ? state.user : coworker;
  const [inlineInterest, setInlineInterest] = useState('');

  if (!profile) return null;

  // Selected or unlocked medals of this profile
  const profileMedals = isOwnProfile
    ? medals.filter(m => (state.user.selectedMedalIds || []).includes(m.id) || m.unlocked)
    : medals.filter(m => (coworker?.selectedMedalIds || []).includes(m.id));

  // XP distribution by pillars
  const totalXp = profile.xp;
  const xpGames = isOwnProfile ? state.user.xpGames : Math.round(totalXp * 0.35);
  const xpHealth = isOwnProfile ? state.user.xpHealth : Math.round(totalXp * 0.4);
  const xpSocial = isOwnProfile ? state.user.xpSocial : Math.round(totalXp * 0.25);

  const pctGames = totalXp > 0 ? Math.round((xpGames / totalXp) * 100) : 33;
  const pctHealth = totalXp > 0 ? Math.round((xpHealth / totalXp) * 100) : 34;
  const pctSocial = totalXp > 0 ? Math.max(0, 100 - pctGames - pctHealth) : 33;

  const handleAddInlineInterest = () => {
    const trimmed = inlineInterest.trim();
    if (!trimmed) return;
    const current = state.user.interests || [];
    const exists = current.some(t => t.toLowerCase() === trimmed.toLowerCase());
    if (!exists) {
      updateUserInterests([...current, trimmed]);
    }
    setInlineInterest('');
  };

  const handleRemoveInterest = (tagToRemove: string) => {
    const current = state.user.interests || [];
    updateUserInterests(current.filter(t => t !== tagToRemove));
  };

  return (
    <div className="absolute inset-0 z-40 bg-white flex flex-col select-none overflow-hidden animate-fadeIn">
      {/* 1. Header with back button */}
      <div className="p-3 border-b border-calm-200 bg-calm-50/90 shrink-0">
        <div className="max-w-lg mx-auto w-full flex items-center justify-between">
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
              <span>{isOwnProfile ? 'Meu Perfil' : 'Perfil do Colega'}</span>
            </h3>
          </div>
        </div>
      </div>

      {/* 2. Profile Identity Card & Scrollable Body */}
      <div className="p-4 flex-1 overflow-y-auto flex flex-col gap-3 max-w-lg mx-auto w-full min-h-0">
        <div className="flex items-center gap-3">
          <AvatarSvg color={profile.avatarColor} size="lg" projected />
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-calm-900 truncate">{profile.name}</h3>
            <p className="text-xs text-calm-500 truncate">{profile.department}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="sage" size="sm">Nível {profile.level}</Badge>
              <span className="flex items-center gap-0.5 text-xs font-semibold text-amber-700">
                <Flame size={12} className="text-amber-600 fill-amber-500" />
                {profile.streak} dias
              </span>
            </div>
          </div>
        </div>

        {/* 3. Desdobramento de XP Compacto (uma única linha dividida em cores) */}
        {isOwnProfile && (
          <div className="bg-calm-50 p-2.5 rounded-xl border border-calm-200 flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-calm-800">Distribuição de Esforço</span>
              <span className="text-calm-500 text-[11px] font-normal">{totalXp} XP Totais</span>
            </div>

            {/* Barra contínua segmentada em cores */}
            <div className="w-full h-2 rounded-full bg-calm-200 overflow-hidden flex">
              <div
                style={{ width: `${pctGames}%` }}
                className="bg-indigo-500 h-full transition-all"
                title={`Jogos: ${pctGames}% (${xpGames} XP)`}
              />
              <div
                style={{ width: `${pctHealth}%` }}
                className="bg-sage-600 h-full transition-all"
                title={`Saúde: ${pctHealth}% (${xpHealth} XP)`}
              />
              <div
                style={{ width: `${pctSocial}%` }}
                className="bg-sand-500 h-full transition-all"
                title={`Social: ${pctSocial}% (${xpSocial} XP)`}
              />
            </div>

            {/* Legenda inline compacta */}
            <div className="flex items-center justify-between text-[10px] text-calm-600 pt-0.5">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                <span>Jogos {pctGames}%</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-sage-600" />
                <span>Saúde {pctHealth}%</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-sand-500" />
                <span>Social {pctSocial}%</span>
              </span>
            </div>
          </div>
        )}

        {/* 4. Conquistas / Medalhas */}
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-calm-800 flex items-center gap-1">
            <Award size={13} className="text-sand-600" />
            <span>{isOwnProfile ? 'Suas Conquistas' : 'Conquistas em Destaque'}</span>
          </span>

          <div className="grid grid-cols-3 gap-1.5">
            {profileMedals.length > 0 ? (
              profileMedals.slice(0, 6).map(m => (
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

        {/* 5. Meus Interesses (Gerência completa no perfil com inline input) */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-calm-800 flex items-center gap-1">
              <Tag size={12} className="text-calm-500" />
              <span>{isOwnProfile ? 'Meus Interesses' : 'Interesses Declarados'}</span>
            </span>
            {isOwnProfile && (
              <span className="text-[10px] text-calm-400">
                {(state.user.interests || []).length} selecionados
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {isOwnProfile ? (
              <>
                {(state.user.interests || []).map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleRemoveInterest(tag)}
                    className="px-2.5 py-1 rounded-full text-xs font-medium bg-sage-600 text-white shadow-soft transition cursor-pointer flex items-center gap-1 group"
                    title={`Remover ${tag}`}
                  >
                    <Tag size={11} />
                    <span>{tag}</span>
                    <X size={10} className="text-white/80 group-hover:text-white" />
                  </button>
                ))}

                {/* Inline input após os pills no final da lista */}
                <div className="inline-flex items-center px-2 py-0.5 rounded-full text-xs border border-dashed border-calm-300 bg-white hover:border-sage-400 focus-within:border-sage-600 focus-within:ring-1 focus-within:ring-sage-500 transition">
                  <Plus size={11} className="text-calm-400 mr-1 shrink-0" />
                  <input
                    type="text"
                    value={inlineInterest}
                    onChange={e => setInlineInterest(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddInlineInterest();
                      }
                    }}
                    placeholder="Adicionar..."
                    maxLength={25}
                    className="w-20 bg-transparent outline-none text-calm-800 placeholder:text-calm-400 text-xs"
                  />
                </div>
              </>
            ) : (
              (coworker?.interests || []).length > 0 ? (
                (coworker?.interests || []).map(tag => (
                  <span
                    key={tag}
                    className="text-[10px] bg-calm-100 text-calm-700 px-2 py-0.5 rounded-full"
                  >
                    {tag}
                  </span>
                ))
              ) : (
                <span className="text-[10px] text-calm-400 italic">Nenhum interesse informado</span>
              )
            )}
          </div>
        </div>
      </div>

      {/* 6. Footer CTA - Exibido apenas em perfis de colegas */}
      {!isOwnProfile && (
        <div className="p-3 bg-calm-50 border-t border-calm-200 shrink-0">
          <div className="max-w-lg mx-auto w-full flex items-center justify-end gap-2">
            <Button variant="subtle" size="sm" onClick={onClose} className="text-xs">
              Voltar
            </Button>
            {onInvite && (
              <Button variant="primary" size="sm" onClick={onInvite} className="text-xs">
                Convidar para Pausa
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CoworkerProfileModal;
