/**
 * Utilitarios de calculo de nivel e progressao de XP para o jogador.
 *
 * Regras:
 * - O jogador comeca no nivel 0.
 * - Requisito de XP incremental conforme avanca:
 *   Comeca em 60 e soma 20 a cada nivel.
 *   - Nivel 0 -> 1: 60 XP  (XP total acumulado: 60)
 *   - Nivel 1 -> 2: 80 XP  (XP total acumulado: 140)
 *   - Nivel 2 -> 3: 100 XP (XP total acumulado: 240)
 *   - Nivel 3 -> 4: 120 XP (XP total acumulado: 360)
 *   - Nivel 4 -> 5: 140 XP (XP total acumulado: 500)
 *   - Nivel N -> N+1: 60 + N * 20 XP
 */

export interface UserLevelInfo {
  level: number;
  currentLevelXp: number;
  nextLevelXpRequired: number;
  progressPercentage: number;
}

/**
 * Retorna a quantidade de XP necessaria para alcancar o proximo nivel (level -> level + 1).
 */
export function getXpRequiredForUserLevel(level: number): number {
  const safeLevel = Math.max(0, Math.floor(level));
  return 60 + safeLevel * 20;
}

/**
 * Retorna a quantidade total de XP acumulado necessaria para alcancar targetLevel a partir do nivel 0.
 */
export function getTotalXpForLevel(targetLevel: number): number {
  const safeTarget = Math.max(0, Math.floor(targetLevel));
  if (safeTarget === 0) return 0;
  return safeTarget * 60 + 10 * safeTarget * (safeTarget - 1);
}

/**
 * Calcula o nivel atual, o XP no nivel corrente, a meta para o proximo nivel
 * e a porcentagem de conclusao com base no XP total acumulado do jogador.
 */
export function calculateUserLevel(totalXp: number): UserLevelInfo {
  let remainingXp = Math.max(0, Math.floor(totalXp || 0));
  let level = 0;

  while (true) {
    const requiredForNext = getXpRequiredForUserLevel(level);
    if (remainingXp < requiredForNext) {
      const percentage = Math.min(100, Math.max(0, Math.round((remainingXp / requiredForNext) * 100)));
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

