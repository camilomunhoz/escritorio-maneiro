import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import type { Coworker } from '../../../types';
import { AvatarSvg } from '../../ui/AvatarSvg';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { InvitationModal } from './InvitationModal';
import {
  Users,
  Send,
  Check,
  Tag,
  Sparkles,
} from 'lucide-react';

const AVAILABLE_TAGS = [
  'Café',
  'Corrida',
  'Xadrez',
  'Fotografia',
  'Leitura',
  'Games',
  'Cinema',
  'Música',
  'Caminhada',
  'Tecnologia',
];

interface SocialScreenProps {
  onOpenCoworkerProfile: (coworker: Coworker) => void;
}

export const SocialScreen: React.FC<SocialScreenProps> = ({ onOpenCoworkerProfile }) => {
  const {
    state,
    createInvitation,
    updateUserInterests,
  } = useApp();
  const { user, coworkers } = state;

  const [activeTab, setActiveTab] = useState<'recommendations' | 'coworkers' | 'tags'>('recommendations');
  const [selectedCoworkerForInvite, setSelectedCoworkerForInvite] = useState<Coworker | null>(null);

  const toggleInterest = (tag: string) => {
    const current = user.interests || [];
    const next = current.includes(tag) ? current.filter(t => t !== tag) : [...current, tag];
    updateUserInterests(next);
  };

  // Coworkers scored by interest similarity
  const scoredCoworkers = coworkers.map(cw => {
    const commonTags = (cw.interests || []).filter(t => (user.interests || []).includes(t));
    return {
      ...cw,
      commonTags,
      affinityScore: commonTags.length,
    };
  }).sort((a, b) => b.affinityScore - a.affinityScore);

  const handleSendInvite = (type: 'cafe' | 'almoco' | 'sol' | 'conversa') => {
    if (selectedCoworkerForInvite) {
      createInvitation(selectedCoworkerForInvite.id, type);
      setSelectedCoworkerForInvite(null);
    }
  };

  return (
    <div className="w-full h-full flex flex-col justify-between overflow-y-auto px-4 py-3 space-y-4 select-none">
      {/* 1. Header do Módulo Social */}
      <div className="flex items-center justify-between pb-2 border-b border-calm-200/80">
        <div>
          <h2 className="text-sm font-semibold text-calm-900 flex items-center gap-1.5">
            <Users size={16} className="text-sage-700" />
            <span>Conexões Presenciais</span>
          </h2>
          <p className="text-[11px] text-calm-500">Afinidades, colegas e convites de integração</p>
        </div>
        <Badge variant="calm" size="sm">
          {coworkers.filter(c => c.isFriend).length} conexões
        </Badge>
      </div>

      {/* Sub-tabs: Recomendações vs Colegas vs Interesses */}
      <div className="flex items-center gap-1 bg-calm-100 p-0.5 rounded-lg text-xs">
        <button
          onClick={() => setActiveTab('recommendations')}
          className={`flex-1 py-1 text-center font-medium rounded-md transition cursor-pointer ${
            activeTab === 'recommendations'
              ? 'bg-white text-calm-900 shadow-xs'
              : 'text-calm-600 hover:text-calm-900'
          }`}
        >
          Recomendados
        </button>
        <button
          onClick={() => setActiveTab('coworkers')}
          className={`flex-1 py-1 text-center font-medium rounded-md transition cursor-pointer ${
            activeTab === 'coworkers'
              ? 'bg-white text-calm-900 shadow-xs'
              : 'text-calm-600 hover:text-calm-900'
          }`}
        >
          Todos ({coworkers.length})
        </button>
        <button
          onClick={() => setActiveTab('tags')}
          className={`flex-1 py-1 text-center font-medium rounded-md transition cursor-pointer ${
            activeTab === 'tags'
              ? 'bg-white text-calm-900 shadow-xs'
              : 'text-calm-600 hover:text-calm-900'
          }`}
        >
          Meus Interesses
        </button>
      </div>

      {/* Content: 1. Recommendations */}
      {activeTab === 'recommendations' && (
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-calm-800 flex items-center gap-1">
              <Sparkles size={13} className="text-sand-600" />
              <span>Maior Afinidade por Interesses</span>
            </span>
            <span className="text-[10px] text-calm-500">Interesses em comum</span>
          </div>

          <div className="flex flex-col gap-2">
            {scoredCoworkers.slice(0, 4).map(cw => (
              <div
                key={cw.id}
                className="p-2.5 rounded-xl border border-calm-200 bg-white shadow-soft flex flex-col gap-2 transition hover:border-calm-300"
              >
                <div className="flex items-center justify-between">
                  <div
                    onClick={() => onOpenCoworkerProfile(cw)}
                    className="flex items-center gap-2.5 cursor-pointer min-w-0"
                  >
                    <AvatarSvg color={cw.avatarColor} size="sm" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-calm-900 truncate hover:text-sage-800">
                        {cw.name}
                      </p>
                      <p className="text-[10px] text-calm-500 truncate">{cw.department}</p>
                    </div>
                  </div>

                  <Badge variant="sage" size="sm">
                    {cw.affinityScore} {cw.affinityScore === 1 ? 'interesse comum' : 'interesses comuns'}
                  </Badge>
                </div>

                {/* Common Tags Pills */}
                <div className="flex flex-wrap gap-1">
                  {cw.commonTags.map(tag => (
                    <span
                      key={tag}
                      className="text-[9px] bg-sand-50 text-sand-800 border border-sand-200 px-1.5 py-0.5 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Actions: Send invitation or add friend */}
                <div className="pt-2 border-t border-calm-100 flex items-center justify-between gap-2">
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => setSelectedCoworkerForInvite(cw)}
                    className="text-xs gap-1 flex-1 py-1"
                  >
                    <Send size={11} />
                    <span>Convidar para Pausa</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onOpenCoworkerProfile(cw)}
                    className="text-xs px-2.5 py-1"
                  >
                    Ver Perfil
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Content: 2. Coworkers List */}
      {activeTab === 'coworkers' && (
        <div className="flex flex-col gap-2">
          {coworkers.map(cw => (
            <div
              key={cw.id}
              className="p-2 rounded-lg border border-calm-200 bg-white flex items-center justify-between gap-2"
            >
              <div
                onClick={() => onOpenCoworkerProfile(cw)}
                className="flex items-center gap-2.5 min-w-0 cursor-pointer"
              >
                <AvatarSvg color={cw.avatarColor} size="sm" />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-calm-900 truncate">{cw.name}</p>
                  <p className="text-[10px] text-calm-500 truncate">{cw.department}</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <Button
                  size="sm"
                  variant="subtle"
                  onClick={() => setSelectedCoworkerForInvite(cw)}
                  className="text-xs px-2 py-1"
                >
                  Convidar
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Content: 3. Manage My Interests */}
      {activeTab === 'tags' && (
        <div className="flex flex-col gap-3">
          <div>
            <h4 className="text-xs font-semibold text-calm-900">Selecione seus interesses</h4>
            <p className="text-[11px] text-calm-500">
              Suas afinidades ajudam a sugerir colegas de setores diferentes para pausas de descompressão.
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {AVAILABLE_TAGS.map(tag => {
              const isSelected = (user.interests || []).includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => toggleInterest(tag)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-sage-600 text-white shadow-soft'
                      : 'bg-calm-100 hover:bg-calm-200 text-calm-700'
                  }`}
                >
                  <Tag size={11} />
                  <span>{tag}</span>
                  {isSelected && <Check size={11} />}
                </button>
              );
            })}
          </div>

          <p className="text-[10px] text-calm-400 italic">
            Suas preferências são salvas automaticamente no perfil.
          </p>
        </div>
      )}

      {/* Invitation Modal if active */}
      {selectedCoworkerForInvite && (
        <InvitationModal
          coworker={selectedCoworkerForInvite}
          userName={user.name}
          userAvatarColor={user.avatarColor}
          onClose={() => setSelectedCoworkerForInvite(null)}
          onSend={handleSendInvite}
        />
      )}
    </div>
  );
};

export default SocialScreen;
