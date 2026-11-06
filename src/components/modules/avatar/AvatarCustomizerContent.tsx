import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { AvatarSvg } from '../../ui/AvatarSvg';
import { Button } from '../../ui/Button';
import { Check, Palette, Cloud, Smile } from 'lucide-react';
import {
  AVATAR_BODIES,
  AVATAR_FACES,
  DEFAULT_BODY_ID,
  DEFAULT_FACE_ID,
} from '../../../data/avatarRegistry';
import { AVATAR_COLOR_PALETTE } from '../../../constants/avatarPalette';

export interface AvatarCustomizerConfig {
  color: string;
  bodyId: string;
  faceId: string;
}

export interface AvatarCustomizerContentProps {
  initialColor?: string;
  initialBodyId?: string;
  initialFaceId?: string;
  stepBadge?: string;
  title?: string;
  description?: string;
  confirmLabel?: string;
  showCancelButton?: boolean;
  onConfirm: (config: AvatarCustomizerConfig) => void;
  onCancel?: () => void;
}

type TabType = 'body' | 'face' | 'color';

export const AvatarCustomizerContent: React.FC<AvatarCustomizerContentProps> = ({
  initialColor,
  initialBodyId,
  initialFaceId,
  stepBadge,
  title = 'Personalize seu Avatar',
  description = 'Escolha a silhueta, expressão e tonalidade do seu perfil:',
  confirmLabel = 'Salvar Alteração',
  showCancelButton = false,
  onConfirm,
  onCancel,
}) => {
  const { state } = useApp();
  const [selectedColor, setSelectedColor] = useState(
    initialColor || state.user.avatarColor || '#6D8B75'
  );
  const [selectedBody, setSelectedBody] = useState(
    initialBodyId || state.user.avatarBody || DEFAULT_BODY_ID
  );
  const [selectedFace, setSelectedFace] = useState(
    initialFaceId || state.user.avatarFace || DEFAULT_FACE_ID
  );
  const [activeTab, setActiveTab] = useState<TabType>('body');

  const handleConfirm = () => {
    onConfirm({
      color: selectedColor,
      bodyId: selectedBody,
      faceId: selectedFace,
    });
  };

  return (
    <div className="w-full h-full flex overflow-hidden bg-white select-none">
      {/* Left Column (Options Panel) */}
      <aside className="w-80 border-r border-calm-200/80 bg-calm-50/70 p-4 flex flex-col justify-between shrink-0">
        <div className="flex flex-col gap-3 min-h-0 flex-1">
          {stepBadge && (
            <span className="text-[10px] font-semibold text-sage-700 tracking-wider uppercase">
              {stepBadge}
            </span>
          )}

          <div>
            <h3 className="font-semibold text-calm-900 text-sm">{title}</h3>
            <p className="text-xs text-calm-500 leading-relaxed mt-0.5">{description}</p>
          </div>

          {/* Subtabs Selector */}
          <div className="grid grid-cols-3 gap-1 p-1 bg-calm-200/60 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab('body')}
              className={`py-1.5 px-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'body'
                  ? 'bg-white text-calm-900 shadow-sm'
                  : 'text-calm-600 hover:text-calm-900'
              }`}
            >
              <Cloud size={13} />
              <span>Corpo</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('face')}
              className={`py-1.5 px-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'face'
                  ? 'bg-white text-calm-900 shadow-sm'
                  : 'text-calm-600 hover:text-calm-900'
              }`}
            >
              <Smile size={13} />
              <span>Rosto</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('color')}
              className={`py-1.5 px-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'color'
                  ? 'bg-white text-calm-900 shadow-sm'
                  : 'text-calm-600 hover:text-calm-900'
              }`}
            >
              <Palette size={13} />
              <span>Cor</span>
            </button>
          </div>

          {/* Tab 1: Corpo (Body variations: standardized AvatarSvg circles) */}
          {activeTab === 'body' && (
            <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2">
              <p className="text-xs text-calm-500">Escolha a silhueta da sua nuvem:</p>
              <div className="grid grid-cols-4 gap-3 justify-items-center py-2 px-1">
                {AVATAR_BODIES.map(b => (
                  <AvatarSvg
                    key={b.id}
                    color={selectedColor}
                    bodyId={b.id}
                    faceId={selectedFace}
                    size="lg"
                    showBackground={false}
                    selected={selectedBody === b.id}
                    interactive
                    title={b.name}
                    onClick={() => setSelectedBody(b.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Tab 2: Rosto (Face variations: standardized AvatarSvg face-only circles) */}
          {activeTab === 'face' && (
            <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2">
              <p className="text-xs text-calm-500">Escolha sua expressão facial:</p>
              <div className="grid grid-cols-4 gap-3 justify-items-center py-2 px-1">
                {AVATAR_FACES.map(f => (
                  <AvatarSvg
                    key={f.id}
                    color={selectedColor}
                    faceId={f.id}
                    mode="face-only"
                    size="lg"
                    showBackground={false}
                    selected={selectedFace === f.id}
                    interactive
                    title={f.name}
                    onClick={() => setSelectedFace(f.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: Cor (Color variations: standardized sm circle tokens) */}
          {activeTab === 'color' && (
            <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2">
              <p className="text-xs text-calm-500">Escolha a tonalidade suave do avatar:</p>
              <div className="flex flex-wrap items-center justify-center gap-2 mt-2 py-1 px-1">
                {AVATAR_COLOR_PALETTE.map(c => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setSelectedColor(c.hex)}
                    className={`w-8 h-8 rounded-full transition-all duration-200 cursor-pointer flex items-center justify-center shrink-0 ${
                      selectedColor === c.hex
                        ? 'ring-2 ring-offset-2 ring-calm-800 scale-105 shadow-md'
                        : 'hover:scale-105 opacity-85 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: c.hex }}
                    title={c.name}
                  >
                    {selectedColor === c.hex && <Check size={14} className="text-white" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col gap-2 pt-3 border-t border-calm-200/80 mt-2 shrink-0">
          <Button
            variant="primary"
            size="md"
            fullWidth
            onClick={handleConfirm}
          >
            {confirmLabel}
          </Button>
          {showCancelButton && onCancel && (
            <Button
              variant="ghost"
              size="sm"
              fullWidth
              onClick={onCancel}
            >
              Cancelar
            </Button>
          )}
        </div>
      </aside>

      {/* Right Column: Live Hero Preview (somente o avatar grande, relativo ao container) */}
      <section className="flex-1 flex items-center justify-center p-6 bg-white overflow-hidden">
        <div className="w-full h-full max-w-[340px] max-h-[340px] aspect-square flex items-center justify-center">
          <AvatarSvg
            color={selectedColor}
            bodyId={selectedBody}
            faceId={selectedFace}
            size="full"
            followMouse
            bare
            className="w-full h-full"
          />
        </div>
      </section>
    </div>
  );
};

export default AvatarCustomizerContent;
