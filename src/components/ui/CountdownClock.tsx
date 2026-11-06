import React, { useState, useEffect, useRef } from 'react';
import { Clock } from 'lucide-react';

export interface CountdownClockProps {
  targetTimestamp?: number;
  daysRemaining?: number;
  className?: string;
  clockIconClassName?: string;
  clockIconSize?: number;
}

export const CountdownClock: React.FC<CountdownClockProps> = ({
  targetTimestamp,
  daysRemaining,
  className = '',
  clockIconClassName = 'text-sand-600',
  clockIconSize = 14,
}) => {
  // Se receber dias fixos (ex: deadlineDays), calcula um timestamp final estável
  const calculatedTargetRef = useRef<number>(
    targetTimestamp ?? (daysRemaining ? Date.now() + daysRemaining * 86400000 : Date.now())
  );

  useEffect(() => {
    if (targetTimestamp !== undefined) {
      calculatedTargetRef.current = targetTimestamp;
    }
  }, [targetTimestamp]);

  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const msRemaining = Math.max(0, calculatedTargetRef.current - now);
  const totalSeconds = Math.floor(msRemaining / 1000);

  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const timeString = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const formattedCountdown = days > 0 ? `${days}d ${timeString}` : timeString;

  return (
    <div
      className={`flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-calm-200 shadow-xs font-mono text-xs font-bold text-calm-700 ${className}`}
    >
      <Clock size={clockIconSize} className={clockIconClassName} />
      <span>{formattedCountdown}</span>
    </div>
  );
};

export default CountdownClock;

