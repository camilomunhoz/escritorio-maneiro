import React, { useState, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import type { Coworker, InvitationType } from '../../../types';
import { AvatarSvg } from '../../ui/AvatarSvg';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { InvitationModal } from './InvitationModal';
import { formatNotificationTime } from '../../../utils/formatters';
import {
  Users,
  Send,
  Sparkles,
  Coffee,
  Sun,
  Utensils,
  MessageSquare,
  History,
  CheckCircle2,
  Clock,
} from 'lucide-react';

interface SocialScreenProps {
  onOpenCoworkerProfile: (coworker: Coworker) => void;
  initialSubTab?: 'recommendations' | 'coworkers' | 'invitations';
}

export const SocialScreen: React.FC<SocialScreenProps> = ({
  onOpenCoworkerProfile,
  initialSubTab,
}) => {
  const {
    state,
    createInvitation,
    acceptFriendRequest,
    declineFriendRequest,
  } = useApp();
  const { user, coworkers, invitations } = state;

  const [activeTab, setActiveTab] = useState<'recommendations' | 'coworkers' | 'invitations'>(
    initialSubTab || 'recommendations'
  );
  const [selectedCoworkerForInvite, setSelectedCoworkerForInvite] = useState<Coworker | null>(null);

  useEffect(() => {
    if (initialSubTab) {
      setActiveTab(initialSubTab);
    }
  }, [initialSubTab]);

  // Coworkers scored by interest similarity
  const scoredCoworkers = coworkers.map(cw => {
    const commonTags = (cw.interests || []).filter(t => (user.interests || []).includes(t));
    return {
      ...cw,
      commonTags,
      affinityScore: commonTags.length,
    };
  }).sort((a, b) => b.affinityScore - a.affinityScore);

  const handleSendInvite = (type: 'cafe' | 'almoco' | 'sol' | 'conversa') => {
    if (selectedCoworkerForInvite) {
      createInvitation(selectedCoworkerForInvite.id, type);
      setSelectedCoworkerForInvite(null);
    }
  };

  const pendingInvitations = invitations.filter(i => i.status === 'pending');
  const pendingCount = pendingInvitations.length;

  const getInvitationIcon = (type: InvitationType) => {
    switch (type) {
      case 'cafe':
        return <Coffee size={14} className="text-amber-700" />;
      case 'almoco':
        return <Utensils size={14} className="text-emerald-700" />;
      case 'sol':
        return <Sun size={14} className="text-amber-500" />;
      case 'conversa':
        return <MessageSquare size={14} className="text-indigo-600" />;
      default:
        return <Coffee size={14} className="text-amber-700" />;
    }
  };

  const getInvitationLabel = (type: InvitationType) => {
    switch (type) {
      case 'cafe':
        return 'Pausa do Café';
      case 'almoco':
        return 'Almoço Compartilhado';
      case 'sol':
        return 'Banho de Sol (10 min)';
      case 'conversa':
        return 'Papo de Corredor';
      default:
        return 'Encontro Presencial';
    }
  };

  return (
    <div className="w-full h-full flex flex-col overflow-hidden select-none relative">
      {/* 1. Header Fixado do Módulo Social */}
      <div className="px-4 py-2.5 border-b border-calm-200 bg-calm-50/90 flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-sm font-semibold text-calm-900 flex items-center gap-1.5">
            <Users size={16} className="text-sage-700" />
            <span>Conexões Presenciais</span>
          </h2>
          <p className="text-[11px] text-calm-500">Afinidades, colegas e convites de integração</p>
        </div>
        <Badge variant="calm" size="sm">
          {coworkers.filter(c => c.isFriend).length} conexões
        </Badge>
      </div>

      {/* Conteúdo Rolável */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0 flex flex-col justify-start">
        {/* Sub-tabs: Recomendações vs Colegas vs Convites */}
        <div className="flex items-center gap-1 bg-calm-100 p-0.5 rounded-lg text-xs">
          <button
            onClick={() => setActiveTab('recommendations')}
            className={`flex-1 py-1 text-center font-medium rounded-md transition cursor-pointer ${
              activeTab === 'recommendations'
                ? 'bg-white text-calm-900 shadow-xs'
                : 'text-calm-600 hover:text-calm-900'
            }`}
          >
            Recomendados
          </button>
          <button
            onClick={() => setActiveTab('coworkers')}
            className={`flex-1 py-1 text-center font-medium rounded-md transition cursor-pointer ${
              activeTab === 'coworkers'
                ? 'bg-white text-calm-900 shadow-xs'
                : 'text-calm-600 hover:text-calm-900'
            }`}
          >
            Todos ({coworkers.length})
          </button>
          <button
            onClick={() => setActiveTab('invitations')}
            className={`flex-1 py-1 text-center font-medium rounded-md transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'invitations'
                ? 'bg-white text-calm-900 shadow-xs'
                : 'text-calm-600 hover:text-calm-900'
            }`}
          >
            <span>Convites</span>
            {pendingCount > 0 && (
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" title={`${pendingCount} convites pendentes`} />
            )}
          </button>
        </div>

        {/* Content: 1. Recommendations */}
        {activeTab === 'recommendations' && (
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-calm-800 flex items-center gap-1">
                <Sparkles size={13} className="text-sand-600" />
                <span>Maior Afinidade por Interesses</span>
              </span>
              <span className="text-[10px] text-calm-500">Interesses em comum</span>
            </div>

            <div className="flex flex-col gap-2">
              {scoredCoworkers.slice(0, 4).map(cw => (
                <div
                  key={cw.id}
                  className="p-2.5 rounded-xl border border-calm-200 bg-white shadow-soft flex flex-col gap-2 transition hover:border-calm-300"
                >
                  <div className="flex items-center justify-between">
                    <div
                      onClick={() => onOpenCoworkerProfile(cw)}
                      className="flex items-center gap-2 cursor-pointer min-w-0"
                    >
                      <AvatarSvg color={cw.avatarColor} size="sm" />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-calm-900 truncate">{cw.name}</p>
                        <p className="text-[10px] text-calm-500 truncate">{cw.department}</p>
                      </div>
                    </div>

                    <Badge variant="sage" size="sm">
                      {cw.affinityScore} {cw.affinityScore === 1 ? 'interesse comum' : 'interesses comuns'}
                    </Badge>
                  </div>

                  {/* Common Tags Pills */}
                  <div className="flex flex-wrap gap-1">
                    {cw.commonTags.map(tag => (
                      <span
                        key={tag}
                        className="text-[9px] bg-sand-50 text-sand-800 border border-sand-200 px-1.5 py-0.5 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Actions: Send invitation or open profile */}
                  <div className="pt-2 border-t border-calm-100 flex items-center justify-between gap-2">
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => setSelectedCoworkerForInvite(cw)}
                      className="text-xs gap-1 flex-1 py-1"
                    >
                      <Send size={11} />
                      <span>Convidar para Pausa</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onOpenCoworkerProfile(cw)}
                      className="text-xs px-2.5 py-1"
                    >
                      Ver Perfil
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Content: 2. Coworkers List */}
        {activeTab === 'coworkers' && (
          <div className="flex flex-col gap-2">
            {coworkers.map(cw => (
              <div
                key={cw.id}
                className="p-2 rounded-lg border border-calm-200 bg-white flex items-center justify-between gap-2"
              >
                <div
                  onClick={() => onOpenCoworkerProfile(cw)}
                  className="flex items-center gap-2.5 min-w-0 cursor-pointer"
                >
                  <AvatarSvg color={cw.avatarColor} size="sm" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-calm-900 truncate">{cw.name}</p>
                    <p className="text-[10px] text-calm-500 truncate">{cw.department}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <Button
                    size="sm"
                    variant="subtle"
                    onClick={() => setSelectedCoworkerForInvite(cw)}
                    className="text-xs px-2 py-1"
                  >
                    Convidar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Content: 3. Convites (Histórico & Convites Recentes com circle badge vermelho) */}
        {activeTab === 'invitations' && (
          <div className="flex flex-col gap-3">
            {/* Seção 1: Convites Pendentes */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-calm-900 flex items-center gap-1.5">
                  <Clock size={13} className="text-calm-600" />
                  <span>Convites Não Atendidos</span>
                </span>
                {pendingCount > 0 && (
                  <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                    {pendingCount} pendente{pendingCount > 1 ? 's' : ''}
                  </span>
                )}
              </div>

              {pendingInvitations.length > 0 ? (
                <div className="space-y-1.5">
                  {pendingInvitations.map(inv => (
                    <div
                      key={inv.id}
                      className="p-2.5 rounded-xl border border-rose-200 bg-rose-50/40 flex items-center justify-between gap-2 shadow-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="relative">
                          <AvatarSvg color={inv.senderAvatarColor || '#C87D6B'} size="sm" />
                          <span
                            className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white"
                            title="Não atendido"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-calm-900 truncate">{inv.senderName}</p>
                          <p className="text-[11px] text-calm-600 flex items-center gap-1">
                            {getInvitationIcon(inv.type)}
                            <span>{getInvitationLabel(inv.type)}</span>
                          </p>
                          <span className="text-[9px] text-calm-400">
                            {formatNotificationTime(inv.timestamp)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => acceptFriendRequest(inv.senderId)}
                          className="px-2 py-1 rounded bg-sage-600 text-white text-[11px] font-medium hover:bg-sage-700 transition cursor-pointer"
                        >
                          Aceitar
                        </button>
                        <button
                          onClick={() => declineFriendRequest(inv.senderId)}
                          className="px-2 py-1 rounded bg-calm-100 text-calm-700 text-[11px] font-medium hover:bg-calm-200 transition cursor-pointer"
                        >
                          Recusar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 rounded-xl border border-calm-200 bg-calm-50/50 text-center py-4">
                  <p className="text-xs text-calm-600 font-medium">Nenhum convite pendente</p>
                  <p className="text-[10px] text-calm-400 mt-0.5">
                    Quando colegas convidarem você para um café ou almoço, eles aparecerão aqui.
                  </p>
                </div>
              )}
            </div>

            {/* Seção 2: Histórico de Encontros (Placeholder) */}
            <div className="space-y-2 pt-2 border-t border-calm-200/70">
              <span className="text-xs font-semibold text-calm-900 flex items-center gap-1.5">
                <History size={13} className="text-calm-600" />
                <span>Histórico de Encontros</span>
              </span>

              <div className="space-y-1.5">
                <div className="p-2.5 rounded-xl border border-calm-200 bg-white flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <AvatarSvg color="#C87D6B" size="sm" />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-calm-900 truncate">Mariana Costa</p>
                      <p className="text-[10px] text-calm-500">Pausa do Café • Ontem às 15:30</p>
                    </div>
                  </div>
                  <span className="flex items-center gap-1 text-[10px] text-sage-800 bg-sage-50 border border-sage-200 px-2 py-0.5 rounded-full shrink-0 font-medium">
                    <CheckCircle2 size={11} className="text-sage-700" />
                    <span>Concluído</span>
                  </span>
                </div>

                <div className="p-2.5 rounded-xl border border-calm-200 bg-white flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <AvatarSvg color="#5A6B7C" size="sm" />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-calm-900 truncate">Bruno Oliveira</p>
                      <p className="text-[10px] text-calm-500">Almoço Compartilhado • Há 3 dias</p>
                    </div>
                  </div>
                  <span className="flex items-center gap-1 text-[10px] text-sage-800 bg-sage-50 border border-sage-200 px-2 py-0.5 rounded-full shrink-0 font-medium">
                    <CheckCircle2 size={11} className="text-sage-700" />
                    <span>Concluído</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Invitation Modal if active */}
      {selectedCoworkerForInvite && (
        <InvitationModal
          coworker={selectedCoworkerForInvite}
          userName={user.name}
          userAvatarColor={user.avatarColor}
          onClose={() => setSelectedCoworkerForInvite(null)}
          onSend={handleSendInvite}
        />
      )}
    </div>
  );
};

export default SocialScreen;
