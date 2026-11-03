import React from 'react';
import { useApp } from '../../../context/AppContext';
import { Modal } from '../../ui/Modal';
import { Palette } from 'lucide-react';
import { AvatarCustomizerContent } from '../avatar/AvatarCustomizerContent';

interface AvatarCustomizerModalProps {
  onClose: () => void;
  zIndex?: number;
}

export const AvatarCustomizerModal: React.FC<AvatarCustomizerModalProps> = ({ onClose, zIndex }) => {
  const { state, updateUser } = useApp();

  const handleSave = (config: { color: string; bodyId: string; faceId: string }) => {
    updateUser({
      avatarColor: config.color,
      avatarBody: config.bodyId,
      avatarFace: config.faceId,
    });
    onClose();
  };

  return (
    <Modal
      title="Personalizar Avatar"
      icon={<Palette size={15} className="text-calm-700" />}
      onClose={onClose}
      zIndex={zIndex}
      contentClassName="flex-1 flex overflow-hidden bg-white"
    >
      <AvatarCustomizerContent
        initialColor={state.user.avatarColor}
        initialBodyId={state.user.avatarBody}
        initialFaceId={state.user.avatarFace}
        title="Personalizar Avatar"
        description="Escolha a silhueta, expressão e tonalidade do seu perfil:"
        confirmLabel="Salvar Alteração"
        showCancelButton
        onConfirm={handleSave}
        onCancel={onClose}
      />
    </Modal>
  );
};

export default AvatarCustomizerModal;
