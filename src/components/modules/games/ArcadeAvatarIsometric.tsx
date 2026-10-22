import React from 'react';
import { AvatarSvg } from '../../ui/AvatarSvg';

interface ArcadeAvatarIsometricProps {
  avatarColor: string;
  gameTitle: string;
}

export const ArcadeAvatarIsometric: React.FC<ArcadeAvatarIsometricProps> = ({ avatarColor, gameTitle }) => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-between p-4 bg-gradient-to-b from-calm-100 to-calm-200/90 text-calm-800 select-none">
      {/* Informações Superiores */}
      <div className="w-full text-center">
        <span className="text-[10px] uppercase tracking-wider font-semibold text-calm-500">
          Modo Sessão Ativa
        </span>
        <h3 className="text-sm font-semibold text-calm-900 mt-0.5">{gameTitle}</h3>
        <p className="text-[11px] text-calm-600 mt-0.5">Seu avatar na partida</p>
      </div>

      {/* Cenário Isométrico do Fliperama com o Avatar */}
      <div className="relative w-48 h-56 flex items-center justify-center">
        {/* Sombra da base isométrica */}
        <div className="absolute bottom-4 w-36 h-12 bg-calm-400/20 rounded-full blur-[3px]" />

        {/* Gabinete do Fliperama / Arcade em SVG Vetorial */}
        <svg
          viewBox="0 0 200 240"
          className="absolute inset-0 w-full h-full drop-shadow-md"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Gabinete Lateral / Traseiro */}
          <path
            d="M50 40 L90 20 L150 20 L150 180 L110 200 L50 200 Z"
            fill="#94A3B8"
            opacity="0.3"
          />
          {/* Corpo do Arcade Principal */}
          <path
            d="M60 50 L140 50 L140 190 L60 190 Z"
            fill="#475569"
            rx="6"
          />
          {/* Marquee Superior */}
          <rect x="68" y="58" width="64" height="18" rx="3" fill="#E2E8F0" />
          <text x="100" y="71" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#334155" letterSpacing="1">
            ARCADE
          </text>

          {/* Tela do Fliperama com Brilho Pulsante Suave (Sem revelar o jogo) */}
          <rect x="70" y="84" width="60" height="42" rx="4" fill="#0F172A" />
          <rect x="74" y="88" width="52" height="34" rx="2" fill="#1E293B" />
          {/* Linhas de scanline no monitor do arcade */}
          <line x1="74" y1="96" x2="126" y2="96" stroke="#38BDF8" strokeWidth="0.8" opacity="0.4" />
          <line x1="74" y1="104" x2="126" y2="104" stroke="#34D399" strokeWidth="0.8" opacity="0.4" />
          <line x1="74" y1="112" x2="126" y2="112" stroke="#F472B6" strokeWidth="0.8" opacity="0.4" />

          {/* Painel de Controle com Joystick e Botões */}
          <path d="M62 132 L138 132 L144 154 L56 154 Z" fill="#334155" />
          {/* Base do Joystick */}
          <circle cx="82" cy="143" r="5" fill="#1E293B" />
          <line x1="82" y1="143" x2="84" y2="136" stroke="#CBD5E1" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="84" cy="135" r="3.5" fill="#EF4444" className="animate-pulse" />

          {/* Botões do Arcade */}
          <circle cx="106" cy="144" r="3" fill="#38BDF8" />
          <circle cx="116" cy="141" r="3" fill="#34D399" />
          <circle cx="126" cy="144" r="3" fill="#FBBF24" />

          {/* Painel Frontal Inferior com Entrada de Moeda/Ficha */}
          <rect x="68" y="160" width="64" height="26" rx="2" fill="#334155" />
          <rect x="94" y="166" width="12" height="14" rx="1" fill="#1E293B" />
          <line x1="100" y1="168" x2="100" y2="176" stroke="#94A3B8" strokeWidth="1.5" />
        </svg>

        {/* Avatar Posicionado em frente ao Arcade com micro-animação de movimento */}
        <div className="absolute bottom-6 right-7 transform transition-transform duration-300 animate-bounce" style={{ animationDuration: '2.4s' }}>
          <div className="relative">
            <AvatarSvg color={avatarColor} size="md" projected />
            {/* Brilho da tela projetado no rosto do avatar */}
            <div className="absolute -inset-1 rounded-full bg-cyan-400/20 blur-sm pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Dica de Ergonomia durante a sessão */}
      <div className="w-full bg-white/70 backdrop-blur-xs p-2.5 rounded-lg border border-calm-200/80 text-center">
        <p className="text-[10px] text-calm-600 leading-tight">
          Aproveite estes 3 a 5 minutos de pausa para desconectar o foco mental das tarefas corporativas.
        </p>
      </div>
    </div>
  );
};

export default ArcadeAvatarIsometric;
