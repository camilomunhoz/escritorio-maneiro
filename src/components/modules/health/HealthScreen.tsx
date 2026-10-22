import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { ProgressBar } from '../../ui/ProgressBar';
import { PostureCalibrationModal } from './PostureCalibrationModal';
import {
  HeartPulse,
  Droplets,
  Activity,
  Sparkles,
  Camera,
  AlertCircle,
  Play,
} from 'lucide-react';

interface HealthScreenProps {
  onOpenStretchVision: () => void;
}

export const HealthScreen: React.FC<HealthScreenProps> = ({ onOpenStretchVision }) => {
  const { state, registerWater, setWaterUnit, calibrateHealth } = useApp();
  const { health } = state;

  const [waterFeedback, setWaterFeedback] = useState<string | null>(null);
  const [showPostureCalibration, setShowPostureCalibration] = useState(false);

  const handleAddWater = () => {
    const res = registerWater(1);
    setWaterFeedback(res.message);
    setTimeout(() => setWaterFeedback(null), 5000);
  };

  const isCups = health.waterUnit === 'cups';
  const displayTarget = isCups ? '8 copos' : '2000 ml';
  const displayCurrent = isCups ? `${health.waterCount} copos` : `${health.waterCount * 250} ml`;
  const waterProgress = Math.min(100, Math.round((health.waterCount / health.waterTarget) * 100));

  const postureStatus = health.postureScore >= 80 ? 'Alinhado' : 'Ajuste Recomendado';
  const postureColor = health.postureScore >= 80 ? 'text-sage-700' : 'text-sand-700';

  return (
    <div className="w-full h-full flex flex-col justify-between overflow-y-auto px-4 py-3 space-y-4 select-none">
      {/* 1. Header do Módulo de Saúde */}
      <div className="flex items-center justify-between pb-2 border-b border-calm-200/80">
        <div>
          <h2 className="text-sm font-semibold text-calm-900 flex items-center gap-1.5">
            <HeartPulse size={16} className="text-sage-700" />
            <span>Saúde e Ergonomia</span>
          </h2>
          <p className="text-[11px] text-calm-500">Monitoramento passivo e pausas ativas</p>
        </div>
        <Badge variant={health.calibrated ? 'sage' : 'sand'} size="sm">
          {health.calibrated ? 'Calibrado' : 'Pendente'}
        </Badge>
      </div>

      {/* 2. Widget de Hidratação Inteligente */}
      <Card variant="subtle" padding="md" className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
              <Droplets size={18} />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-calm-900">Hidratação Inteligente</h3>
              <p className="text-[10px] text-calm-500">Meta: {displayTarget}</p>
            </div>
          </div>

          {/* Unit Toggle: Copos vs mL */}
          <div className="flex items-center bg-white rounded-lg p-0.5 border border-calm-200 text-[10px]">
            <button
              onClick={() => setWaterUnit('cups')}
              className={`px-2 py-0.5 rounded font-medium transition cursor-pointer ${
                isCups ? 'bg-sage-600 text-white' : 'text-calm-600 hover:text-calm-900'
              }`}
            >
              Copos
            </button>
            <button
              onClick={() => setWaterUnit('ml')}
              className={`px-2 py-0.5 rounded font-medium transition cursor-pointer ${
                !isCups ? 'bg-sage-600 text-white' : 'text-calm-600 hover:text-calm-900'
              }`}
            >
              mL
            </button>
          </div>
        </div>

        {/* Barra de Progresso de Água */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] text-calm-600">
            <span>Consumo do Dia</span>
            <span className="font-semibold text-calm-900">{displayCurrent} ({waterProgress}%)</span>
          </div>
          <ProgressBar value={health.waterCount} max={health.waterTarget} color="slate" height="sm" />
        </div>

        {/* Feedback message (30-minute spacing rule notification) */}
        {waterFeedback && (
          <div className="text-[10px] p-2 rounded bg-amber-50 border border-amber-200 text-amber-900 leading-tight flex items-start gap-1.5">
            <AlertCircle size={13} className="text-amber-700 shrink-0 mt-0.5" />
            <span>{waterFeedback}</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="primary"
            fullWidth
            onClick={handleAddWater}
            className="text-xs gap-1"
          >
            <Droplets size={12} />
            <span>+ Registrar {isCups ? 'Copo (250 ml)' : '250 ml'}</span>
          </Button>
        </div>
      </Card>

      {/* 3. Alongamento com Visão Computacional (MediaPipe) */}
      <Card variant="subtle" padding="md" className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sage-100 text-sage-800 flex items-center justify-center">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-calm-900">Alongamento Guiado</h3>
              <p className="text-[10px] text-calm-500">Exercício rápido de relaxamento</p>
            </div>
          </div>
          <Badge variant="sage" size="sm">{health.stretchesCompleted} feitas</Badge>
        </div>

        <p className="text-[11px] text-calm-600 leading-relaxed">
          Abra os braços e alcance os alvos na tela para relaxar ombros e cervical.
        </p>

        <Button
          size="sm"
          variant="primary"
          onClick={onOpenStretchVision}
          className="text-xs gap-1.5 w-full bg-sage-700 hover:bg-sage-800"
        >
          <Play size={13} />
          <span>Iniciar Alongamento</span>
        </Button>
      </Card>

      {/* 4. Ergonomia e Postura */}
      <div className="bg-white rounded-xl border border-calm-200 p-3 shadow-soft flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-sand-100 text-sand-800 flex items-center justify-center">
            <Activity size={18} />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-calm-900">Postura Ergonômica</h4>
            <p className={`text-[11px] font-semibold ${postureColor}`}>
              {health.postureScore}% • {postureStatus}
            </p>
          </div>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowPostureCalibration(true)}
          className="text-[11px] gap-1 px-2.5"
        >
          <Camera size={12} />
          <span>Calibrar</span>
        </Button>
      </div>

      {/* Modal de Calibração Rápida de Postura se aberto */}
      {showPostureCalibration && (
        <PostureCalibrationModal
          onClose={() => setShowPostureCalibration(false)}
          onCalibrate={score => {
            calibrateHealth(score);
            setShowPostureCalibration(false);
          }}
        />
      )}
    </div>
  );
};

export default HealthScreen;
