import React, { useState } from 'react';
import type { Coworker } from '../../../types';
import { useApp } from '../../../context/AppContext';
import { Modal } from '../../ui/Modal';
import { UserAvatar } from '../../ui/UserAvatar';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { Award, Flame, Tag, ShieldCheck, Plus, X } from 'lucide-react';

interface CoworkerProfileModalProps {
  coworker?: Coworker | null;
  isOwnProfile?: boolean;
  onClose: () => void;
  onInvite?: () => void;
  zIndex?: number;
}

export const CoworkerProfileModal: React.FC<CoworkerProfileModalProps> = ({
  coworker,
  isOwnProfile = false,
  onClose,
  onInvite,
  zIndex,
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
    <Modal
      title={isOwnProfile ? 'Meu Perfil' : 'Perfil do Colega'}
      icon={<ShieldCheck size={14} className="text-sage-700" />}
      onClose={onClose}
      zIndex={zIndex}
      contentClassName="flex-1 overflow-y-auto flex flex-col min-h-0"
    >
      {/* Profile Identity Card & Scrollable Body */}
      <div className="p-4 flex-1 flex flex-col gap-3 max-w-lg mx-auto w-full min-h-0">
        <div className="flex items-center gap-3">
          <UserAvatar userId={profile.id} user={profile} size="xl" followMouse projected />
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

        {/* Desdobramento de XP Compacto */}
        {isOwnProfile && (
          <div className="bg-calm-50 p-2.5 rounded-xl border border-calm-200 flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-calm-800">Distribuição de Esforço</span>
              <span className="text-calm-500 text-[11px] font-normal">{totalXp} XP Totais</span>
            </div>

            <div className="w-full h-2 rounded-full bg-calm-200 overflow-hidden flex">
              <div
                style={{ width: `${pctGames}%` }}
                className="bg-amber-500 h-full transition-all"
                title={`Jogos: ${xpGames} XP (${pctGames}%)`}
              />
              <div
                style={{ width: `${pctHealth}%` }}
                className="bg-sage-600 h-full transition-all"
                title={`Saúde: ${xpHealth} XP (${pctHealth}%)`}
              />
              <div
                style={{ width: `${pctSocial}%` }}
                className="bg-sky-500 h-full transition-all"
                title={`Social: ${xpSocial} XP (${pctSocial}%)`}
              />
            </div>

            <div className="flex items-center justify-between text-[10px] text-calm-500 pt-0.5">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                Jogos {pctGames}%
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-sage-600" />
                Saúde {pctHealth}%
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                Social {pctSocial}%
              </span>
            </div>
          </div>
        )}

        {/* Vitrine de Conquistas em Destaque */}
        <div className="bg-white rounded-xl border border-calm-200 p-3 shadow-soft flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-calm-800 flex items-center gap-1.5">
              <Award size={13} className="text-amber-600" />
              Medalhas em Destaque
            </span>
            <span className="text-[10px] text-calm-400">
              {profileMedals.length} exibidas
            </span>
          </div>

          {profileMedals.length > 0 ? (
            <div className="grid grid-cols-2 gap-2 mt-1">
              {profileMedals.slice(0, 4).map(medal => (
                <div
                  key={medal.id}
                  className="p-2 rounded-lg bg-calm-50/80 border border-calm-200/70 flex items-center gap-2"
                >
                  <div className="w-7 h-7 rounded-md bg-amber-100/70 border border-amber-300/60 flex items-center justify-center text-amber-800 shrink-0">
                    <Award size={14} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold text-calm-900 truncate">
                      {medal.title}
                    </p>
                    <p className="text-[9px] text-calm-500 truncate capitalize">
                      {medal.tier}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[11px] text-calm-400 py-1 italic">
              Nenhuma medalha selecionada para exibição pública.
            </p>
          )}
        </div>

        {/* Tags de Interesses Sociais */}
        <div className="bg-white rounded-xl border border-calm-200 p-3 shadow-soft flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-calm-800 flex items-center gap-1.5">
              <Tag size={13} className="text-calm-500" />
              Interesses & Afinidades
            </span>
            {isOwnProfile && (
              <span className="text-[10px] text-calm-400">
                {(state.user.interests || []).length} ativos
              </span>
            )}
          </div>

          {isOwnProfile && (
            <div className="flex items-center gap-1.5 mt-0.5">
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
                placeholder="Adicionar interesse (ex: Café, Xadrez, Ciclismo)..."
                className="flex-1 px-2.5 py-1 text-xs rounded-lg border border-calm-300 bg-calm-50/50 focus:outline-none focus:ring-1 focus:ring-sage-500 focus:bg-white transition"
              />
              <button
                onClick={handleAddInlineInterest}
                disabled={!inlineInterest.trim()}
                className="px-2.5 py-1 bg-sage-600 hover:bg-sage-700 disabled:opacity-40 text-white rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1"
                title="Adicionar interesse"
              >
                <Plus size={12} />
                <span>Adicionar</span>
              </button>
            </div>
          )}

          <div className="flex flex-wrap gap-1.5 mt-1">
            {isOwnProfile ? (
              (state.user.interests || []).length > 0 ? (
                (state.user.interests || []).map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] bg-calm-100 text-calm-800 border border-calm-200"
                  >
                    <span>{tag}</span>
                    <button
                      onClick={() => handleRemoveInterest(tag)}
                      className="text-calm-400 hover:text-calm-700 transition"
                      title="Remover"
                    >
                      <X size={11} />
                    </button>
                  </span>
                ))
              ) : (
                <span className="text-[10px] text-calm-400 italic">
                  Adicione temas que você gosta para facilitar conexões e pausas
                </span>
              )
            ) : (
              (coworker?.interests || []).length > 0 ? (
                (coworker?.interests || []).map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] bg-calm-100 text-calm-800 border border-calm-200"
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

      {/* Footer CTA - Exibido apenas em perfis de colegas */}
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
    </Modal>
  );
};

export default CoworkerProfileModal;
