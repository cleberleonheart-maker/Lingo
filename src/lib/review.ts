/** Estado de uma revisão espaçada: em que passo está e quando vence. */
export type Review = { step: number; due: number };

/** Intervalos entre revisões (ms): 5 min, 1 dia, 3 dias. */
export const REVIEW_STEPS = [5 * 60_000, 24 * 60 * 60_000, 3 * 24 * 60 * 60_000];

/**
 * Revisões depois de um resultado. Pura (recebe `now`) para dar para testar sem
 * `AsyncStorage`.
 *
 * - **Errar**: volta ao passo 0 (revisa em 5 min).
 * - **Acertar**: avança um passo. O **primeiro** acerto também entra na fila
 *   (passo 1, revisa em 1 dia) — antes era descartado, então só o que se errava
 *   voltava para revisão.
 * - Passar do último passo: o item sai da fila (aprendido).
 */
export function applyAnswer(
  reviews: Record<string, Review>,
  key: string,
  correct: boolean,
  now: number
): Record<string, Review> {
  const next = { ...reviews };
  const existing = next[key];

  if (!correct) {
    next[key] = { step: 0, due: now + REVIEW_STEPS[0] };
    return next;
  }

  const step = (existing?.step ?? 0) + 1;
  if (step >= REVIEW_STEPS.length) {
    delete next[key];
  } else {
    next[key] = { step, due: now + REVIEW_STEPS[step] };
  }
  return next;
}

/** A revisão está vencida em `now`? (revisão inexistente nunca vence) */
export function isDueAt(review: Review | undefined, now: number): boolean {
  return review !== undefined && review.due <= now;
}
