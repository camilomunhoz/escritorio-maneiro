import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { useApp } from '../../../context/AppContext';
import { AvatarSvg } from '../../ui/AvatarSvg';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { ProgressBar } from '../../ui/ProgressBar';
import type { Coworker } from '../../../types';
import {
  ArrowLeft,
  Globe,
  CheckCircle2,
  Trophy,
  Activity,
  Smartphone,
  QrCode,
  MapPin,
  Check,
  Minimize2,
  ChevronRight,
} from 'lucide-react';

interface SharedGoalExpandedModalProps {
  onClose: () => void;
  onOpenProfile?: (coworker: Coworker | null, isOwn: boolean) => void;
}

interface AppInfo {
  id: string;
  name: string;
  category: string;
  description: string;
}

const SUPPORTED_APPS: AppInfo[] = [
  {
    id: 'strava',
    name: 'Strava',
    category: 'GPS & Atividades',
    description: 'Sincronização de corridas, pedaladas e caminhadas ao ar livre.',
  },
  {
    id: 'apple_health',
    name: 'Apple Saúde',
    category: 'iOS & Apple Watch',
    description: 'Passos diários e atividades físicas computados no ecossistema Apple.',
  },
  {
    id: 'google_fit',
    name: 'Google Fit / Health Connect',
    category: 'Android & Wearables',
    description: 'Contagem contínua de passos e exercícios em dispositivos Android.',
  },
  {
    id: 'garmin',
    name: 'Garmin Connect',
    category: 'Relógios Esportivos',
    description: 'Métricas de passos, distância percorrida e treinos de alta precisão.',
  },
];

export const SharedGoalExpandedModal: React.FC<SharedGoalExpandedModalProps> = ({
  onClose,
  onOpenProfile,
}) => {
  const { state, connectApp, disconnectApp } = useApp();
  const { sharedGoal, user, coworkers } = state;

  const connectedApps = sharedGoal.connectedApps || [];
  const [selectedAppForQr, setSelectedAppForQr] = useState<AppInfo | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  // Generate real QR Code encoding strictly the string "Conectado!"
  useEffect(() => {
    let isMounted = true;
    if (selectedAppForQr) {
      QRCode.toDataURL('Conectado!', {
        width: 180,
        margin: 2,
        color: {
          dark: '#1e293b',
          light: '#ffffff',
        },
      })
        .then(url => {
          if (isMounted) setQrCodeUrl(url);
        })
        .catch(err => console.error('Falha ao gerar QR Code:', err));
    }
    return () => {
      isMounted = false;
    };
  }, [selectedAppForQr]);

  const percentage = Math.min(100, (sharedGoal.currentKm / sharedGoal.targetKm) * 100);

  // Collaborator leaderboard data
  const leaderboardEntries = [
    {
      id: 'cw-2',
      name: 'Bruno Oliveira',
      department: 'Engenharia de Software',
      avatarColor: '#5A6B7C',
      km: 1420,
      steps: 182000,
      isUser: false,
    },
    {
      id: user.id,
      name: user.name,
      department: user.department,
      avatarColor: user.avatarColor,
      km: 1280 + Math.round(user.xp * 0.8) + (connectedApps.length * 35),
      steps: 164000 + Math.round(user.xp * 105) + (connectedApps.length * 45000),
      isUser: true,
    },
    {
      id: 'cw-1',
      name: 'Mariana Costa',
      department: 'Design de Produto',
      avatarColor: '#C87D6B',
      km: 1150,
      steps: 147500,
      isUser: false,
    },
    {
      id: 'cw-6',
      name: 'Gabriel Souza',
      department: 'Engenharia de Software',
      avatarColor: '#9E5B4B',
      km: 980,
      steps: 125800,
      isUser: false,
    },
    {
      id: 'cw-5',
      name: 'Beatriz Santos',
      department: 'Pessoas e Cultura',
      avatarColor: '#6B8E78',
      km: 910,
      steps: 116700,
      isUser: false,
    },
    {
      id: 'cw-8',
      name: 'Lucas Pereira',
      department: 'Qualidade e Testes',
      avatarColor: '#78909C',
      km: 840,
      steps: 107800,
      isUser: false,
    },
    {
      id: 'cw-4',
      name: 'Camila Lima',
      department: 'Marketing',
      avatarColor: '#8E735B',
      km: 760,
      steps: 97400,
      isUser: false,
    },
    {
      id: 'cw-7',
      name: 'Thiago Rocha',
      department: 'Infraestrutura',
      avatarColor: '#556B2F',
      km: 690,
      steps: 88500,
      isUser: false,
    },
  ].sort((a, b) => b.km - a.km);

  const handleLeaderboardClick = (collab: typeof leaderboardEntries[0]) => {
    if (collab.isUser) {
      onOpenProfile?.(null, true);
    } else {
      const found = coworkers.find(c => c.id === collab.id) || {
        id: collab.id,
        name: collab.name,
        department: collab.department,
        avatarColor: collab.avatarColor,
        level: 3,
        xp: Math.round(collab.km * 0.9),
        streak: 5,
        interests: ['Caminhada', 'Saúde Corporativa'],
        isFriend: false,
        friendRequestStatus: 'none',
        selectedMedalIds: [],
      };
      onOpenProfile?.(found, false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-white select-none relative overflow-hidden animate-fadeIn">
      {/* 1. Header Superior Expandido */}
      <div className="px-4 py-2 border-b border-calm-200 flex items-center justify-between bg-calm-50/90 shrink-0">
        <div className="flex items-center gap-2.5">
          <button
            onClick={onClose}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-calm-700 hover:text-calm-900 hover:bg-calm-200/70 transition cursor-pointer text-xs font-medium"
            title="Retornar ao Drawer Normal (350px)"
          >
            <ArrowLeft size={14} />
            <span>Voltar</span>
          </button>
          <div className="h-4 w-px bg-calm-300" />
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-sand-200/80 text-sand-800 flex items-center justify-center">
              <Globe size={14} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-calm-900 leading-tight">
                {sharedGoal.title}
              </h3>
              <p className="text-[10px] text-calm-500 leading-tight">
                Desafio colaborativo da empresa (30 dias)
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="sand" size="sm">{sharedGoal.deadlineDays} dias restantes</Badge>
          <Badge variant="sage" size="sm">{sharedGoal.targetKm.toLocaleString('pt-BR')} km alvo</Badge>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-calm-500 hover:text-calm-900 hover:bg-calm-200/70 transition cursor-pointer"
            title="Retornar ao Drawer Normal (350px)"
          >
            <Minimize2 size={14} />
          </button>
        </div>
      </div>

      {/* 2. Corpo em Duas Colunas (Tamanho Expandido 750px) */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Coluna Esquerda: Progresso Global & Conexão de Aplicativos (360px) */}
        <section className="w-[360px] border-r border-calm-200/90 p-3.5 overflow-y-auto space-y-3 bg-gradient-to-b from-sand-50/40 via-white to-white shrink-0 flex flex-col justify-between">
          <div className="space-y-3">
            {/* Card de Progresso Global */}
            <div className="bg-white p-3 rounded-xl border border-sand-200 shadow-soft space-y-2.5">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-semibold text-sand-800 uppercase tracking-wider block">
                    Progresso Coletivo
                  </span>
                  <h4 className="text-sm font-bold text-calm-900">
                    {sharedGoal.currentKm.toLocaleString('pt-BR')} km
                  </h4>
                  <p className="text-[10px] text-calm-500">
                    de {sharedGoal.targetKm.toLocaleString('pt-BR')} km da circunferência da Terra
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-base font-bold text-sand-800">{percentage.toFixed(1)}%</span>
                  <p className="text-[9px] text-calm-400">Completado</p>
                </div>
              </div>

              <ProgressBar
                value={sharedGoal.currentKm}
                max={sharedGoal.targetKm}
                color="sand"
                height="md"
              />

              {/* Marcos e Estatísticas */}
              <div className="grid grid-cols-3 gap-1.5 pt-1 border-t border-sand-100 text-center">
                <div className="bg-sand-50/60 p-1.5 rounded-lg border border-sand-200/60">
                  <span className="block text-[9px] text-calm-500">Etapa</span>
                  <span className="text-[11px] font-semibold text-calm-800 flex items-center justify-center gap-0.5 mt-0.5 truncate">
                    <MapPin size={10} className="text-sand-600 shrink-0" />
                    Índico
                  </span>
                </div>
                <div className="bg-sand-50/60 p-1.5 rounded-lg border border-sand-200/60">
                  <span className="block text-[9px] text-calm-500">Média</span>
                  <span className="text-[11px] font-semibold text-calm-800 mt-0.5 block">
                    1.060 km/d
                  </span>
                </div>
                <div className="bg-sand-50/60 p-1.5 rounded-lg border border-sand-200/60">
                  <span className="block text-[9px] text-calm-500">Apps</span>
                  <span className="text-[11px] font-semibold text-sage-700 mt-0.5 block">
                    {connectedApps.length} ativos
                  </span>
                </div>
              </div>
            </div>

            {/* Painel de Aplicativos OU Painel QR Code Ativo */}
            {selectedAppForQr ? (
              <div className="bg-white p-3 rounded-xl border-2 border-sand-300 shadow-soft flex flex-col items-center text-center gap-2 animate-fadeIn">
                <div className="flex items-center justify-between w-full pb-1 border-b border-sand-100">
                  <span className="text-[11px] font-semibold text-sand-800">
                    Conectar {selectedAppForQr.name}
                  </span>
                  <button
                    onClick={() => setSelectedAppForQr(null)}
                    className="text-[10px] text-calm-400 hover:text-calm-700 cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>

                <p className="text-[10px] text-calm-500 leading-tight">
                  Aponte a câmera do seu smartphone para sincronizar seus passos:
                </p>

                <div className="p-2 bg-white border border-sand-200 rounded-xl shadow-inner">
                  {qrCodeUrl ? (
                    <img
                      src={qrCodeUrl}
                      alt="QR Code"
                      className="w-32 h-32 rounded-lg object-contain"
                    />
                  ) : (
                    <div className="w-32 h-32 bg-calm-100 rounded-lg flex items-center justify-center text-xs text-calm-400">
                      Gerando...
                    </div>
                  )}
                </div>

                <span className="text-[9px] font-mono text-calm-400">
                  Codifica: "Conectado!"
                </span>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    connectApp(selectedAppForQr.id);
                    setSelectedAppForQr(null);
                  }}
                  className="w-full text-xs flex items-center justify-center gap-1.5 mt-1 cursor-pointer"
                >
                  <Check size={13} />
                  <span>Já me conectei</span>
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-calm-900">
                    <Smartphone size={13} className="text-calm-600" />
                    <span>Conexão de Aplicativos</span>
                  </div>
                  <span className="text-[10px] text-calm-500">Passos automáticos</span>
                </div>

                <div className="space-y-1.5">
                  {SUPPORTED_APPS.map(app => {
                    const isConnected = connectedApps.includes(app.id);

                    return (
                      <div
                        key={app.id}
                        className={`p-2 rounded-lg border transition-all flex items-center justify-between gap-2 ${
                          isConnected
                            ? 'bg-sage-50/70 border-sage-300'
                            : 'bg-white hover:bg-calm-50/80 border-calm-200 shadow-soft'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-6 h-6 rounded-md bg-calm-100 border border-calm-200 flex items-center justify-center shrink-0">
                            <Activity size={12} className="text-calm-700" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[11px] font-semibold text-calm-900 truncate">
                              {app.name}
                            </p>
                            <p className="text-[9px] text-calm-400 truncate leading-tight">
                              {app.category}
                            </p>
                          </div>
                        </div>

                        <div className="shrink-0 flex items-center gap-1">
                          {isConnected ? (
                            <div className="flex items-center gap-1">
                              <span className="flex items-center gap-0.5 text-[10px] font-semibold text-sage-700 bg-sage-100 px-1.5 py-0.5 rounded border border-sage-200">
                                <CheckCircle2 size={11} className="text-sage-600" />
                                <span>Ativo</span>
                              </span>
                              <button
                                onClick={() => disconnectApp(app.id)}
                                className="text-[9px] text-calm-400 hover:text-red-600 p-0.5 rounded transition cursor-pointer"
                                title="Desconectar"
                              >
                                Desconectar
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setSelectedAppForQr(app)}
                              className="text-[10px] font-medium text-sage-700 hover:text-sage-900 bg-sage-50 hover:bg-sage-100 px-2 py-0.5 rounded border border-sage-200 flex items-center gap-1 transition cursor-pointer"
                            >
                              <QrCode size={11} />
                              <span>Conectar</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <p className="text-[9px] text-calm-400 italic text-center pt-2 border-t border-calm-200/60">
            Passos são agregados sem compartilhamento de rotas ou dados privados.
          </p>
        </section>

        {/* Coluna Direita: Leaderboard de Colaboradores (390px) */}
        <section className="flex-1 p-3.5 flex flex-col min-h-0 bg-white space-y-2">
          <div className="flex items-center justify-between pb-1 border-b border-calm-200/70 shrink-0">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-calm-900">
                <Trophy size={14} className="text-amber-600" />
                <span>Ranking de Colaboradores</span>
              </div>
              <p className="text-[10px] text-calm-500">
                Clique em qualquer card para visualizar o perfil completo
              </p>
            </div>
            <span className="text-[10px] font-medium text-sand-800 bg-sand-100 px-2 py-0.5 rounded-full">
              {leaderboardEntries.length} participantes
            </span>
          </div>

          {/* Lista com Rolagem dos Colaboradores */}
          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 min-h-0">
            {leaderboardEntries.map((collab, index) => {
              const position = index + 1;
              const isPodium = position <= 3;
              const podiumColors = [
                'bg-yellow-100 text-yellow-800 border-yellow-300', // 1º Ouro
                'bg-slate-100 text-slate-700 border-slate-300',    // 2º Prata
                'bg-amber-100 text-amber-800 border-amber-300',    // 3º Bronze
              ];

              return (
                <div
                  key={collab.id}
                  onClick={() => handleLeaderboardClick(collab)}
                  className={`p-2 rounded-xl border flex items-center justify-between gap-2.5 transition cursor-pointer group ${
                    collab.isUser
                      ? 'bg-sage-50/90 hover:bg-sage-100/90 border-sage-300 shadow-soft'
                      : 'bg-white hover:bg-calm-50 border-calm-200/90 hover:border-calm-300'
                  }`}
                  title={`Clique para ver o perfil de ${collab.isUser ? 'você' : collab.name}`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <span
                      className={`w-5 h-5 rounded-md text-[10px] font-bold flex items-center justify-center shrink-0 ${
                        isPodium
                          ? podiumColors[index]
                          : 'bg-calm-100 text-calm-600 border border-calm-200'
                      }`}
                    >
                      {position}
                    </span>

                    <AvatarSvg color={collab.avatarColor} size="sm" />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-medium text-calm-900 truncate group-hover:text-sage-800 transition">
                          {collab.name}
                        </span>
                        {collab.isUser && (
                          <span className="text-[9px] font-semibold text-sage-800 bg-sage-200/90 px-1.5 py-0.2 rounded shrink-0">
                            Você
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-calm-400 truncate leading-tight">
                        {collab.department}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-right">
                      <span className="text-xs font-semibold text-calm-800 block font-mono">
                        {collab.km.toLocaleString('pt-BR')} km
                      </span>
                      <span className="text-[9px] text-calm-400 block leading-tight font-mono">
                        {collab.steps.toLocaleString('pt-BR')} passos
                      </span>
                    </div>
                    <ChevronRight size={13} className="text-calm-300 group-hover:text-calm-600 transition" />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};

export default SharedGoalExpandedModal;
