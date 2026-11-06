import React, { useState } from 'react';
import type { Coworker } from '../../../types';
import { Modal } from '../../ui/Modal';
import { UserAvatar } from '../../ui/UserAvatar';
import { Button } from '../../ui/Button';
import { Coffee, Utensils, Sun, MessageSquare, Send, CheckCircle2 } from 'lucide-react';

interface InvitationModalProps {
  coworker: Coworker;
  userAvatarColor: string;
  userAvatarBody?: string;
  userAvatarFace?: string;
  userName: string;
  onClose: () => void;
  onSend: (type: 'cafe' | 'almoco' | 'sol' | 'conversa') => void;
  zIndex?: number;
}

export const InvitationModal: React.FC<InvitationModalProps> = ({
  coworker,
  userAvatarColor,
  userAvatarBody,
  userAvatarFace,
  userName,
  onClose,
  onSend,
  zIndex,
}) => {
  const [selectedType, setSelectedType] = useState<'cafe' | 'almoco' | 'sol' | 'conversa'>('cafe');

  const activities = [
    {
      id: 'cafe',
      title: 'Pausa para Café',
      desc: 'Descompressão na copa com bate-papo informal',
      icon: Coffee,
    },
    {
      id: 'almoco',
      title: 'Almoço em Conjunto',
      desc: 'Integração presencial no refeitório da empresa',
      icon: Utensils,
    },
    {
      id: 'sol',
      title: 'Caminhada ao Sol',
      desc: 'Luz natural, passos e respiração ao ar livre',
      icon: Sun,
    },
    {
      id: 'conversa',
      title: 'Bate-papo Rápido',
      desc: 'Troca de ideias entre setores nos corredores ou lounge',
      icon: MessageSquare,
    },
  ] as const;

  const activeActivity = activities.find(a => a.id === selectedType) || activities[0];
  const ActiveIcon = activeActivity.icon;

  const handleConfirmSend = () => {
    onSend(selectedType);
  };

  return (
    <Modal
      title="Convite de Encontro Presencial"
      onClose={onClose}
      zIndex={zIndex}
      contentClassName="flex-1 flex overflow-hidden bg-white"
      headerRight={
        <Button
          variant="primary"
          size="sm"
          onClick={handleConfirmSend}
          className="text-xs font-semibold gap-1.5 px-3 py-1 shadow-xs"
        >
          <Send size={12} />
          <span>Enviar Convite</span>
        </Button>
      }
    >
      {/* Coluna Esquerda: Selecao de Atividade com Rolagem Vertical (~280px) */}
      <aside className="w-72 border-r border-calm-200/80 bg-calm-50/70 p-4 flex flex-col justify-between shrink-0 overflow-y-auto min-h-0">
        <div className="flex flex-col gap-3">
          <div>
            <span className="text-xs font-semibold text-calm-900 block">Tipo de Encontro</span>
            <span className="text-[11px] text-calm-500">Selecione o formato da sua pausa:</span>
          </div>

          <div className="flex flex-col gap-2">
            {activities.map(act => {
              const Icon = act.icon;
              const isSelected = selectedType === act.id;
              return (
                <button
                  key={act.id}
                  onClick={() => setSelectedType(act.id)}
                  className={`p-2.5 rounded-xl border text-left transition flex items-start gap-2.5 cursor-pointer ${isSelected
                    ? 'bg-sage-50 border-sage-500 ring-1 ring-sage-500 shadow-xs'
                    : 'bg-white hover:bg-calm-50 border-calm-200/90'
                    }`}
                >
                  <div
                    className={`p-2 rounded-lg shrink-0 ${isSelected ? 'bg-sage-600 text-white' : 'bg-calm-100 text-calm-600'
                      }`}
                  >
                    <Icon size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-semibold leading-tight ${isSelected ? 'text-sage-900' : 'text-calm-800'
                          }`}
                      >
                        {act.title}
                      </span>
                      {isSelected && <CheckCircle2 size={13} className="text-sage-600 shrink-0" />}
                    </div>
                    <span className="text-[10px] text-calm-500 line-clamp-2 mt-0.5 leading-snug">
                      {act.desc}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Rodape sutil da coluna esquerda */}
        <div className="pt-3 mt-3 border-t border-calm-200/70 flex items-center justify-between">
          <Button
            variant="subtle"
            size="sm"
            onClick={onClose}
            className="w-full text-xs justify-center py-1 text-calm-600 hover:text-calm-800"
          >
            Cancelar
          </Button>
        </div>
      </aside>

      {/* Coluna Direita: Ilustracao da Conexao Expandida */}
      <section className="flex-1 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-calm-50/30 via-white to-calm-50/50 relative overflow-hidden">
        {/* Background Decorative Rings */}
        <div className="absolute w-96 h-96 rounded-full bg-sage-50/40 -z-0 pointer-events-none blur-2xl" />

        <div className="relative z-10 flex flex-col items-center max-w-md text-center">
          {/* Dual Avatar Graphic */}
          <div className="flex items-center justify-center gap-6 sm:gap-8 my-2">
            {/* User Profile */}
            <div className="flex flex-col items-center">
              <div className="p-2">
                <UserAvatar color={userAvatarColor} bodyId={userAvatarBody} faceId={userAvatarFace} size="xxl" projected followMouse />
              </div>
              <span className="text-xs font-semibold text-calm-900 mt-2">
                {userName.split(' ')[0]}
              </span>
              <span className="text-[10px] text-calm-400">Você</span>
            </div>

            {/* Connecting Visual Center */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-0.5 border-t-2 border-dashed border-sage-300 relative my-2">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white shadow-card border border-sage-200 flex items-center justify-center text-sage-700">
                  <ActiveIcon size={24} />
                </div>
              </div>
            </div>

            {/* Coworker Profile (Sem cargo para priorizar conexão pessoal) */}
            <div className="flex flex-col items-center">
              <div className="p-2">
                <UserAvatar
                  color={coworker.avatarColor}
                  bodyId={coworker.avatarBody}
                  faceId={coworker.avatarFace}
                  size="xxl"
                  projected
                  followMouse
                />
              </div>
              <span className="text-xs font-semibold text-calm-900 mt-2">
                {coworker.name}
              </span>
              <span className="text-[10px] text-calm-400">Convidado</span>
            </div>
          </div>

          {/* Friendly Context Explanation (Mantendo tempo de expiração em 3 horas) */}
          <div className="mt-8 bg-white/80 backdrop-blur-xs border border-calm-200 rounded-xl p-3.5 shadow-2xs max-w-sm">
            <p className="text-xs text-calm-700 font-medium leading-relaxed">
              Ao enviar, um convite será gerado para <span className="font-semibold text-calm-900">{coworker.name}</span>.
            </p>
            <p className="text-[11px] text-calm-500 mt-1 leading-relaxed">
              Após o aceite, vocês terão até 3 horas para se encontrar e aproximar os crachás para validar a presença.
            </p>
          </div>
        </div>
      </section>
    </Modal>
  );
};

export default InvitationModal;
