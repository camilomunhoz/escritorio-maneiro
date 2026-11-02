import React, { useEffect, useRef } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useModalZIndex, type ModalPriority } from '../../context/ModalZIndexContext';
import { BackdropBlurOverlay } from './BackdropBlurOverlay';

export interface ModalProps {
  /** Se o modal está aberto (padrão true quando o componente é montado) */
  isOpen?: boolean;
  /** Callback executado ao fechar */
  onClose: () => void;
  /** Título principal exibido no header */
  title?: React.ReactNode;
  /** Ícone exibido ao lado do título */
  icon?: React.ReactNode;
  /** Subtítulo exibido abaixo do título */
  subtitle?: React.ReactNode;
  /** Conteúdo à direita do header (como Badges ou botões de ação) */
  headerRight?: React.ReactNode;
  /** Texto do botão de retorno (padrão: 'Voltar') */
  backLabel?: string;
  /** Ocultar botão de retorno */
  hideBackButton?: boolean;
  /** Ocultar header padrão por completo */
  hideHeader?: boolean;
  /** Se deve renderizar um backdrop escuro/blur atrás do modal */
  hasBackdrop?: boolean;
  /** Fechar ao clicar no backdrop (padrão true se hasBackdrop for true) */
  closeOnBackdropClick?: boolean;
  /** Fechar ao pressionar a tecla Escape (padrão: true) */
  closeOnEsc?: boolean;
  /** Prioridade na alocação de z-index dinâmico ('normal' | 'high' | 'topmost') */
  priority?: ModalPriority;
  /** Sobrescrever z-index manualmente se necessário */
  zIndex?: number;
  /** ID único opcional para o gerenciador */
  id?: string;
  /** Classes CSS adicionais para o container do modal */
  className?: string;
  /** Classes CSS adicionais para o header */
  headerClassName?: string;
  /** Classes CSS adicionais para a área de conteúdo (children) */
  contentClassName?: string;
  /** Estilos inline adicionais */
  style?: React.CSSProperties;
  /** Conteúdo interno */
  children: React.ReactNode;
}

/**
 * Componente unificado para todas as modais da aplicação.
 * Centraliza o controle dinâmico de z-index para garantir que uma nova modal
 * sempre apareça à frente de todos os conteúdos vigentes, além de padronizar
 * header, backdrop, animação e tratamento de atalhos de fechamento.
 */
export const Modal: React.FC<ModalProps> = ({
  isOpen = true,
  onClose,
  title,
  icon,
  subtitle,
  headerRight,
  backLabel = 'Voltar',
  hideBackButton = false,
  hideHeader = false,
  hasBackdrop = false,
  closeOnBackdropClick = true,
  closeOnEsc = true,
  priority = 'normal',
  zIndex: explicitZIndex,
  id,
  className = '',
  headerClassName = '',
  contentClassName = 'flex-1 overflow-y-auto min-h-0',
  style,
  children,
}) => {
  const { zIndex: dynamicZIndex, backdropZIndex } = useModalZIndex({
    id,
    priority,
    isOpen,
  });

  const effectiveZIndex = explicitZIndex ?? dynamicZIndex;
  const containerRef = useRef<HTMLDivElement>(null);

  // Tratamento da tecla Escape
  useEffect(() => {
    if (!isOpen || !closeOnEsc) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, closeOnEsc, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop opcional dinamicamente posicionado imediatamente abaixo do modal */}
      {hasBackdrop && (
        <BackdropBlurOverlay
          isOpen={isOpen}
          onClick={closeOnBackdropClick ? onClose : undefined}
          zIndex={backdropZIndex}
          intensity="medium"
        />
      )}

      {/* Container Principal do Modal */}
      <div
        ref={containerRef}
        style={{ zIndex: effectiveZIndex, ...style }}
        className={`absolute inset-0 bg-white flex flex-col select-none overflow-hidden animate-fadeIn ${className}`}
        role="dialog"
        aria-modal="true"
      >
        {/* Header Padrão Unificado */}
        {!hideHeader && (
          <header
            className={`px-3 py-2 border-b border-calm-200 bg-calm-50/90 flex items-center justify-between shrink-0 ${headerClassName}`}
          >
            <div className="flex items-center gap-2 min-w-0">
              {!hideBackButton && (
                <>
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex items-center gap-1 px-2 py-1 rounded-md text-calm-700 hover:text-calm-900 hover:bg-calm-200/70 transition cursor-pointer text-xs font-medium shrink-0"
                    title={backLabel}
                  >
                    <ArrowLeft size={14} />
                    <span>{backLabel}</span>
                  </button>
                  <div className="h-4 w-px bg-calm-300 shrink-0" />
                </>
              )}

              {(title || icon) && (
                <div className="flex items-center gap-1.5 min-w-0">
                  {icon && <span className="shrink-0">{icon}</span>}
                  <div className="min-w-0">
                    {title && (
                      <h2 className="text-xs font-normal text-calm-900 truncate">
                        {title}
                      </h2>
                    )}
                    {subtitle && (
                      <p className="text-[10px] text-calm-500 leading-tight truncate">
                        {subtitle}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {headerRight && (
              <div className="flex items-center gap-2 shrink-0 ml-2">
                {headerRight}
              </div>
            )}
          </header>
        )}

        {/* Corpo do Conteúdo */}
        <div className={contentClassName}>
          {children}
        </div>
      </div>
    </>
  );
};

export default Modal;
