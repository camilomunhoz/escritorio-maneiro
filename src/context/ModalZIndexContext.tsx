import React, { createContext, useContext, useState, useRef, useCallback, useEffect, useId } from 'react';

export type ModalPriority = 'normal' | 'high' | 'topmost' | 'menu';

export interface ModalRegistration {
  id: string;
  zIndex: number;
  priority: ModalPriority;
  mountedAt: number;
}

export interface ModalZIndexContextValue {
  /**
   * Registra um modal ou retorna o z-index alocado se já registrado.
   * Garante um z-index estritamente superior ao de qualquer modal atualmente ativo.
   */
  registerModal: (id: string, priority?: ModalPriority) => number;
  /**
   * Desregistra um modal ao ser fechado ou desmontado.
   */
  unregisterModal: (id: string) => void;
  /**
   * Traz um modal aberto para o topo absoluto da pilha.
   */
  bringToFront: (id: string) => number;
  /**
   * Consulta o z-index atual de um modal pelo ID.
   */
  getModalZIndex: (id: string) => number | undefined;
  /**
   * Maior z-index em vigor na aplicação.
   */
  topZIndex: number;
  /**
   * Quantidade de modais ativos.
   */
  activeModalCount: number;
}

const BASE_MODAL_Z_INDEX = 50;
const MODAL_STEP = 10;

const ModalZIndexContext = createContext<ModalZIndexContextValue | undefined>(undefined);

export interface ModalZIndexProviderProps {
  children: React.ReactNode;
  baseZIndex?: number;
}

export const ModalZIndexProvider: React.FC<ModalZIndexProviderProps> = ({
  children,
  baseZIndex = BASE_MODAL_Z_INDEX,
}) => {
  const activeModalsRef = useRef<Map<string, ModalRegistration>>(new Map());
  const [topZIndex, setTopZIndex] = useState<number>(baseZIndex);
  const [activeModalCount, setActiveModalCount] = useState<number>(0);

  const calculateNextZIndex = useCallback((priority: ModalPriority = 'normal'): number => {
    let currentMax = baseZIndex;
    for (const reg of activeModalsRef.current.values()) {
      if (reg.zIndex > currentMax) {
        currentMax = reg.zIndex;
      }
    }

    if (priority === 'menu') {
      return Math.max(currentMax, 100) + 32;
    }

    const priorityOffset = priority === 'topmost' ? 20 : priority === 'high' ? 10 : 0;
    return currentMax + MODAL_STEP + priorityOffset;
  }, [baseZIndex]);

  const registerModal = useCallback((id: string, priority: ModalPriority = 'normal'): number => {
    const existing = activeModalsRef.current.get(id);
    if (existing) {
      return existing.zIndex;
    }

    const nextZ = calculateNextZIndex(priority);
    activeModalsRef.current.set(id, {
      id,
      zIndex: nextZ,
      priority,
      mountedAt: Date.now(),
    });

    // Defer state update to next microtask to avoid 'setState in render' warnings
    queueMicrotask(() => {
      setTopZIndex(nextZ);
      setActiveModalCount(activeModalsRef.current.size);
    });

    return nextZ;
  }, [calculateNextZIndex]);

  const unregisterModal = useCallback((id: string) => {
    if (!activeModalsRef.current.has(id)) {
      return;
    }

    activeModalsRef.current.delete(id);

    // Defer state update to next microtask to avoid 'setState in render' warnings
    queueMicrotask(() => {
      const newCount = activeModalsRef.current.size;
      setActiveModalCount(newCount);

      if (newCount === 0) {
        setTopZIndex(baseZIndex);
      } else {
        let currentMax = baseZIndex;
        for (const reg of activeModalsRef.current.values()) {
          if (reg.zIndex > currentMax) {
            currentMax = reg.zIndex;
          }
        }
        setTopZIndex(currentMax);
      }
    });
  }, [baseZIndex]);

  const bringToFront = useCallback((id: string): number => {
    const existing = activeModalsRef.current.get(id);
    const priority = existing ? existing.priority : 'normal';

    let currentMax = baseZIndex;
    for (const [key, reg] of activeModalsRef.current.entries()) {
      if (key !== id && reg.zIndex > currentMax) {
        currentMax = reg.zIndex;
      }
    }

    let nextZ: number;
    if (priority === 'menu') {
      nextZ = Math.max(currentMax, 100) + 32;
    } else {
      const priorityOffset = priority === 'topmost' ? 20 : priority === 'high' ? 10 : 0;
      nextZ = currentMax + MODAL_STEP + priorityOffset;
    }

    activeModalsRef.current.set(id, {
      id,
      zIndex: nextZ,
      priority,
      mountedAt: Date.now(),
    });

    queueMicrotask(() => {
      setTopZIndex(nextZ);
    });

    return nextZ;
  }, [baseZIndex]);

  const getModalZIndex = useCallback((id: string): number | undefined => {
    return activeModalsRef.current.get(id)?.zIndex;
  }, []);

  const value = {
    registerModal,
    unregisterModal,
    bringToFront,
    getModalZIndex,
    topZIndex,
    activeModalCount,
  };

  return (
    <ModalZIndexContext.Provider value={value}>
      {children}
    </ModalZIndexContext.Provider>
  );
};

export interface UseModalZIndexOptions {
  id?: string;
  priority?: ModalPriority;
  isOpen?: boolean;
  baseZIndex?: number;
}

/**
 * Hook para alocação dinâmica de z-index em modais e diálogos.
 * Garante que qualquer novo modal sempre fique sobreposto a todos os conteúdos e modais existentes.
 */
export function useModalZIndex(options?: UseModalZIndexOptions) {
  const context = useContext(ModalZIndexContext);
  const autoId = useId();
  const id = options?.id || autoId;
  const isOpen = options?.isOpen ?? true;
  const priority = options?.priority ?? 'normal';
  const fallbackBase = options?.baseZIndex ?? BASE_MODAL_Z_INDEX;

  const wasOpenRef = useRef(isOpen);

  // Alocação síncrona na inicialização do estado para evitar qualquer flicker visual no primeiro render
  const [allocatedZIndex, setAllocatedZIndex] = useState<number>(() => {
    if (!context) {
      return fallbackBase + (priority === 'menu' ? 80 : MODAL_STEP);
    }
    if (isOpen) {
      return context.registerModal(id, priority);
    }
    return fallbackBase;
  });

  // Garante registro imediato durante o render caso isOpen mude para true
  if (isOpen && (!wasOpenRef.current || (context && context.getModalZIndex(id) === undefined))) {
    wasOpenRef.current = true;
    if (context) {
      context.registerModal(id, priority);
    }
  } else if (!isOpen && wasOpenRef.current) {
    wasOpenRef.current = false;
    if (context) {
      context.unregisterModal(id);
    }
  }

  useEffect(() => {
    if (!context) return;

    if (isOpen) {
      const z = context.registerModal(id, priority);
      setAllocatedZIndex(z);

      return () => {
        context.unregisterModal(id);
      };
    } else {
      context.unregisterModal(id);
    }
  }, [id, isOpen, priority, context]);

  const bringToFront = useCallback(() => {
    if (!context) return;
    const newZ = context.bringToFront(id);
    setAllocatedZIndex(newZ);
  }, [context, id]);

  const zIndex = context?.getModalZIndex(id) ?? allocatedZIndex;
  const backdropZIndex = priority === 'menu' ? Math.max(0, zIndex - 3) : Math.max(0, zIndex - 1);
  const isTopmost = context ? context.topZIndex <= zIndex : true;

  return {
    zIndex,
    backdropZIndex,
    bringToFront,
    isTopmost,
    modalProps: {
      style: { zIndex },
    },
    backdropProps: {
      style: { zIndex: backdropZIndex },
    },
  };
}

export default ModalZIndexContext;
