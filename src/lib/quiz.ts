import { checkAnswer, type Exercise } from '@/constants/content';

/** Vidas por sessão. Errar desconta; zerar encerra a lição sem concluir. */
export const MAX_HEARTS = 3;

/** Em `match`, o acerto é todos os pares ligados corretamente. */
export function isAnswerCorrect(
  exercise: Exercise,
  given: string,
  linked: Map<string, string> | null
): boolean {
  if (exercise.kind === 'match') {
    if (!linked) return false;
    return exercise.pairs.every((p) => linked.get(p.left) === p.right);
  }
  return checkAnswer(exercise, given);
}

/**
 * Liga `left` a `right` na coluna da direita. Se `right` já estava ligado a
 * outro item, a ligação antiga é desfeita (cada item da direita só serve uma vez).
 */
export function linkPair(
  linked: Map<string, string>,
  left: string,
  right: string
): Map<string, string> {
  const next = new Map(linked);
  for (const [k, v] of next) if (v === right) next.delete(k);
  next.set(left, right);
  return next;
}

/** Todos os pares do `match` já foram ligados? */
export function isMatchComplete(
  exercise: Exercise & { kind: 'match' },
  linked: Map<string, string>
): boolean {
  return linked.size === exercise.pairs.length;
}

/** Desconta uma vida. `dead` quando o contador chega a zero. */
export function loseHeart(hearts: number): { hearts: number; dead: boolean } {
  const left = Math.max(0, hearts - 1);
  return { hearts: left, dead: left <= 0 };
}

export type Step =
  | { finished: true; correct: number; total: number }
  | { finished: false; index: number; correct: number };

/**
 * Próximo passo depois do "Continuar": avança o índice ou, no último exercício,
 * encerra a sessão com o placar. `correct` já inclui o acerto atual.
 */
export function nextStep(
  index: number,
  total: number,
  correctCount: number,
  wasCorrect: boolean
): Step {
  const correct = correctCount + (wasCorrect ? 1 : 0);
  if (index + 1 >= total) return { finished: true, correct, total };
  return { finished: false, index: index + 1, correct };
}
