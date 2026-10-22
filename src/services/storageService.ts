import type { AppState } from '../types';
import { createInitialAppState } from './mockDataService';

const STORAGE_KEY = 'escritorio_divertido_app_state_v1';

export function loadAppState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = createInitialAppState();
      saveAppState(initial);
      return initial;
    }
    const parsed = JSON.parse(raw) as AppState;
    // Basic integrity check
    if (!parsed.user || !parsed.coworkers) {
      throw new Error('Estado corrompido ou incompleto.');
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
