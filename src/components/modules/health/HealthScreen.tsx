import React, { useState, useEffect } from 'react';
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
  Play,
} from 'lucide-react';

interface HealthScreenProps {
  onOpenStretchVision: () => void;
  onOpenCalibration?: () => void;
}

export const HealthScreen: React.FC<HealthScreenProps> = ({ onOpenStretchVision, onOpenCalibration }) => {
  const { state, registerWater, setWaterTarget, calibrateHealth } = useApp();
  const { health } = state;

  const [showPostureCalibration, setShowPostureCalibration] = useState(false);
  const [targetInput, setTargetInput] = useState(String(health.waterTarget || 1200));
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    setTargetInput(String(health.waterTarget || 1200));
  }, [health.waterTarget]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleAddWater = () => {
    if (cooldown > 0) return;
    registerWater(200);
    setCooldown(5);
  };

  const handleTargetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTargetInput(val);
    const num = parseInt(val, 10);
    if (!isNaN(num) && num >= 100) {
      setWaterTarget(num);
    }
  };

  const handleTargetBlur = () => {
    const num = parseInt(targetInput, 10);
    if (isNaN(num) || num < 100) {
      const fallback = health.waterTarget || 1200;
      setTargetInput(String(fallback));
      setWaterTarget(fallback);
    }
  };

  const waterProgress = Math.min(100, Math.round((health.waterCount / (health.waterTarget || 1200)) * 100));

  const postureStatus = health.postureScore >= 80 ? 'Alinhado' : 'Ajuste Recomendado';
  const postureColor = health.postureScore >= 80 ? 'text-sage-700' : 'text-sand-700';

  return (
    <div className="w-full h-full flex flex-col overflow-hidden select-none relative">
      {/* 1. Header Fixado do Módulo de Saúde */}
      <div className="px-4 py-2.5 border-b border-calm-200 bg-calm-50/90 flex items-center justify-between shrink-0">
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

      {/* Conteúdo Rolável */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 min-h-0 flex flex-col justify-between">

      {/* 2. Widget de Hidratação Inteligente */}
      <Card variant="subtle" padding="md" className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
              <Droplets size={18} />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-calm-900">Hidratação Inteligente</h3>
              <p className="text-[10px] text-calm-500">Meta de hidratação no escritório</p>
            </div>
          </div>

          <div className="flex items-center bg-white border border-calm-200 rounded-lg px-2 py-1 shadow-xs">
            <label htmlFor="water-target-input" className="text-[10px] font-medium text-calm-500">
              Meta:
            </label>
            <input
              id="water-target-input"
              type="number"
              min={100}
              max={3000}
              step={100}
              value={targetInput}
              onChange={handleTargetChange}
              onBlur={handleTargetBlur}
              className="w-12 text-right text-xs font-semibold text-calm-900 bg-transparent focus:outline-none focus:ring-1 focus:ring-sage-500 rounded py-0.5"
            />
            <span className="text-[10px] font-medium text-calm-500">ml</span>
          </div>
        </div>

        {/* Barra de Progresso de Água */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] text-calm-600">
            <span>Consumo do Dia</span>
            <span className="font-semibold text-calm-900">{health.waterCount} ml de {health.waterTarget} ml ({waterProgress}%)</span>
          </div>
          <ProgressBar value={health.waterCount} max={health.waterTarget} color="slate" height="sm" />
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="primary"
            fullWidth
            disabled={cooldown > 0}
            onClick={handleAddWater}
            className="text-xs gap-1"
          >
            <Droplets size={12} />
            <span>
              {cooldown > 0 ? `Aguarde (${cooldown}s)` : '+ Registrar 200 ml'}
            </span>
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
          fullWidth
          onClick={onOpenStretchVision}
          className="text-xs gap-1.5 cursor-pointer"
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
          onClick={() => {
            if (onOpenCalibration) {
              onOpenCalibration();
            } else {
              setShowPostureCalibration(true);
            }
          }}
          className="text-[11px] gap-1 px-2.5"
        >
          <Camera size={12} />
          <span>Calibrar</span>
        </Button>
      </div>
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
