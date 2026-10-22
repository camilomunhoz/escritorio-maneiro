import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { Toggle } from '../../ui/Toggle';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { MedalsShowcaseModal } from './MedalsShowcaseModal';
import { AvatarCustomizerModal } from './AvatarCustomizerModal';
import { PostureCalibrationModal } from '../health/PostureCalibrationModal';
import {
  Bell,
  Award,
  Palette,
  Shield,
  ScanFace,
  Palmtree,
  CheckCheck,
  ChevronRight,
  Info,
  Tag,
} from 'lucide-react';

export const MenuScreen: React.FC = () => {
  const {
    state,
    toggleVacationMode,
    toggleFacialLock,
    markNotificationsRead,
    setCurrentTab,
    calibrateHealth,
  } = useApp();
  const { user, notifications } = state;

  const [showMedalsModal, setShowMedalsModal] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showFacialRecalibration, setShowFacialRecalibration] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="w-full h-full flex flex-col justify-between overflow-y-auto px-4 py-3 space-y-4 select-none">
      {/* 1. Header do Menu */}
      <div className="flex items-center justify-between pb-2 border-b border-calm-200/80">
        <div>
          <h2 className="text-sm font-semibold text-calm-900">Menu & Configurações</h2>
          <p className="text-[11px] text-calm-500">Notificações, preferências e conquistas</p>
        </div>
        <Badge variant="calm" size="sm">Versão 1.0</Badge>
      </div>

      {/* 2. Central de Notificações */}
      <div className="bg-white rounded-xl border border-calm-200 p-3 shadow-soft flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-calm-900">
            <Bell size={14} className="text-calm-600" />
            <span>Notificações Recentes</span>
            {unreadCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-terracottaMuted-500" />
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markNotificationsRead}
              className="text-[10px] text-sage-700 hover:text-sage-900 font-medium flex items-center gap-1 cursor-pointer"
            >
              <CheckCheck size={11} />
              <span>Marcar lidas</span>
            </button>
          )}
        </div>

        <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
          {notifications.slice(0, 3).map(notif => (
            <div
              key={notif.id}
              className={`p-2 rounded-lg border text-left transition ${
                notif.read ? 'bg-calm-50/60 border-calm-200/70 text-calm-600' : 'bg-sage-50/80 border-sage-200 text-calm-900 font-medium'
              }`}
            >
              <p className="text-xs leading-tight">{notif.title}</p>
              <p className="text-[10px] text-calm-500 mt-0.5 leading-tight">{notif.message}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Atalhos Rápidos */}
      <div className="space-y-2">
        <button
          onClick={() => setShowMedalsModal(true)}
          className="w-full p-2.5 rounded-xl border border-calm-200 bg-white hover:bg-calm-50 shadow-soft flex items-center justify-between transition cursor-pointer text-left"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sand-100 text-sand-800 flex items-center justify-center">
              <Award size={18} />
            </div>
            <div>
              <p className="text-xs font-semibold text-calm-900">Quadro Completo de Medalhas</p>
              <p className="text-[10px] text-calm-500">Visualizar conquistas por raridade</p>
            </div>
          </div>
          <ChevronRight size={14} className="text-calm-400" />
        </button>

        <button
          onClick={() => setShowAvatarModal(true)}
          className="w-full p-2.5 rounded-xl border border-calm-200 bg-white hover:bg-calm-50 shadow-soft flex items-center justify-between transition cursor-pointer text-left"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-calm-100 text-calm-700 flex items-center justify-center">
              <Palette size={18} />
            </div>
            <div>
              <p className="text-xs font-semibold text-calm-900">Personalizar Avatar</p>
              <p className="text-[10px] text-calm-500">Alterar cor da sua identidade visual</p>
            </div>
          </div>
          <ChevronRight size={14} className="text-calm-400" />
        </button>
      </div>

      {/* 4. Painel de Configurações do Colaborador */}
      <div className="bg-white rounded-xl border border-calm-200 p-3 shadow-soft flex flex-col gap-3">
        <h3 className="text-xs font-semibold text-calm-900">Configurações & Privacidade</h3>

        {/* Modo Férias */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <Palmtree size={16} className="text-calm-500" />
            <div>
              <p className="text-xs font-medium text-calm-900">Modo Férias / Afastamento</p>
              <p className="text-[10px] text-calm-500">Congela a contagem da streak diária</p>
            </div>
          </div>
          <Toggle checked={user.vacationMode} onChange={toggleVacationMode} />
        </div>

        {/* Bloqueio Facial Simulado */}
        <div className="flex items-center justify-between pt-2 border-t border-calm-100">
          <div className="flex items-center gap-2">
            <Shield size={16} className="text-calm-500" />
            <div>
              <p className="text-xs font-medium text-calm-900">Bloqueio por Biometria Facial</p>
              <p className="text-[10px] text-calm-500">Exige detecção facial ao reabrir o drawer</p>
            </div>
          </div>
          <Toggle checked={user.facialLockEnabled} onChange={toggleFacialLock} />
        </div>

        {/* Refazer Detecção Facial */}
        <div className="pt-2 border-t border-calm-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ScanFace size={16} className="text-calm-500" />
            <div>
              <p className="text-xs font-medium text-calm-900">Detecção Facial & Postura</p>
              <p className="text-[10px] text-calm-500">
                {user.facialDetectionCompleted ? 'Biometria calibrada' : 'Pendente (pulada anteriormente)'}
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowFacialRecalibration(true)}
            className="text-[11px] px-2.5 py-1"
          >
            Refazer
          </Button>
        </div>

        {/* Gerenciar Interesses Sociais */}
        <div className="pt-2 border-t border-calm-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tag size={16} className="text-calm-500" />
            <div>
              <p className="text-xs font-medium text-calm-900">Tags de Interesse</p>
              <p className="text-[10px] text-calm-500">{(user.interests || []).length} selecionadas</p>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setCurrentTab('social')}
            className="text-[11px] px-2.5 py-1"
          >
            Editar
          </Button>
        </div>
      </div>

      {/* Nota de Privacidade Corporativa */}
      <div className="bg-sage-50/70 border border-sage-200/80 rounded-xl p-2.5 flex items-start gap-2">
        <Info size={14} className="text-sage-700 shrink-0 mt-0.5" />
        <p className="text-[10px] text-calm-600 leading-tight">
          Nenhum dado biométrico ou imagem de câmera sai do seu computador. Os registros são processados exclusivamente de forma local.
        </p>
      </div>

      {/* Modals */}
      {showMedalsModal && <MedalsShowcaseModal onClose={() => setShowMedalsModal(false)} />}
      {showAvatarModal && <AvatarCustomizerModal onClose={() => setShowAvatarModal(false)} />}
      {showFacialRecalibration && (
        <PostureCalibrationModal
          onClose={() => setShowFacialRecalibration(false)}
          onCalibrate={score => {
            calibrateHealth(score);
            setShowFacialRecalibration(false);
          }}
        />
      )}
    </div>
  );
};

export default MenuScreen;
