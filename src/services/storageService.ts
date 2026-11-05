import type { AppState } from '../types';
import { createInitialAppState } from './mockDataService';

const STORAGE_KEY = 'escritorio_divertido_app_state_v2';

export function loadAppState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = createInitialAppState(false);
      saveAppState(initial);
      return initial;
    }
    const parsed = JSON.parse(raw) as AppState;
    // Basic integrity check
    if (!parsed.user || !parsed.coworkers) {
      throw new Error('Estado corrompido ou incompleto.');
    }
    const initial = createInitialAppState(false);
    if (parsed.isExperienced === undefined) {
      parsed.isExperienced = parsed.user.xp > 0;
    }
    // Guarantee required fields from current schema updates
    if (!parsed.connections || !Array.isArray(parsed.connections)) {
      parsed.connections = initial.connections;
    }
    if (!parsed.invitations || !Array.isArray(parsed.invitations)) {
      parsed.invitations = initial.invitations;
    }
    if (!parsed.dailyGoals || !Array.isArray(parsed.dailyGoals) || parsed.dailyGoals.length === 0) {
      parsed.dailyGoals = initial.dailyGoals;
    }
    if (!parsed.health) {
      parsed.health = initial.health;
    } else if (typeof parsed.health.waterTarget !== 'number' || parsed.health.waterTarget === 2000 || parsed.health.waterTarget <= 0) {
      parsed.health.waterTarget = 1200;
    }
    if (!parsed.user.avatarBody) parsed.user.avatarBody = initial.user.avatarBody || 'body-15';
    if (!parsed.user.avatarFace) parsed.user.avatarFace = initial.user.avatarFace || 'face-1';
    if (Array.isArray(parsed.coworkers)) {
      parsed.coworkers.forEach((cw, idx) => {
        if (!cw.avatarBody) cw.avatarBody = initial.coworkers[idx]?.avatarBody || 'body-15';
        if (!cw.avatarFace) cw.avatarFace = initial.coworkers[idx]?.avatarFace || 'face-1';
      });
    }
    if (parsed.gameCycle && Array.isArray(parsed.gameCycle.roundLeaderboard)) {
      parsed.gameCycle.roundLeaderboard.forEach(entry => {
        if (entry.userId === parsed.user.id) {
          if (!entry.avatarBody) entry.avatarBody = parsed.user.avatarBody;
          if (!entry.avatarFace) entry.avatarFace = parsed.user.avatarFace;
        } else {
          const matchCw = parsed.coworkers?.find(c => c.id === entry.userId) || initial.coworkers?.find(c => c.id === entry.userId);
          if (matchCw) {
            if (!entry.avatarBody) entry.avatarBody = matchCw.avatarBody;
            if (!entry.avatarFace) entry.avatarFace = matchCw.avatarFace;
          }
        }
      });
    }
    return parsed;
  } catch (error) {
    console.warn('Falha ao ler o estado local. Restaurando padrão.', error);
    const initial = createInitialAppState();
    saveAppState(initial);
    return initial;
  }
}

export function saveAppState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Falha ao persistir estado no localStorage.', error);
  }
}

export function resetAppState(): AppState {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore error
  }
  const initial = createInitialAppState();
  saveAppState(initial);
  return initial;
}
