import React, { useState } from 'react';
import type { Coworker } from '../../../types';
import { AvatarSvg } from '../../ui/AvatarSvg';
import { Button } from '../../ui/Button';
import { Coffee, Utensils, Sun, MessageSquare, ArrowLeft, CheckCircle2, Radio } from 'lucide-react';

interface InvitationModalProps {
  coworker: Coworker;
  userAvatarColor: string;
  userName: string;
  onClose: () => void;
  onSend: (type: 'cafe' | 'almoco' | 'sol' | 'conversa') => void;
}

export const InvitationModal: React.FC<InvitationModalProps> = ({
  coworker,
  userAvatarColor,
  userName,
  onClose,
  onSend,
}) => {
  const [selectedType, setSelectedType] = useState<'cafe' | 'almoco' | 'sol' | 'conversa'>('cafe');
  const [isSimulatingProximity, setIsSimulatingProximity] = useState(false);
  const [proximityValidated, setProximityValidated] = useState(false);

  const activities = [
    { id: 'cafe', title: 'Pausa para Café', desc: '10 min de descompressão na copa', icon: Coffee },
    { id: 'almoco', title: 'Almoço em Conjunto', desc: 'Integração presencial no refeitório', icon: Utensils },
    { id: 'sol', title: 'Caminhada ao Sol', desc: '15 min de luz natural e respiração', icon: Sun },
    { id: 'conversa', title: 'Bate-papo Rápido', desc: 'Troca de ideias entre setores', icon: MessageSquare },
  ] as const;

  const handleProximityScan = () => {
    setIsSimulatingProximity(true);
    setTimeout(() => {
      setIsSimulatingProximity(false);
      setProximityValidated(true);
    }, 1500);
  };

  const handleConfirmSend = () => {
    onSend(selectedType);
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
          <h3 className="text-xs font-semibold text-calm-900">Convite de Encontro Presencial</h3>
        </div>
      </div>

      {/* Scrollable Content Body */}
      <div className="flex-1 overflow-y-auto flex flex-col">

        {/* Dual-Avatar Vector Illustration of Shared Activity */}
        <div className="bg-gradient-to-b from-calm-100 to-calm-50 p-4 border-b border-calm-200 flex flex-col items-center justify-center">
          <div className="flex items-center gap-4 relative">
            {/* User Avatar */}
            <div className="flex flex-col items-center">
              <AvatarSvg color={userAvatarColor} size="md" projected />
              <span className="text-[10px] font-semibold text-calm-800 mt-1">{userName.split(' ')[0]}</span>
            </div>

            {/* Connecting Activity Graphic in Center */}
            <div className="w-12 h-12 rounded-full bg-white shadow-soft border border-calm-200 flex items-center justify-center text-sage-700">
              {selectedType === 'cafe' && <Coffee size={22} />}
              {selectedType === 'almoco' && <Utensils size={22} />}
              {selectedType === 'sol' && <Sun size={22} />}
              {selectedType === 'conversa' && <MessageSquare size={22} />}
            </div>

            {/* Coworker Avatar */}
            <div className="flex flex-col items-center">
              <AvatarSvg color={coworker.avatarColor} size="md" projected />
              <span className="text-[10px] font-semibold text-calm-800 mt-1">{coworker.name.split(' ')[0]}</span>
            </div>
          </div>

          <p className="text-[11px] text-calm-600 mt-2 text-center font-medium">
            Convite para {coworker.name} ({coworker.department})
          </p>
        </div>

        {/* Activity Selection */}
        <div className="p-3.5 flex flex-col gap-2">
          <span className="text-[11px] font-semibold text-calm-700">Escolha a atividade:</span>
          <div className="grid grid-cols-2 gap-2">
            {activities.map(act => {
              const Icon = act.icon;
              const isSelected = selectedType === act.id;
              return (
                <button
                  key={act.id}
                  onClick={() => setSelectedType(act.id)}
                  className={`p-2 rounded-xl border text-left transition flex flex-col gap-1 cursor-pointer ${
                    isSelected
                      ? 'bg-sage-50/90 border-sage-500 ring-1 ring-sage-500'
                      : 'bg-white hover:bg-calm-50 border-calm-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Icon size={16} className={isSelected ? 'text-sage-700' : 'text-calm-500'} />
                    {isSelected && <CheckCircle2 size={13} className="text-sage-600" />}
                  </div>
                  <div>
                    <p className={`text-xs font-semibold leading-tight ${isSelected ? 'text-sage-900' : 'text-calm-800'}`}>
                      {act.title}
                    </p>
                    <p className="text-[9px] text-calm-500 leading-tight mt-0.5">{act.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Proximity badge boilerplate simulation */}
          <div className="mt-2 p-2.5 rounded-lg border border-calm-200 bg-calm-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Radio size={16} className={proximityValidated ? 'text-sage-600' : 'text-calm-400'} />
              <div>
                <p className="text-[11px] font-medium text-calm-800">Validação por Crachá (NFC)</p>
                <p className="text-[9px] text-calm-500">
                  {proximityValidated ? 'Presença confirmada no mesmo piso' : 'Simule o toque de crachás no encontro'}
                </p>
              </div>
            </div>

            <Button
              size="sm"
              variant={proximityValidated ? 'subtle' : 'outline'}
              disabled={isSimulatingProximity || proximityValidated}
              onClick={handleProximityScan}
              className="text-[10px] px-2 py-1"
            >
              {isSimulatingProximity ? 'Lendo...' : proximityValidated ? 'Validado' : 'Aproximar'}
            </Button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-3 bg-calm-50 border-t border-calm-200 flex items-center justify-end gap-2 shrink-0">
          <Button variant="subtle" size="sm" onClick={onClose} className="text-xs">
            Cancelar
          </Button>
          <Button variant="primary" size="sm" onClick={handleConfirmSend} className="text-xs">
            Confirmar e Enviar Convite
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InvitationModal;
