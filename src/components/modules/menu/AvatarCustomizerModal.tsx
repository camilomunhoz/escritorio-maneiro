import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { AvatarSvg } from '../../ui/AvatarSvg';
import { Button } from '../../ui/Button';
import { ArrowLeft, Check, Palette } from 'lucide-react';

interface AvatarCustomizerModalProps {
  onClose: () => void;
}

const PALETTE = [
  '#4F7762', // Sage Calm
  '#64748B', // Slate
  '#C86D51', // Terracotta Muted
  '#C9A66B', // Sand Golden
  '#6366F1', // Indigo Calm
  '#0D9488', // Teal
  '#E11D48', // Rose Muted
  '#D97706', // Amber Warm
];

export const AvatarCustomizerModal: React.FC<AvatarCustomizerModalProps> = ({ onClose }) => {
  const { state, updateUser } = useApp();
  const [selectedColor, setSelectedColor] = useState(state.user.avatarColor);

  const handleSave = () => {
    updateUser({ avatarColor: selectedColor });
    onClose();
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
          <h3 className="text-xs font-semibold text-calm-900 flex items-center gap-1.5">
            <Palette size={15} className="text-calm-700" />
            <span>Personalizar Avatar</span>
          </h3>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 flex-1 flex flex-col items-center justify-center gap-4 bg-gradient-to-b from-calm-50/50 to-white overflow-y-auto">
        <AvatarSvg color={selectedColor} size="lg" projected />
        <span className="text-sm font-semibold text-calm-800">{state.user.name}</span>
        <p className="text-xs text-calm-500 text-center max-w-[220px]">
          Escolha a tonalidade que melhor representa seu perfil no escritório:
        </p>

        {/* Color Palette Grid */}
        <div className="grid grid-cols-4 gap-3 mt-2">
          {PALETTE.map(color => (
            <button
              key={color}
              onClick={() => setSelectedColor(color)}
              style={{ backgroundColor: color }}
              className={`w-10 h-10 rounded-full transition-transform flex items-center justify-center cursor-pointer shadow-sm ${
                selectedColor === color ? 'scale-110 ring-2 ring-offset-2 ring-calm-700' : 'hover:scale-105'
              }`}
            >
              {selectedColor === color && <Check size={16} className="text-white" />}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="p-3 bg-calm-50 border-t border-calm-200 flex items-center justify-end gap-2 shrink-0">
        <Button variant="subtle" size="sm" onClick={onClose} className="text-xs">
          Cancelar
        </Button>
        <Button variant="primary" size="sm" onClick={handleSave} className="text-xs">
          Salvar Alteração
        </Button>
      </div>
    </div>
  );
};

export default AvatarCustomizerModal;
