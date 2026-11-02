import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { AvatarSvg } from '../../ui/AvatarSvg';
import { Button } from '../../ui/Button';
import { ArrowLeft, Check, Palette } from 'lucide-react';
import { COLOR_PALETTE } from '../onboarding/OnboardingContainer';

interface AvatarCustomizerModalProps {
  onClose: () => void;
}

export const AvatarCustomizerModal: React.FC<AvatarCustomizerModalProps> = ({ onClose }) => {
  const { state, updateUser } = useApp();
  const [selectedColor, setSelectedColor] = useState(state.user.avatarColor || '#6D8B75');

  const handleSave = () => {
    updateUser({ avatarColor: selectedColor });
    onClose();
  };

  return (
    <div className="w-full h-full flex flex-col select-none overflow-hidden bg-white">
      {/* Top Header */}
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

      {/* 2-Column Body (Identical to Onboarding layout) */}
      <div className="flex-1 flex overflow-hidden bg-white">
        {/* Left Column (1/3 ~ 256px) */}
        <aside className="w-64 border-r border-calm-200/80 bg-calm-50/70 p-5 flex flex-col justify-between shrink-0">
          <div className="flex flex-col gap-3">
            <h3 className="font-semibold text-calm-900 text-sm">Tonalidade do Avatar</h3>
            <p className="text-xs text-calm-500 leading-relaxed">
              Escolha a tonalidade suave que melhor representa seu perfil no escritório:
            </p>

            {/* Color Swatches Grid */}
            <div className="grid grid-cols-4 gap-2.5 mt-2">
              {COLOR_PALETTE.map(c => (
                <button
                  key={c.hex}
                  onClick={() => setSelectedColor(c.hex)}
                  className={`w-9 h-9 rounded-full transition-transform active:scale-95 cursor-pointer flex items-center justify-center ${
                    selectedColor === c.hex ? 'ring-2 ring-offset-2 ring-calm-800 scale-105' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                >
                  {selectedColor === c.hex && <Check size={14} className="text-white" />}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-4">
            <Button
              variant="primary"
              size="md"
              fullWidth
              onClick={handleSave}
            >
              Salvar Alteração
            </Button>
            <Button
              variant="ghost"
              size="sm"
              fullWidth
              onClick={onClose}
            >
              Cancelar
            </Button>
          </div>
        </aside>

        {/* Right Column (2/3 ~ flex-1) */}
        <section className="flex-1 flex flex-col items-center justify-center p-6 bg-white text-center">
          <div className="flex flex-col items-center gap-3">
            <AvatarSvg color={selectedColor} size="hero" projected />
            <h4 className="font-semibold text-calm-800 text-sm mt-2">{state.user.name}</h4>
            <p className="text-xs text-calm-500">Silhueta vetorial do colaborador (sem cosméticos pagos)</p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AvatarCustomizerModal;
