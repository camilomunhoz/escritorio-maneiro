import React, { useState, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import type { Coworker, InvitationType } from '../../../types';
import { UserAvatar } from '../../ui/UserAvatar';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { ProgressBar } from '../../ui/ProgressBar';
import { SegmentedControl } from '../../ui/SegmentedControl';
import { NewConnectionModal } from './NewConnectionModal';
import { calculateConnectionLevel } from '../../../utils/socialUtils';
import { formatNotificationTime } from '../../../utils/formatters';
import { audioService } from '../../../services/audioService';
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
  UserPlus,
  Radio,
  HeartHandshake,
} from 'lucide-react';

interface SocialScreenProps {
  onOpenCoworkerProfile: (coworker: Coworker) => void;
  onOpenInvite?: (coworker: Coworker) => void;
  initialSubTab?: 'recommendations' | 'connections' | 'invitations';
}

export const SocialScreen: React.FC<SocialScreenProps> = ({
  onOpenCoworkerProfile,
  onOpenInvite,
  initialSubTab,
}) => {
  const {
    state,
    acceptInvitation,
    cancelInvitation,
    validateEncounterProximity,
  } = useApp();
  const { user, coworkers, invitations, connections } = state;

  const [activeTab, setActiveTab] = useState<'recommendations' | 'connections' | 'invitations'>(
    initialSubTab || 'recommendations'
  );
  const [showNewConnectionModal, setShowNewConnectionModal] = useState(false);
  const [validatingEncounterId, setValidatingEncounterId] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());

  // Atualizacao periodica de tempo para contagem regressiva de expiracao
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (initialSubTab) {
      setActiveTab(initialSubTab);
    }
  }, [initialSubTab]);

  // Colegas pontuados por afinidade de interesses
  const scoredCoworkers = coworkers.map(cw => {
    const commonTags = (cw.interests || []).filter(t => (user.interests || []).includes(t));
    return {
      ...cw,
      commonTags,
      affinityScore: commonTags.length,
    };
  }).sort((a, b) => b.affinityScore - a.affinityScore);

  const handleOpenInviteFlow = (cw: Coworker) => {
    if (onOpenInvite) {
      onOpenInvite(cw);
    }
  };

  // Convites por status
  const acceptedEncounters = invitations.filter(
    i => i.status === 'accepted' && (!i.expiresAt || i.expiresAt > now)
  );
  const pendingReceived = invitations.filter(
    i => i.status === 'pending' && i.receiverId === user.id
  );
  const pendingSent = invitations.filter(
    i => i.status === 'pending' && i.senderId === user.id
  );
  const completedEncounters = invitations.filter(i => i.status === 'completed');

  const pendingAttentionCount = pendingReceived.length + acceptedEncounters.length;

  const handleSimulateProximity = (invitationId: string) => {
    setValidatingEncounterId(invitationId);
    setTimeout(() => {
      audioService.playTargetAcquired();
      validateEncounterProximity(invitationId);
      setValidatingEncounterId(null);
    }, 1200);
  };

  const formatRemainingTime = (expiresAt?: number) => {
    if (!expiresAt) return '3h restantes';
    const diffMs = expiresAt - now;
    if (diffMs <= 0) return 'Expirado';
    const totalMinutes = Math.floor(diffMs / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (hours > 0) {
      return `${hours}h ${minutes}m restantes`;
    }
    return `${minutes}m restantes`;
  };

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
      {/* 1. Header Fixado do Modulo Social */}
      <div className="px-4 py-2.5 border-b border-calm-200 bg-calm-50/90 flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-sm font-semibold text-calm-900 flex items-center gap-1.5">
            <Users size={16} className="text-sage-700" />
            <span>Conexões Presenciais</span>
          </h2>
          <p className="text-[11px] text-calm-500">Afinidades, colegas e convites de integração</p>
        </div>
        <Badge variant="calm" size="sm">
          {connections.length} conexões
        </Badge>
      </div>

      {/* Conteudo Rolavel */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0 flex flex-col justify-start">
        {/* Sub-tabs: Recomendados vs Conexoes vs Convites (SSOT SegmentedControl) */}
        <SegmentedControl<'recommendations' | 'connections' | 'invitations'>
          value={activeTab}
          onChange={setActiveTab}
          options={[
            { value: 'recommendations', label: 'Recomendados' },
            { value: 'connections', label: 'Conexões', badge: `(${connections.length})` },
            {
              value: 'invitations',
              label: 'Convites',
              indicator: pendingAttentionCount > 0,
              indicatorTitle: `${pendingAttentionCount} convites/encontros ativos`,
            },
          ]}
        />

        {/* Content: 1. Recommendations */}
        {activeTab === 'recommendations' && (
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-calm-800 flex items-center gap-1">
                <Sparkles size={13} className="text-sand-600" />
                <span>Maior Afinidade por Interesses</span>
              </span>
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
                      <UserAvatar user={cw} size="sm" />
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
                      onClick={() => handleOpenInviteFlow(cw)}
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

        {/* Content: 2. Conexoes (Item 8) */}
        {activeTab === 'connections' && (
          <div className="flex flex-col gap-2.5">
            {/* Botao Nova Conexao no topo */}
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <span className="text-xs font-semibold text-calm-900 block">Vínculos Consolidados</span>
                <p className="text-[10px] text-calm-500">Colegas com encontros presenciais validados</p>
              </div>
              <Button
                size="sm"
                variant="primary"
                onClick={() => setShowNewConnectionModal(true)}
                className="text-xs gap-1 py-1 px-2.5 font-medium shadow-xs shrink-0 whitespace-nowrap"
              >
                <UserPlus size={13} className="shrink-0" />
                <span className="whitespace-nowrap">Nova conexão</span>
              </Button>
            </div>

            {/* Listagem de Conexoes */}
            {connections.length > 0 ? (
              <div className="flex flex-col gap-2">
                {connections.map(conn => {
                  const cw = coworkers.find(c => c.id === conn.coworkerId);
                  if (!cw) return null;
                  const levelInfo = calculateConnectionLevel(conn.sharedXp);

                  return (
                    <div
                      key={conn.id}
                      className="p-2.5 rounded-xl border border-calm-200 bg-white hover:border-calm-300 transition shadow-2xs flex flex-col gap-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div
                          onClick={() => onOpenCoworkerProfile(cw)}
                          className="flex items-center gap-2.5 min-w-0 cursor-pointer group"
                          title="Ver perfil completo"
                        >
                          <UserAvatar user={cw} size="sm" />
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-calm-900 truncate group-hover:text-calm-700 transition">{cw.name}</p>
                            <p className="text-[10px] text-calm-500 truncate">{cw.department}</p>
                          </div>
                        </div>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenInviteFlow(cw)}
                          className="text-[11px] px-2.5 py-1 gap-1 font-medium shrink-0"
                        >
                          <Send size={11} />
                          <span>Convidar</span>
                        </Button>
                      </div>

                      {/* Progresso de XP com Nível no cabecalho */}
                      <div className="space-y-1 bg-calm-50/70 p-2 rounded-lg border border-calm-100">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-calm-800 font-semibold">Nível {levelInfo.level}</span>
                          <span className="text-calm-500 font-mono">
                            {levelInfo.currentLevelXp} / {levelInfo.nextLevelXpRequired} XP
                          </span>
                        </div>
                        <ProgressBar
                          value={levelInfo.currentLevelXp}
                          max={levelInfo.nextLevelXpRequired}
                          height="sm"
                          color="sage"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-calm-200 bg-calm-50/60 text-center py-6">
                <HeartHandshake size={28} className="mx-auto text-calm-400 mb-2" />
                <p className="text-xs text-calm-700 font-semibold">Nenhuma conexão registrada ainda</p>
                <p className="text-[10px] text-calm-500 max-w-xs mx-auto mt-1 leading-relaxed">
                  Conexões são registradas quando você realiza um encontro presencial com um colega. Toque em "Nova conexão" acima para convidar alguém.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Content: 3. Convites (Itens 9a e 9b) */}
        {activeTab === 'invitations' && (
          <div className="flex flex-col gap-3">
            {/* Secao 1: Encontros Confirmados (Aguardando Aprox/NFC - Baixa friccao na sub-aba) */}
            {acceptedEncounters.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-calm-900 flex items-center gap-1.5">
                    <Radio size={13} className="text-sage-600 animate-pulse" />
                    <span>Encontros em Andamento</span>
                  </span>
                  <span className="text-[10px] font-semibold text-sage-700 bg-sage-50 px-2 py-0.5 rounded-full border border-sage-200">
                    {acceptedEncounters.length} ativo{acceptedEncounters.length > 1 ? 's' : ''}
                  </span>
                </div>

                <div className="space-y-2">
                  {acceptedEncounters.map(inv => {
                    const isSender = inv.senderId === user.id;
                    const partnerName = isSender ? inv.receiverName : inv.senderName;
                    const partnerId = isSender ? inv.receiverId : inv.senderId;
                    const isValidating = validatingEncounterId === inv.id;

                    return (
                      <div
                        key={inv.id}
                        className="p-3 rounded-xl border border-sage-300 bg-gradient-to-r from-sage-50/70 to-white shadow-soft flex flex-col gap-2.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <UserAvatar userId={partnerId} size="sm" />
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-calm-900 truncate">
                                Encontro com {partnerName}
                              </p>
                              <p className="text-[11px] text-calm-600 flex items-center gap-1">
                                {getInvitationIcon(inv.type)}
                                <span>{getInvitationLabel(inv.type)}</span>
                              </p>
                            </div>
                          </div>

                          {/* Badge de Expiração em até 3h */}
                          <div className="flex items-center gap-1 text-[10px] font-medium text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full shrink-0">
                            <Clock size={11} className="text-amber-600" />
                            <span>{formatRemainingTime(inv.expiresAt)}</span>
                          </div>
                        </div>

                        {/* Botao de Baixa Friccao: Validar Presenca NFC */}
                        <div className="pt-2 border-t border-sage-200/80 flex items-center justify-between gap-2">
                          <button
                            onClick={() => cancelInvitation(inv.id)}
                            className="text-[10px] text-calm-400 hover:text-calm-600 transition cursor-pointer"
                            title="Cancelar silenciosamente sem constrangimento"
                          >
                            Cancelar encontro
                          </button>

                          <Button
                            size="sm"
                            variant="primary"
                            disabled={isValidating}
                            onClick={() => handleSimulateProximity(inv.id)}
                            className="text-xs px-3 py-1 font-semibold gap-1.5 shadow-xs"
                          >
                            <Radio size={13} className={isValidating ? 'animate-spin' : ''} />
                            <span>{isValidating ? 'Lendo crachá...' : 'Validar Presença (NFC)'}</span>
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Secao 2: Convites Recebidos Pendentes (Item 9b - Convite inicial para o tester interagir) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-calm-900 flex items-center gap-1.5">
                  <Clock size={13} className="text-calm-600" />
                  <span>Convites Recebidos Pendentes</span>
                </span>
                {pendingReceived.length > 0 && (
                  <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                    {pendingReceived.length} novo{pendingReceived.length > 1 ? 's' : ''}
                  </span>
                )}
              </div>

              {pendingReceived.length > 0 ? (
                <div className="space-y-1.5">
                  {pendingReceived.map(inv => (
                    <div
                      key={inv.id}
                      className="p-2.5 rounded-xl border border-rose-200 bg-rose-50/40 flex items-center justify-between gap-2 shadow-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="relative">
                          <UserAvatar userId={inv.senderId} color={inv.senderAvatarColor} bodyId={inv.senderAvatarBody} faceId={inv.senderAvatarFace} size="sm" />
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

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => acceptInvitation(inv.id)}
                          className="px-2.5 py-1 rounded-md bg-sage-600 text-white text-[11px] font-medium hover:bg-sage-700 transition cursor-pointer shadow-2xs"
                        >
                          Aceitar
                        </button>
                        <button
                          onClick={() => cancelInvitation(inv.id)}
                          className="px-2 py-1 rounded-md bg-calm-100 text-calm-600 text-[11px] font-medium hover:bg-calm-200 transition cursor-pointer"
                          title="Recusar silenciosamente"
                        >
                          Recusar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 rounded-xl border border-calm-200 bg-calm-50/50 text-center py-3">
                  <p className="text-xs text-calm-600 font-medium">Nenhum convite recebido pendente</p>
                  <p className="text-[10px] text-calm-400 mt-0.5">
                    Quando colegas convidarem você para um café ou pausa, eles aparecerão aqui.
                  </p>
                </div>
              )}
            </div>

            {/* Secao 3: Convites Enviados Aguardando Resposta (Cancelamento Silencioso 9a) */}
            {pendingSent.length > 0 && (
              <div className="space-y-2 pt-1 border-t border-calm-200/60">
                <span className="text-xs font-semibold text-calm-800 flex items-center gap-1.5">
                  <Send size={12} className="text-calm-500" />
                  <span>Convites Enviados por Você</span>
                </span>

                <div className="space-y-1.5">
                  {pendingSent.map(inv => (
                    <div
                      key={inv.id}
                      className="p-2.5 rounded-xl border border-calm-200 bg-white flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-calm-900 truncate">
                            Para {inv.receiverName}
                          </p>
                          <p className="text-[10px] text-calm-500 flex items-center gap-1">
                            {getInvitationIcon(inv.type)}
                            <span>{getInvitationLabel(inv.type)}</span>
                            <span>• {formatNotificationTime(inv.timestamp)}</span>
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => cancelInvitation(inv.id)}
                        className="text-[10px] text-calm-500 hover:text-rose-600 px-2 py-1 rounded hover:bg-rose-50 transition cursor-pointer"
                        title="Cancelar convite silenciosamente"
                      >
                        Cancelar
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Secao 4: Historico de Encontros Validados */}
            <div className="space-y-2 pt-2 border-t border-calm-200/70">
              <span className="text-xs font-semibold text-calm-900 flex items-center gap-1.5">
                <History size={13} className="text-calm-600" />
                <span>Histórico de Encontros</span>
              </span>

              <div className="space-y-1.5">
                {completedEncounters.length > 0 ? (
                  completedEncounters.map(inv => {
                    const partnerName = inv.senderId === user.id ? inv.receiverName : inv.senderName;
                    const partnerId = inv.senderId === user.id ? inv.receiverId : inv.senderId;
                    return (
                      <div
                        key={inv.id}
                        className="p-2.5 rounded-xl border border-calm-200 bg-white flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <UserAvatar userId={partnerId} size="sm" />
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-calm-900 truncate">{partnerName}</p>
                            <p className="text-[10px] text-calm-500">
                              {getInvitationLabel(inv.type)} • Validado
                            </p>
                          </div>
                        </div>
                        <span className="flex items-center gap-1 text-[10px] text-sage-800 bg-sage-50 border border-sage-200 px-2 py-0.5 rounded-full shrink-0 font-medium">
                          <CheckCircle2 size={11} className="text-sage-700" />
                          <span>Concluído</span>
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-2.5 rounded-xl border border-calm-200 bg-white flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <UserAvatar userId="cw-2" size="sm" />
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-calm-900 truncate">Bruno Oliveira</p>
                        <p className="text-[10px] text-calm-500">Almoço Compartilhado • Ontem</p>
                      </div>
                    </div>
                    <span className="flex items-center gap-1 text-[10px] text-sage-800 bg-sage-50 border border-sage-200 px-2 py-0.5 rounded-full shrink-0 font-medium">
                      <CheckCircle2 size={11} className="text-sage-700" />
                      <span>Concluído</span>
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Nova Conexao (Busca Dinamica) */}
      {showNewConnectionModal && (
        <NewConnectionModal
          coworkers={coworkers}
          userInterests={user.interests || []}
          onClose={() => setShowNewConnectionModal(false)}
          onSelectCoworker={cw => {
            setShowNewConnectionModal(false);
            handleOpenInviteFlow(cw);
          }}
        />
      )}
    </div>
  );
};

export default SocialScreen;
