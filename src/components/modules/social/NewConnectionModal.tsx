import React, { useState, useMemo } from 'react';
import type { Coworker } from '../../../types';
import { Modal } from '../../ui/Modal';
import { UserAvatar } from '../../ui/UserAvatar';
import { Button } from '../../ui/Button';
import { Search, X, UserPlus, Send } from 'lucide-react';

interface NewConnectionModalProps {
  coworkers: Coworker[];
  userInterests: string[];
  onClose: () => void;
  onSelectCoworker: (coworker: Coworker) => void;
  zIndex?: number;
}

export const NewConnectionModal: React.FC<NewConnectionModalProps> = ({
  coworkers,
  userInterests,
  onClose,
  onSelectCoworker,
  zIndex,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCoworkers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return coworkers;

    return coworkers.filter(cw => {
      const nameMatch = cw.name.toLowerCase().includes(term);
      const deptMatch = cw.department.toLowerCase().includes(term);
      const interestMatch = cw.interests?.some(i => i.toLowerCase().includes(term));
      return nameMatch || deptMatch || interestMatch;
    });
  }, [coworkers, searchTerm]);

  return (
    <Modal
      title="Nova Conexão"
      icon={<UserPlus size={15} className="text-calm-700" />}
      onClose={onClose}
      zIndex={zIndex}
      contentClassName="flex-1 flex flex-col overflow-hidden bg-white min-h-0"
    >
      {/* Search Input Bar */}
      <div className="p-3 border-b border-calm-200 bg-calm-50/80 shrink-0 flex flex-col gap-2">
        <div className="relative flex items-center">
          <Search size={14} className="absolute left-2.5 text-calm-400 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar colega por nome, setor ou interesse..."
            className="w-full pl-8 pr-7 py-1.5 text-xs bg-white border border-calm-300 rounded-lg text-calm-900 placeholder-calm-400 focus:outline-hidden focus:ring-1 focus:ring-sage-500 focus:border-sage-500 transition"
            autoFocus
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2 text-calm-400 hover:text-calm-600 p-0.5 cursor-pointer"
              title="Limpar busca"
            >
              <X size={13} />
            </button>
          )}
        </div>

        <div className="flex items-center justify-between text-[11px] text-calm-500 px-0.5">
          <span>Escolha quem convidar para uma pausa:</span>
          <span>{filteredCoworkers.length} encontrado{filteredCoworkers.length === 1 ? '' : 's'}</span>
        </div>
      </div>

      {/* Filtered Coworkers List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-0">
        {filteredCoworkers.length > 0 ? (
          filteredCoworkers.map(cw => {
            const commonTags = (cw.interests || []).filter(t => (userInterests || []).includes(t));

            return (
              <div
                key={cw.id}
                className="p-2.5 rounded-xl border border-calm-200 bg-white hover:border-calm-300 transition shadow-2xs flex flex-col gap-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <UserAvatar user={cw} size="sm" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-calm-900 truncate">{cw.name}</p>
                      <p className="text-[10px] text-calm-500 truncate">{cw.department}</p>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => onSelectCoworker(cw)}
                    className="text-[11px] px-2.5 py-1 gap-1 shrink-0 font-medium"
                  >
                    <Send size={11} />
                    <span>Convidar</span>
                  </Button>
                </div>

                {/* Common or general interest tags */}
                {commonTags.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1 border-t border-calm-100">
                    {commonTags.map(tag => (
                      <span
                        key={tag}
                        className="text-[9px] bg-sage-50 text-sage-800 border border-sage-200 px-1.5 py-0.2 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="py-8 text-center text-calm-500 flex flex-col items-center justify-center">
            <p className="text-xs font-medium">Nenhum colega encontrado</p>
            <p className="text-[10px] text-calm-400 mt-1">
              Tente buscar por outro termo ou nome.
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default NewConnectionModal;

