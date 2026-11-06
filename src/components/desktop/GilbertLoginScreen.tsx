import React, { useState, useRef, useEffect } from 'react';
import { User, ArrowRight, Loader2 } from 'lucide-react';

export interface GilbertLoginScreenProps {
  userName: string;
  onLoginSuccess: () => void;
  isUnlocking?: boolean;
}

const WALLPAPERS = [
  'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1920&q=80',
];

export const GilbertLoginScreen: React.FC<GilbertLoginScreenProps> = ({
  userName,
  onLoginSuccess,
  isUnlocking = false,
}) => {
  const [bgUrl] = useState(() => WALLPAPERS[Math.floor(Math.random() * WALLPAPERS.length)]);
  const [password, setPassword] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const hasTriggeredRef = useRef<boolean>(false);
  const typingTimerRef = useRef<number | null>(null);

  // Limpa timer se desmontar
  useEffect(() => {
    return () => {
      if (typingTimerRef.current) {
        clearInterval(typingTimerRef.current);
      }
    };
  }, []);

  const triggerTypewriterLogin = () => {
    if (hasTriggeredRef.current || isLoggingIn) return;
    hasTriggeredRef.current = true;
    setIsTyping(true);

    const secret = 'corporate2026';
    let index = 0;

    typingTimerRef.current = window.setInterval(() => {
      index++;
      setPassword(secret.slice(0, index));

      if (index >= secret.length) {
        if (typingTimerRef.current) {
          clearInterval(typingTimerRef.current);
          typingTimerRef.current = null;
        }
        setIsTyping(false);

        // Pequena pausa natural antes de submeter
        setTimeout(() => {
          setIsLoggingIn(true);
          setTimeout(() => {
            onLoginSuccess();
          }, 500);
        }, 200);
      }
    }, 65);
  };

  const handleManualSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    setTimeout(() => {
      onLoginSuccess();
    }, 450);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center select-none overflow-hidden font-os transition-all duration-1000 ease-in-out ${
        isUnlocking ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100 animate-fadeIn'
      }`}
    >
      {/* Background Image com Overlay escuro com nuances azuladas */}
      <div
        className={`absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-out filter brightness-75 ${
          isUnlocking ? 'scale-110 blur-lg' : 'scale-105'
        }`}
        style={{ backgroundImage: `url(${bgUrl})` }}
      />
      <div
        className={`absolute inset-0 bg-gradient-to-b from-[#060b18]/70 via-[#0a142c]/65 to-[#060b18]/80 transition-all duration-1000 ease-out ${
          isUnlocking ? 'backdrop-blur-none bg-[#060b18]/20' : 'backdrop-blur-md'
        }`}
      />

      {/* Cartao de Login Central estilo Windows */}
      <div
        className={`relative z-10 flex flex-col items-center transition-all duration-700 ease-out ${
          isUnlocking ? 'opacity-0 scale-95 translate-y-4' : 'opacity-100 scale-100'
        }`}
      >
        {/* Foto Generica de Anonimo */}
        <div className="w-32 h-32 rounded-full bg-slate-900/80 border-2 border-sky-400/30 flex items-center justify-center shadow-2xl shadow-blue-950/80 overflow-hidden backdrop-blur-xl">
          <User size={68} className="text-sky-200" strokeWidth={1.5} />
        </div>

        {/* Nome do Usuario Mock */}
        <h2 className="text-2xl font-os font-medium text-white tracking-wide mt-5 text-center drop-shadow-md">
          {userName}
        </h2>

        {/* Estado de Login (Entrando...) ou Input de Senha com Typewriter */}
        <div className="mt-6 w-72 flex flex-col items-center font-os">
          {isLoggingIn ? (
            <div className="flex items-center gap-2.5 py-2 text-sky-100">
              <Loader2 size={18} className="animate-spin text-sky-400" />
              <span className="text-sm font-os font-normal tracking-wide">Bem-vindo</span>
            </div>
          ) : (
            <form onSubmit={handleManualSubmit} className="relative w-full flex items-center">
              <input
                type="password"
                value={password}
                readOnly={isTyping}
                onClick={triggerTypewriterLogin}
                onFocus={triggerTypewriterLogin}
                placeholder={isTyping ? '' : 'Senha'}
                className="w-full h-9 pl-3.5 pr-10 rounded bg-slate-950/70 border border-blue-400/30 focus:border-sky-400 focus:bg-slate-950/90 focus:ring-2 focus:ring-sky-500/20 text-white placeholder-slate-400 text-sm tracking-widest outline-none shadow-inner backdrop-blur-md transition-all cursor-pointer font-os"
                autoComplete="off"
              />

              <button
                type="submit"
                onClick={triggerTypewriterLogin}
                className="absolute right-1 top-1 bottom-1 w-8 rounded bg-blue-600/80 hover:bg-blue-600 active:bg-blue-500 text-white flex items-center justify-center transition cursor-pointer shadow-xs shadow-blue-500/30"
                title="Entrar"
                aria-label="Entrar"
              >
                <ArrowRight size={16} />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
