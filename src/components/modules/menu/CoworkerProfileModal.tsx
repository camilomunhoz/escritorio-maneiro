import React from 'react';
import type { Coworker } from '../../../types';
import { useApp } from '../../../context/AppContext';
import { AvatarSvg } from '../../ui/AvatarSvg';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { ProgressBar } from '../../ui/ProgressBar';
import { ArrowLeft, Award, Flame, Tag, ShieldCheck } from 'lucide-react';

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
  const { state } = useApp();
  const medals = state.medals;

  const profile = isOwnProfile ? state.user : coworker;

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

  return (
    <div className="absolute inset-0 z-40 bg-white flex flex-col select-none overflow-hidden animate-fadeIn">
      {/* Header with back button */}
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

      {/* Profile Identity Card & Scrollable Body */}
      <div className="p-4 flex-1 overflow-y-auto flex flex-col gap-3 max-w-lg mx-auto w-full">
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

        {/* Desdobramento de XP por Pilares */}
        <div className="bg-calm-50 p-3 rounded-xl border border-calm-200 flex flex-col gap-2">
          <div className="flex justify-between text-xs font-semibold text-calm-800">
            <span>Distribuição de Esforço</span>
            <span className="text-calm-600 font-normal">{totalXp} XP Totais</span>
          </div>

          <div className="space-y-1.5 text-[11px]">
            <div>
              <div className="flex justify-between text-calm-600 mb-0.5">
                <span>Jogos & Foco Mental ({pctGames}%)</span>
                <span className="font-medium text-calm-800">{xpGames} XP</span>
              </div>
              <ProgressBar value={pctGames} max={100} color="slate" height="sm" />
            </div>

            <div>
              <div className="flex justify-between text-calm-600 mb-0.5">
                <span>Saúde & Postura ({pctHealth}%)</span>
                <span className="font-medium text-calm-800">{xpHealth} XP</span>
              </div>
              <ProgressBar value={pctHealth} max={100} color="sage" height="sm" />
            </div>

            <div>
              <div className="flex justify-between text-calm-600 mb-0.5">
                <span>Social & Integração ({pctSocial}%)</span>
                <span className="font-medium text-calm-800">{xpSocial} XP</span>
              </div>
              <ProgressBar value={pctSocial} max={100} color="sand" height="sm" />
            </div>
          </div>
        </div>

        {/* Medalhas Públicas */}
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

        {/* Tags de Afinidade */}
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-calm-800 flex items-center gap-1">
            <Tag size={12} className="text-calm-500" />
            <span>Interesses Declarados</span>
          </span>
          <div className="flex flex-wrap gap-1">
            {(profile.interests || []).length > 0 ? (
              (profile.interests || []).map(tag => (
                <span
                  key={tag}
                  className="text-[10px] bg-calm-100 text-calm-700 px-2 py-0.5 rounded-full"
                >
                  {tag}
                </span>
              ))
            ) : (
              <span className="text-[10px] text-calm-400 italic">Nenhum interesse informado</span>
            )}
          </div>
        </div>

        {/* Privacidade */}
        <p className="text-[10px] text-calm-400 italic text-center">
          {isOwnProfile
            ? 'Seu perfil público exibe seu nível e conquistas para incentivo entre a equipe.'
            : 'Metas individuais e rotinas de saúde são privadas e nunca exibidas a terceiros.'}
        </p>
      </div>

      {/* Footer CTA */}
      <div className="p-3 bg-calm-50 border-t border-calm-200 shrink-0">
        <div className="max-w-lg mx-auto w-full flex items-center justify-end gap-2">
          <Button variant="subtle" size="sm" onClick={onClose} className="text-xs">
            {isOwnProfile ? 'Fechar' : 'Voltar'}
          </Button>
          {!isOwnProfile && onInvite && (
            <Button variant="primary" size="sm" onClick={onInvite} className="text-xs">
              Convidar para Pausa
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoworkerProfileModal;
