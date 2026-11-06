import React from 'react';
import { Crown } from 'lucide-react';
import { UserAvatar } from '../../ui/UserAvatar';
import type { Coworker } from '../../../types';

export interface PodiumEntry {
  userId: string;
  name: string;
  score: number;
  department?: string;
  avatarColor?: string;
  avatarBody?: string;
  avatarFace?: string;
  timestamp?: number;
}

export interface PodiumProps {
  entries: PodiumEntry[];
  currentUserId?: string;
  coworkers?: Coworker[];
  onOpenCoworkerProfile?: (coworker: Coworker) => void;
  onOpenOwnProfile?: () => void;
  className?: string;
  emptyMessage?: string;
  compact?: boolean;
}

export const Podium: React.FC<PodiumProps> = ({
  entries,
  currentUserId,
  coworkers = [],
  onOpenCoworkerProfile,
  onOpenOwnProfile,
  className = '',
  emptyMessage = 'Ainda não há pontuações registradas.',
  compact = false,
}) => {
  if (!entries || entries.length === 0) {
    return (
      <div className={`p-4 bg-calm-50/80 rounded-xl border border-calm-200 text-center text-calm-500 text-xs ${className}`}>
        {emptyMessage}
      </div>
    );
  }

  const first = entries[0];
  const second = entries[1];
  const third = entries[2];

  const handleEntryClick = (entry?: PodiumEntry) => {
    if (!entry) return;
    const isUser = entry.userId === currentUserId;
    if (isUser) {
      onOpenOwnProfile?.();
    } else {
      const found: Coworker = coworkers.find(c => c.id === entry.userId) || {
        id: entry.userId,
        name: entry.name,
        department: entry.department || 'Geral',
        avatarColor: entry.avatarColor || '#6D8B75',
        avatarBody: entry.avatarBody || 'body-15',
        avatarFace: entry.avatarFace || 'face-1',
        level: 3,
        xp: entry.score * 10,
        streak: 4,
        interests: ['Jogos', 'Tecnologia'],
        isFriend: false,
        friendRequestStatus: 'none',
        selectedMedalIds: [],
      };
      onOpenCoworkerProfile?.(found);
    }
  };

  return (
    <div className={`w-full bg-gradient-to-b from-calm-50/70 to-calm-100/50 rounded-xl border border-calm-200/80 p-2.5 sm:p-3 pt-3 sm:pt-4 shadow-soft select-none ${className}`}>
      {/* Container dos 3 Pedestais Totalmente Responsivo */}
      <div className="flex items-end justify-center gap-1.5 sm:gap-2 w-full min-w-0">

        {/* 2º Lugar - Esquerda */}
        <div
          onClick={() => handleEntryClick(second)}
          className={`flex-1 min-w-0 w-1/3 flex flex-col items-center justify-end group transition-transform ${second ? 'cursor-pointer' : 'opacity-40 pointer-events-none'
            }`}
          title={second ? `Ver perfil de ${second.userId === currentUserId ? 'você' : second.name} (${second.score} pts)` : undefined}
        >
          {second ? (
            <div className="flex flex-col items-center w-full min-w-0 mb-1.5 text-center px-0.5">
              <div className="relative shrink-0">
                <UserAvatar
                  userId={second.userId}
                  user={second}
                  size={compact ? 'xl' : 'xl'}
                  followMouse={true}
                  className="shadow-xs group-hover:scale-105 transition-transform"
                />
              </div>
              <p className="text-[10px] sm:text-[11px] font-semibold text-calm-800 truncate w-full text-center mt-1 leading-tight">
                {second.name}
              </p>
              {second.userId === currentUserId && (
                <span className="text-[8px] sm:text-[9px] font-bold text-sage-700 bg-sage-100 px-1 rounded mt-0.5 shrink-0 truncate max-w-full">
                  (Você)
                </span>
              )}
              <span className="text-[9px] sm:text-[10px] font-mono font-bold text-calm-500 mt-0.5 shrink-0">
                {second.score} pts
              </span>
            </div>
          ) : (
            <div className="h-10 sm:h-12 flex items-center justify-center text-[10px] text-calm-400 font-mono">
              --
            </div>
          )}

          {/* Pedestal 2º Lugar */}
          <div className={`w-full min-w-0 rounded-t-lg bg-gradient-to-t from-calm-200 via-calm-100 to-calm-50 border-t-2 border-x border-calm-300 shadow-xs flex flex-col items-center justify-center relative overflow-hidden group-hover:border-calm-400 transition-colors ${compact ? 'h-12 sm:h-14' : 'h-14 sm:h-16'
            }`}>
            <span className="font-serif font-black text-lg sm:text-xl text-calm-600/90 leading-none">
              2º
            </span>
          </div>
        </div>

        {/* 1º Lugar - Centro (Mais Alto) */}
        <div
          onClick={() => handleEntryClick(first)}
          className={`flex-1 min-w-0 w-1/3 flex flex-col items-center justify-end group transition-transform ${first ? 'cursor-pointer' : 'opacity-40 pointer-events-none'
            }`}
          title={first ? `Ver perfil de ${first.userId === currentUserId ? 'você' : first.name} (${first.score} pts)` : undefined}
        >
          {first ? (
            <div className="flex flex-col items-center w-full min-w-0 mb-1.5 text-center px-0.5">
              <Crown size={compact ? 13 : 15} className="text-amber-500 fill-amber-400 mb-0.5 animate-pulse shrink-0" />
              <div className="relative shrink-0">
                <UserAvatar
                  userId={first.userId}
                  user={first}
                  size={compact ? 'xl' : 'xl'}
                  followMouse={true}
                  className="shadow-sm ring-2 ring-amber-300/80 group-hover:scale-105 transition-transform"
                />
              </div>
              <p className="text-[10px] sm:text-[11px] font-bold text-calm-900 truncate w-full text-center mt-1 leading-tight">
                {first.name}
              </p>
              {first.userId === currentUserId && (
                <span className="text-[8px] sm:text-[9px] font-bold text-sage-700 bg-sage-100 px-1 rounded mt-0.5 shrink-0 truncate max-w-full">
                  (Você)
                </span>
              )}
              <span className="text-[9px] sm:text-[10px] font-mono font-bold text-amber-800 mt-0.5 shrink-0">
                {first.score} pts
              </span>
            </div>
          ) : (
            <div className="h-10 sm:h-12 flex items-center justify-center text-[10px] text-calm-400 font-mono">
              --
            </div>
          )}

          {/* Pedestal 1º Lugar */}
          <div className={`w-full min-w-0 rounded-t-lg bg-gradient-to-t from-amber-200/90 via-amber-100/70 to-amber-50/90 border-t-2 border-x border-amber-300/90 shadow-sm flex flex-col items-center justify-center relative overflow-hidden group-hover:border-amber-400 transition-colors ${compact ? 'h-18 sm:h-20' : 'h-20 sm:h-24'
            }`}>
            <span className="font-serif font-black text-xl sm:text-2xl text-amber-800/90 leading-none">
              1º
            </span>
          </div>
        </div>

        {/* 3º Lugar - Direita */}
        <div
          onClick={() => handleEntryClick(third)}
          className={`flex-1 min-w-0 w-1/3 flex flex-col items-center justify-end group transition-transform ${third ? 'cursor-pointer' : 'opacity-40 pointer-events-none'
            }`}
          title={third ? `Ver perfil de ${third.userId === currentUserId ? 'você' : third.name} (${third.score} pts)` : undefined}
        >
          {third ? (
            <div className="flex flex-col items-center w-full min-w-0 mb-1.5 text-center px-0.5">
              <div className="relative shrink-0">
                <UserAvatar
                  userId={third.userId}
                  user={third}
                  size={compact ? 'xl' : 'xl'}
                  followMouse={true}
                  className="shadow-xs group-hover:scale-105 transition-transform"
                />
              </div>
              <p className="text-[10px] sm:text-[11px] font-semibold text-calm-800 truncate w-full text-center mt-1 leading-tight">
                {third.name}
              </p>
              {third.userId === currentUserId && (
                <span className="text-[8px] sm:text-[9px] font-bold text-sage-700 bg-sage-100 px-1 rounded mt-0.5 shrink-0 truncate max-w-full">
                  (Você)
                </span>
              )}
              <span className="text-[9px] sm:text-[10px] font-mono font-bold text-calm-500 mt-0.5 shrink-0">
                {third.score} pts
              </span>
            </div>
          ) : (
            <div className="h-10 sm:h-12 flex items-center justify-center text-[10px] text-calm-400 font-mono">
              --
            </div>
          )}

          {/* Pedestal 3º Lugar */}
          <div className={`w-full min-w-0 rounded-t-lg bg-gradient-to-t from-earthy-200 via-earthy-100 to-calm-50 border-t-2 border-x border-earthy-300 shadow-xs flex flex-col items-center justify-center relative overflow-hidden group-hover:border-earthy-400 transition-colors ${compact ? 'h-9 sm:h-10' : 'h-10 sm:h-12'
            }`}>
            <span className="font-serif font-black text-base sm:text-lg text-earthy-700/90 leading-none">
              3º
            </span>
          </div>
        </div>

      </div>

      {/* Linha de Base do Podio */}
      <div className="w-full h-1 bg-calm-300/80 rounded-full" />
    </div>
  );
};

export default Podium;