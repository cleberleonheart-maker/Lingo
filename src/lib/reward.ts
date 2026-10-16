/** XP base da recompensa diária. */
export const REWARD_BASE = 10;

/** XP extra por dia de streak (a partir do segundo dia). */
export const REWARD_PER_STREAK = 5;

/** Teto da recompensa diária. */
export const REWARD_MAX = 50;

/**
 * Quanto vale a recompensa para um dado streak: cresce 5 XP por dia e para no
 * teto. Streak `0` (ou negativo, por segurança) vale só a base.
 */
export function rewardFor(streak: number): number {
  const days = Math.max(0, streak - 1);
  return Math.min(REWARD_MAX, REWARD_BASE + days * REWARD_PER_STREAK);
}

/**
 * A recompensa do dia pode ser aberta? Só depois de estudar no dia (`lastStudied`
 * precisa ser hoje) e uma única vez por dia (`lastReward` ainda não é hoje).
 *
 * Recebe o estado mínimo (não o `Progress` inteiro) para dar para testar sem
 * `AsyncStorage`.
 */
export function canClaimReward(
  state: { lastStudied: string | null; lastReward: string | null },
  day: string
): boolean {
  return state.lastStudied === day && state.lastReward !== day;
}
