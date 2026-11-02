import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { Toggle } from '../../ui/Toggle';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { FacialDetectionModal } from './FacialDetectionModal';
import {
  ArrowLeft,
  Palmtree,
  Shield,
  ScanFace,
  Tag,
  Info,
} from 'lucide-react';

interface SettingsModalProps {
  onClose: () => void;
  onEditInterests?: () => void;
  onOpenFacialDetection?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  onClose,
  onEditInterests,
  onOpenFacialDetection,
}) => {
  const {
    state,
    toggleVacationMode,
    toggleFacialLock,
  } = useApp();
  const { user } = state;

  const [showLocalFacialModal, setShowLocalFacialModal] = useState(false);

  return (
    <div className="absolute inset-0 z-20 bg-white flex flex-col select-none overflow-hidden animate-fadeIn">
      {/* Top Header */}
      <div className="px-3 py-2 border-b border-calm-200 bg-calm-50/90 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="flex items-center gap-1 px-2 py-1 rounded-md text-calm-700 hover:text-calm-900 hover:bg-calm-200/70 transition cursor-pointer text-xs font-medium"
            title="Voltar"
          >
            <ArrowLeft size={14} />
            <span>Voltar</span>
          </button>
          <div className="h-4 w-px bg-calm-300" />
          <h2 className="text-xs font-semibold text-calm-900">Configurações & Privacidade</h2>
        </div>
        <Badge variant="calm" size="sm">Versão 1.0</Badge>
      </div>

      {/* Settings Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        <div className="bg-white rounded-xl border border-calm-200 p-3 shadow-soft flex flex-col gap-3">
          <h3 className="text-xs font-semibold text-calm-900">Preferências do Colaborador</h3>

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
                <p className="text-xs font-medium text-calm-900">Detecção e Biometria Facial</p>
                <p className="text-[10px] text-calm-500">
                  {user.facialDetectionCompleted ? 'Biometria validada' : 'Pendente (pulada anteriormente)'}
                </p>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                if (onOpenFacialDetection) {
                  onOpenFacialDetection();
                } else {
                  setShowLocalFacialModal(true);
                }
              }}
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
            {onEditInterests && (
              <Button
                size="sm"
                variant="outline"
                onClick={onEditInterests}
                className="text-[11px] px-2.5 py-1"
              >
                Editar
              </Button>
            )}
          </div>
        </div>

        {/* Nota de Privacidade Corporativa */}
        <div className="bg-sage-50/70 border border-sage-200/80 rounded-xl p-3 flex items-start gap-2.5">
          <Info size={15} className="text-sage-700 shrink-0 mt-0.5" />
          <p className="text-[11px] text-calm-600 leading-relaxed">
            Nenhum dado biométrico ou imagem de câmera sai do seu computador. Os registros são processados exclusivamente de forma local e com total sigilo.
          </p>
        </div>
      </div>

      {/* Local fallback modal if not hosted in expanded container */}
      {showLocalFacialModal && (
        <FacialDetectionModal
          onClose={() => setShowLocalFacialModal(false)}
        />
      )}
    </div>
  );
};

export default SettingsModal;
