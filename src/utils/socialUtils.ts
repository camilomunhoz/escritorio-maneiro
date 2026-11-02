/**
 * Utilitários de cálculo de progressão e níveis para conexões presenciais.
 * Regras:
 * - XP necessário para subir de nível: começa em 50 e sobe 20 a cada nível.
 *   Nível 1 -> 2: 50 XP
 *   Nível 2 -> 3: 70 XP
 *   Nível 3 -> 4: 90 XP
 * - XP ganho por encontro: começa em 50 e sobe 10 a cada nível de relação.
 *   Nível 1: 50 XP
 *   Nível 2: 60 XP
 *   Nível 3: 70 XP
 */

export function getXpRequiredForLevel(level: number): number {
  if (level < 1) return 50;
  return 50 + (level - 1) * 20;
}

export function getXpRewardForEncounter(currentRelationLevel: number): number {
  const lvl = Math.max(1, currentRelationLevel);
  return 50 + (lvl - 1) * 10;
}

export interface ConnectionLevelInfo {
  level: number;
  currentLevelXp: number;
  nextLevelXpRequired: number;
  progressPercentage: number;
}

export function calculateConnectionLevel(totalSharedXp: number): ConnectionLevelInfo {
  let remainingXp = Math.max(0, totalSharedXp);
  let level = 1;

  while (true) {
    const requiredForNext = getXpRequiredForLevel(level);
    if (remainingXp < requiredForNext) {
      const percentage = Math.min(100, Math.round((remainingXp / requiredForNext) * 100));
      return {
        level,
        currentLevelXp: remainingXp,
        nextLevelXpRequired: requiredForNext,
        progressPercentage: percentage,
      };
    }
    remainingXp -= requiredForNext;
    level += 1;
  }
}

