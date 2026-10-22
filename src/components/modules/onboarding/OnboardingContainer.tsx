import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../../context/AppContext';
import { AvatarSvg } from '../../ui/AvatarSvg';
import { Button } from '../../ui/Button';
import { Loader } from '../../ui/Loader';
import { ArrowLeft, ArrowRight, ShieldCheck, Camera, Check, Sparkles } from 'lucide-react';

export const COLOR_PALETTE = [
  { name: 'Sálvia', hex: '#6D8B75' },
  { name: 'Ardósia', hex: '#5A6B7C' },
  { name: 'Terracota', hex: '#C87D6B' },
  { name: 'Areia', hex: '#CCA97D' },
  { name: 'Argila', hex: '#8D6E63' },
  { name: 'Oliva', hex: '#556F5C' },
  { name: 'Aço', hex: '#455A64' },
  { name: 'Carmesim Suave', hex: '#9E5B4B' },
];

export const OnboardingContainer: React.FC = () => {
  const { state, setDrawerMode, updateUser, completeOnboarding } = useApp();

  // Internal onboarding sub-stages
  // 'boot_loader' -> 'welcome' -> 'carousel' -> 'privacy' -> 'start_prompt' -> 'custom_avatar' -> 'face_detect' -> 'sso_loader'
  const [stage, setStage] = useState<
    'boot_loader' | 'welcome' | 'carousel' | 'privacy' | 'start_prompt' | 'custom_avatar' | 'face_detect' | 'sso_loader'
  >('boot_loader');

  // Carousel current index (0, 1, 2)
  const [carouselIndex, setCarouselIndex] = useState(0);

  // Selected avatar color during step
  const [tempColor, setTempColor] = useState(state.user.avatarColor || '#6D8B75');

  // Camera state
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraScanning, setCameraScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // 1. Initial 1s boot loader
  useEffect(() => {
    if (stage === 'boot_loader') {
      const timer = setTimeout(() => {
        setStage('welcome');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [stage]);

  // Clean up webcam stream on unmount
  useEffect(() => {
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Handle camera permission and simulation
  const handleStartFaceDetection = async () => {
    setCameraActive(true);
    setCameraScanning(true);

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 400, height: 300 } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      }
    } catch {
      // Permission denied or camera unavailable -> simulated visual fallback
    }

    // Oval turns green after 2 seconds and reveals success
    setTimeout(() => {
      setCameraScanning(false);
    }, 2000);
  };

  const handleFinishFaceDetection = (completed: boolean) => {
    // Stop camera tracks
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }

    updateUser({
      avatarColor: tempColor,
      facialDetectionCompleted: completed,
    });

    // Contract drawer back to normal (350x500px) and trigger 3s SSO loader
    setDrawerMode('normal');
    setStage('sso_loader');

    setTimeout(() => {
      completeOnboarding();
    }, 3000);
  };

  // Render sub-views

  // STAGE 1: Boot Loader (1s)
  if (stage === 'boot_loader') {
    return (
      <div className="w-full h-full flex items-center justify-center bg-white p-6">
        <Loader size="md" bottomText="Inicializando ambiente corporativo..." />
      </div>
    );
  }

  // STAGE 2: Welcome Screen
  if (stage === 'welcome') {
    return (
      <div className="w-full h-full flex flex-col justify-between p-6 bg-white select-none">
        <div className="flex flex-col items-center justify-center flex-1 text-center">
          <div className="w-16 h-16 rounded-2xl bg-sage-50 border border-sage-200 flex items-center justify-center mb-6 shadow-soft">
            <Sparkles className="w-8 h-8 text-sage-600" />
          </div>
          <h2 className="text-xl font-semibold text-calm-900 tracking-tight mb-2">
            Bem-vindo ao Escritório Divertido
          </h2>
          <p className="text-xs text-calm-500 max-w-xs leading-relaxed">
            Sua nova plataforma de bem-estar, micropausas cognitivas e conexão presencial no ambiente de trabalho.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          fullWidth
          onClick={() => setStage('carousel')}
        >
          Começar
        </Button>
      </div>
    );
  }

  // 3-Step Carousel
  if (stage === 'carousel') {
    const explanations = [
      {
        title: 'Pausas Cognitivas',
        subtitle: 'Pausas ativas e minijogos sincronizados',
        description:
          'A cada 3 horas, um minijogo rápido é liberado simultaneamente para todo o escritório, criando momentos de descontração comunitária sem atrapalhar o expediente.',
      },
      {
        title: 'Saúde & Postura',
        subtitle: 'Cuidado passivo de saúde e ergonomia',
        description:
          'Monitore hidratação constante, qualidade postural e sugestões de alongamentos leves diretamente pelo desktop, com respeito total ao seu ritmo de foco.',
      },
      {
        title: 'Conexão Presencial',
        subtitle: 'Conexão presencial e incentivo a encontros',
        description:
          'Convide colegas para tomar um café, almoçar juntos ou caminhar ao sol. Desafios compartilhados e metas comunitárias conectam equipes de forma natural.',
      },
    ];

    const currentExp = explanations[carouselIndex];

    const handleNext = () => {
      if (carouselIndex < 2) {
        setCarouselIndex(carouselIndex + 1);
      } else {
        setStage('privacy');
      }
    };

    const handlePrev = () => {
      if (carouselIndex > 0) {
        setCarouselIndex(carouselIndex - 1);
      } else {
        setStage('welcome');
      }
    };

    return (
      <div className="w-full h-full flex flex-col justify-between p-6 bg-white select-none">
        <div className="flex flex-col flex-1 justify-center">
          <span className="text-[11px] font-semibold tracking-wider text-sage-700 uppercase mb-1">
            {currentExp.title}
          </span>
          <h2 className="text-lg font-semibold text-calm-900 leading-snug mb-3">
            {currentExp.subtitle}
          </h2>
          <p className="text-xs text-calm-600 leading-relaxed bg-calm-50 p-4 rounded-xl border border-calm-200/70">
            {currentExp.description}
          </p>
        </div>

        {/* Carousel Bottom Navigation: Prev Arrow, 3 Dots, Next Arrow */}
        <div className="flex items-center justify-between pt-4 border-t border-calm-200/70">
          <button
            onClick={handlePrev}
            className="p-2 rounded-lg text-calm-500 hover:bg-calm-100 hover:text-calm-800 transition cursor-pointer"
            title="Voltar"
          >
            <ArrowLeft size={16} />
          </button>

          {/* 3 Navigable Dots */}
          <div className="flex items-center gap-2">
            {[0, 1, 2].map(idx => (
              <button
                key={idx}
                onClick={() => setCarouselIndex(idx)}
                className={`transition-all duration-200 rounded-full cursor-pointer ${
                  carouselIndex === idx
                    ? 'w-6 h-2 bg-sage-600'
                    : 'w-2 h-2 bg-calm-300 hover:bg-calm-400'
                }`}
                title={`Ir para ${explanations[idx].title}`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="p-2 rounded-lg text-sage-700 hover:bg-sage-50 transition cursor-pointer font-medium"
            title="Avançar"
          >
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  // STAGE 4: Detailed Privacy Guarantee
  if (stage === 'privacy') {
    return (
      <div className="w-full h-full flex flex-col justify-between p-6 bg-white select-none">
        <div className="flex flex-col flex-1 justify-center">
          <div className="w-12 h-12 rounded-xl bg-sage-50 border border-sage-200 flex items-center justify-center mb-4 text-sage-700">
            <ShieldCheck size={26} />
          </div>

          <h2 className="text-lg font-semibold text-calm-900 mb-2">
            Privacidade e Confiança em Primeiro Lugar
          </h2>

          <div className="text-xs text-calm-600 space-y-3 bg-calm-50 p-4 rounded-xl border border-calm-200/70 leading-relaxed overflow-y-auto max-h-56">
            <p>
              Esta plataforma é gerida por uma entidade terceira independente e não permite que dados de pausas, tempos de descanso, postura ou câmera sejam acessados por gestores, chefes ou cargos de liderança corporativa.
            </p>
            <p>
              As metas de saúde e registros de webcam processam detecções localmente para o seu próprio bem-estar, com sigilo rigoroso e sem fins de auditoria ou vigilância de produtividade.
            </p>
          </div>
        </div>

        {/* Bottom row: Back Arrow aligned with "Compreendo" button */}
        <div className="flex items-center gap-3 pt-4 border-t border-calm-200/70">
          <button
            onClick={() => {
              setCarouselIndex(2);
              setStage('carousel');
            }}
            className="p-2.5 rounded-lg text-calm-500 hover:bg-calm-100 transition cursor-pointer"
            title="Voltar para as explicações"
          >
            <ArrowLeft size={16} />
          </button>

          <Button
            variant="primary"
            size="md"
            fullWidth
            onClick={() => {
              // Expand drawer to 750px for the 2-column setup
              setDrawerMode('expanded');
              setStage('start_prompt');
            }}
          >
            Compreendo
          </Button>
        </div>
      </div>
    );
  }

  // STAGE 5: Expanded Transition Prompt ("Vamos começar" -> "Vamos lá")
  if (stage === 'start_prompt') {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-center p-8 bg-white select-none">
        <div className="max-w-md flex flex-col items-center">
          <h2 className="text-2xl font-semibold text-calm-900 mb-2">Vamos começar</h2>
          <p className="text-xs text-calm-500 mb-6 leading-relaxed">
            Em apenas duas etapas simples, vamos definir a tonalidade do seu avatar e calibrar a detecção facial para proteção da sua estação de trabalho.
          </p>
          <Button
            variant="primary"
            size="lg"
            onClick={() => setStage('custom_avatar')}
            className="px-8"
          >
            Vamos lá
          </Button>
        </div>
      </div>
    );
  }

  // STAGE 6: Step 1 - Avatar Customization (1/3 Left, 2/3 Right)
  if (stage === 'custom_avatar') {
    return (
      <div className="w-full h-full flex overflow-hidden bg-white select-none">
        {/* Left Column (1/3 ~ 250px) */}
        <aside className="w-64 border-r border-calm-200/80 bg-calm-50/70 p-5 flex flex-col justify-between">
          <div className="flex flex-col gap-3">
            <span className="text-[10px] font-semibold text-sage-700 tracking-wider uppercase">Passo 1 de 2</span>
            <h3 className="font-semibold text-calm-900 text-sm">Personalização do Avatar</h3>
            <p className="text-xs text-calm-500 leading-relaxed">
              Escolha a tonalidade suave que melhor representa seu perfil no escritório:
            </p>

            {/* Color Swatches Grid */}
            <div className="grid grid-cols-4 gap-2.5 mt-2">
              {COLOR_PALETTE.map(c => (
                <button
                  key={c.hex}
                  onClick={() => setTempColor(c.hex)}
                  className={`w-9 h-9 rounded-full transition-transform active:scale-95 cursor-pointer flex items-center justify-center ${
                    tempColor === c.hex ? 'ring-2 ring-offset-2 ring-calm-800 scale-105' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                >
                  {tempColor === c.hex && <Check size={14} className="text-white" />}
                </button>
              ))}
            </div>
          </div>

          <Button
            variant="primary"
            size="md"
            fullWidth
            onClick={() => setStage('face_detect')}
          >
            Pronto
          </Button>
        </aside>

        {/* Right Column (2/3 ~ 500px) */}
        <section className="flex-1 flex flex-col items-center justify-center p-6 bg-white text-center">
          <div className="flex flex-col items-center gap-3">
            <AvatarSvg color={tempColor} size="hero" projected />
            <h4 className="font-semibold text-calm-800 text-sm mt-2">{state.user.name}</h4>
            <p className="text-xs text-calm-500">Silhueta vetorial do colaborador (sem cosméticos pagos)</p>
          </div>
        </section>
      </div>
    );
  }

  // STAGE 7: Step 2 - Facial Detection / Biometry (1/3 Left, 2/3 Right)
  if (stage === 'face_detect') {
    return (
      <div className="w-full h-full flex overflow-hidden bg-white select-none">
        {/* Left Column (1/3 ~ 250px) */}
        <aside className="w-64 border-r border-calm-200/80 bg-calm-50/70 p-5 flex flex-col justify-between">
          <div className="flex flex-col gap-3">
            <span className="text-[10px] font-semibold text-sage-700 tracking-wider uppercase">Passo 2 de 2</span>
            <h3 className="font-semibold text-calm-900 text-sm">Detecção e Biometria Facial</h3>
            
            <ul className="text-xs text-calm-600 space-y-2 mt-1 leading-relaxed">
              <li className="flex items-start gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-sage-600 mt-1.5 flex-shrink-0" />
                <span>Valida que você é quem está utilizando a estação de trabalho.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-sage-600 mt-1.5 flex-shrink-0" />
                <span>Viabiliza a trava de interface para proteger seus dados contra curiosos.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-sage-600 mt-1.5 flex-shrink-0" />
                <span>Processamento silencioso e seguro na sua própria máquina.</span>
              </li>
            </ul>
          </div>

          <p className="text-[11px] text-calm-400 leading-tight">
            Você pode pular e refazer a qualquer momento nas Configurações.
          </p>
        </aside>

        {/* Right Column (2/3 ~ 500px) */}
        <section className="flex-1 flex flex-col items-center justify-center p-6 bg-white text-center">
          {!cameraActive ? (
            <div className="flex flex-col items-center max-w-sm">
              <div className="w-16 h-16 rounded-2xl bg-calm-100 flex items-center justify-center text-calm-600 mb-4">
                <Camera size={32} />
              </div>
              <h4 className="font-semibold text-calm-900 text-sm mb-1">Acesso à Câmera</h4>
              <p className="text-xs text-calm-500 mb-5 leading-relaxed">
                Posicione seu rosto em frente à tela para uma calibração rápida de 2 segundos.
              </p>

              <div className="flex flex-col gap-2 w-full max-w-xs">
                <Button
                  variant="primary"
                  size="md"
                  fullWidth
                  onClick={handleStartFaceDetection}
                >
                  Realizar detecção facial
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  fullWidth
                  onClick={() => handleFinishFaceDetection(false)}
                >
                  Prefiro realizar depois
                </Button>
              </div>
            </div>
          ) : (
            <div className="relative flex flex-col items-center">
              {/* Camera Frame Container */}
              <div className="relative w-80 h-56 rounded-2xl overflow-hidden bg-slate-900 border border-calm-300 shadow-md flex items-center justify-center">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover transform -scale-x-100"
                  muted
                  playsInline
                />

                {/* Simulated Face Silhouette if video inactive */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                  <AvatarSvg color="#ffffff" size="hero" />
                </div>

                {/* Oval Frame: White turning Green after 2s */}
                <div
                  className={`absolute w-36 h-48 rounded-[50%] border-2 transition-colors duration-500 pointer-events-none ${
                    cameraScanning ? 'border-white animate-pulse' : 'border-emerald-400 bg-emerald-500/10'
                  }`}
                />

                {/* 4 Corner Markers with continuous Scale animation */}
                <div className="absolute inset-4 pointer-events-none animate-pulse">
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-white/80" />
                  <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-white/80" />
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-white/80" />
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-white/80" />
                </div>
              </div>

              {/* Status and Success Message */}
              <div className="mt-4 flex flex-col items-center">
                {cameraScanning ? (
                  <p className="text-xs text-calm-600 animate-pulse font-medium">
                    Detectando rosto... Mantenha a posição.
                  </p>
                ) : (
                  <div className="flex flex-col items-center gap-2 animate-fadeIn">
                    <p className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
                      <Check size={14} className="text-emerald-600" />
                      Detecção concluída com sucesso!
                    </p>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleFinishFaceDetection(true)}
                      className="px-6 mt-1"
                    >
                      Prosseguir
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      </div>
    );
  }

  // STAGE 8: SSO 3-Second Loading Simulation (Normal mode 350x500px)
  if (stage === 'sso_loader') {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-white select-none">
        <Loader
          size="lg"
          topText="Conectando-se ao escritório"
          bottomText="Preparando seu perfil de trabalho."
        />
      </div>
    );
  }

  return null;
};
