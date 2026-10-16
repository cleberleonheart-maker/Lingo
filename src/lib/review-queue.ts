import { COURSES, type Exercise } from '@/constants/content';
import type { LanguageId } from '@/constants/languages';
import { isDueAt, reviewKey, type Review } from '@/lib/review';

/** Um exercício vencido na repetição espaçada, com o container de origem. */
export type DueItem = {
  /** Id da lição ou da prova onde o exercício foi respondido. */
  containerId: string;
  exercise: Exercise;
};

/**
 * Itens vencidos na repetição espaçada de um idioma (lições e provas). Pura
 * (recebe `reviews` e `now`) para dar para testar sem `AsyncStorage`.
 *
 * Só entram exercícios que já têm revisão agendada: quem nunca foi respondido
 * não vence (`isDueAt` devolve `false` para revisão inexistente).
 */
export function dueItems(
  language: LanguageId,
  reviews: Record<string, Review>,
  now: number = Date.now()
): DueItem[] {
  const items: DueItem[] = [];
  const containers = COURSES[language].units.flatMap((unit) => [...unit.lessons, unit.exam]);

  for (const container of containers) {
    for (const exercise of container.exercises) {
      const review = reviews[reviewKey(container.id, exercise.id)];
      if (isDueAt(review, now)) items.push({ containerId: container.id, exercise });
    }
  }

  return items;
}
