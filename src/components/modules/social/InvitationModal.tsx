import React, { useState } from 'react';
import type { Coworker } from '../../../types';
import { Modal } from '../../ui/Modal';
import { AvatarSvg } from '../../ui/AvatarSvg';
import { Button } from '../../ui/Button';
import { Coffee, Utensils, Sun, MessageSquare, Radio } from 'lucide-react';

interface InvitationModalProps {
  coworker: Coworker;
  userAvatarColor: string;
  userName: string;
  onClose: () => void;
  onSend: (type: 'cafe' | 'almoco' | 'sol' | 'conversa') => void;
  zIndex?: number;
}

export const InvitationModal: React.FC<InvitationModalProps> = ({
  coworker,
  userAvatarColor,
  userName,
  onClose,
  onSend,
  zIndex,
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
    <Modal
      title="Convite de Encontro Presencial"
      onClose={onClose}
      zIndex={zIndex}
      contentClassName="flex-1 overflow-y-auto flex flex-col min-h-0"
    >
      {/* Dual-Avatar Vector Illustration of Shared Activity */}
      <div className="bg-gradient-to-b from-calm-100 to-calm-50 p-4 border-b border-calm-200 flex flex-col items-center justify-center shrink-0">
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

        <p className="text-xs font-medium text-calm-700 mt-3 text-center">
          Convidando <span className="font-semibold text-calm-900">{coworker.name}</span> para uma pausa ativa
        </p>
      </div>

      {/* Select Activity Options */}
      <div className="p-3.5 space-y-2 flex-1">
        <label className="text-xs font-semibold text-calm-900 block mb-1.5">
          Escolha a dinâmica do encontro:
        </label>

        <div className="grid grid-cols-1 gap-2">
          {activities.map(act => {
            const Icon = act.icon;
            const isSelected = selectedType === act.id;

            return (
              <div
                key={act.id}
                onClick={() => setSelectedType(act.id)}
                className={`p-2.5 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                  isSelected
                    ? 'border-sage-500 bg-sage-50/70 shadow-sm'
                    : 'border-calm-200 bg-white hover:bg-calm-50/60'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                    isSelected ? 'bg-sage-600 text-white' : 'bg-calm-100 text-calm-600'
                  }`}
                >
                  <Icon size={18} />
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-semibold text-calm-900 leading-tight">
                    {act.title}
                  </h4>
                  <p className="text-[11px] text-calm-500 mt-0.5 leading-tight">
                    {act.desc}
                  </p>
                </div>

                <div className="shrink-0">
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      isSelected ? 'border-sage-600 bg-sage-600' : 'border-calm-300'
                    }`}
                  >
                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Proximity Bluetooth Simulation Card */}
        <div className="mt-3 p-3 rounded-xl bg-calm-50 border border-calm-200/90 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio size={16} className={proximityValidated ? 'text-emerald-600' : 'text-calm-500'} />
            <div>
              <p className="text-xs font-medium text-calm-900">Validação de Proximidade Física</p>
              <p className="text-[10px] text-calm-500">
                {proximityValidated
                  ? 'Colega detectado na mesma área do escritório'
                  : 'Gera bônus de XP mútuo ao confirmarem presencialmente'}
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
    </Modal>
  );
};

export default InvitationModal;
