import AsyncStorage from '@react-native-async-storage/async-storage';

import { applyAnswer, isDueAt, type Review } from '@/lib/review';
import { canClaimReward, rewardFor } from '@/lib/reward';

export { REVIEW_STEPS } from '@/lib/review';
export type { Review } from '@/lib/review';
export { REWARD_BASE, REWARD_MAX, REWARD_PER_STREAK, rewardFor } from '@/lib/reward';

const KEY = 'lingo/progress/v1';

/** Meta diária de XP. */
export const DAILY_GOAL = 50;

/** XP creditado por exercício respondido corretamente. */
export const XP_PER_CORRECT = 10;

export type Progress = {
  /** Ids de lições concluídas. */
  lessons: string[];
  /** Ids de provas concluídas. */
  exams: string[];
  /** Data (YYYY-MM-DD) do último estudo, para o streak. */
  lastStudied: string | null;
  /** Dias seguidos de estudo. */
  streak: number;
  /** Maior streak já alcançado. */
  streakBest: number;
  /** XP acumulado. */
  xp: number;
  /** XP ganho no dia `today`. */
  todayXp: number;
  /** Data (YYYY-MM-DD) a que `todayXp` se refere. */
  today: string | null;
  /** Meta diária de XP. */
  dailyGoal: number;
  /** Data (YYYY-MM-DD) em que a recompensa diária foi resgatada pela última vez. */
  lastReward: string | null;
  /** Revisão espaçada: chave do exercício -> estado da revisão. */
  reviews: Record<string, Review>;
};

/** Progresso zerado. Sempre devolve um objeto novo (nunca compartilha estado). */
export function emptyProgress(): Progress {
  return {
    lessons: [],
    exams: [],
    lastStudied: null,
    streak: 0,
    streakBest: 0,
    xp: 0,
    todayXp: 0,
    today: null,
    dailyGoal: DAILY_GOAL,
    lastReward: null,
    reviews: {},
  };
}

function today() {
  const now = new Date();
  const month = `${now.getMonth() + 1}`.padStart(2, '0');
  const day = `${now.getDate()}`.padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

function daysBetween(a: string, b: string) {
  const [ay, am, ad] = a.split('-').map(Number);
  const [by, bm, bd] = b.split('-').map(Number);
  const start = Date.UTC(ay, am - 1, ad);
  const end = Date.UTC(by, bm - 1, bd);
  return Math.round((end - start) / 86_400_000);
}

export async function loadProgress(): Promise<Progress> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return emptyProgress();
    return { ...emptyProgress(), ...(JSON.parse(raw) as Partial<Progress>) };
  } catch {
    return emptyProgress();
  }
}

async function save(progress: Progress) {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(progress));
  } catch {
    // Storage indisponível (cota/permissão): a sessão segue mesmo sem persistir.
  }
}

// Fila de escrita: toda mutação passa por aqui, então nunca há duas operações
// fazendo load → alterar → save ao mesmo tempo. Sem isso, um `recordAnswer` no
// fim de um exercício podia ler o estado antes de outro `recordAnswer` gravar e
// a última escrita apagava a primeira (lost update).
let queue: Promise<unknown> = Promise.resolve();

/** Aplica `transform` sobre o progresso atual, grava e devolve o resultado. */
function update(transform: (current: Progress) => Progress): Promise<Progress> {
  const run = queue.then(async () => {
    const current = await loadProgress();
    const next = transform(current);
    await save(next);
    return next;
  });
  // A fila precisa continuar mesmo se uma operação rejeitar.
  queue = run.then(
    () => undefined,
    () => undefined
  );
  return run;
}

/** Streak: avança se for o dia seguinte; reinicia se o último estudo foi antes. */
function withStudy(current: Progress, now: string): Progress {
  if (current.lastStudied === now) return current;
  const gap = current.lastStudied ? daysBetween(current.lastStudied, now) : Infinity;
  const streak = gap === 1 ? current.streak + 1 : 1;
  return {
    ...current,
    lastStudied: now,
    streak,
    streakBest: Math.max(streak, current.streakBest),
  };
}

/** Registra um estudo: avança o streak se for o dia (ou o dia seguinte). */
export function touchStudy(): Promise<Progress> {
  const now = today();
  return update((current) => withStudy(current, now));
}

/** Soma XP ao dia corrente (zera o contador se virou o dia). Não mexe no streak. */
function addToDay(current: Progress, amount: number, now: string): Progress {
  const sameDay = current.today === now;
  return {
    ...current,
    xp: current.xp + amount,
    today: now,
    todayXp: (sameDay ? current.todayXp : 0) + amount,
  };
}

/** Soma XP do dia (zerando se mudou o dia) e avança o streak. */
export function addXp(amount: number): Promise<Progress> {
  const now = today();
  return update((current) => withStudy(addToDay(current, amount, now), now));
}

/** Estado da recompensa diária, para a tela inicial. */
export function rewardState(progress: Progress): 'ready' | 'claimed' | 'locked' {
  const now = today();
  if (progress.lastReward === now) return 'claimed';
  return canClaimReward(progress, now) ? 'ready' : 'locked';
}

/**
 * Resgata a recompensa do dia: credita o XP (escalado pelo streak) e marca o
 * dia como resgatado. Se já foi resgatada hoje, não credita nada (`xp: 0`).
 * Não avança o streak: o resgate depende do estudo, não o contrário.
 */
export function claimDailyReward(): Promise<{ progress: Progress; xp: number }> {
  const now = today();
  let granted = 0;
  return update((current) => {
    if (!canClaimReward(current, now)) {
      granted = 0;
      return current;
    }
    granted = rewardFor(current.streak);
    return addToDay({ ...current, lastReward: now }, granted, now);
  }).then((progress) => ({ progress, xp: granted }));
}

export function completeLesson(lessonId: string): Promise<Progress> {
  const now = today();
  return update((current) => {
    const withLesson = current.lessons.includes(lessonId)
      ? current
      : { ...current, lessons: [...current.lessons, lessonId] };
    return withStudy(withLesson, now);
  });
}

export function completeExam(examId: string): Promise<Progress> {
  const now = today();
  return update((current) => {
    const withExam = current.exams.includes(examId)
      ? current
      : { ...current, exams: [...current.exams, examId] };
    return withStudy(withExam, now);
  });
}

/** Os ids de lição já carregam o idioma (`en-u1-l1`), então não precisa de prefixo. */
export function isLessonDone(progress: Progress, lessonId: string) {
  return progress.lessons.includes(lessonId);
}

export function isExamDone(progress: Progress, examId: string) {
  return progress.exams.includes(examId);
}

/** Chave de revisão de um exercício dentro da lição/prova (`container#exercise`). */
export function reviewKey(containerId: string, exerciseId: string) {
  return `${containerId}#${exerciseId}`;
}

/** A revisão está vencida (ou nunca feita)? */
export function isDue(progress: Progress, key: string) {
  return isDueAt(progress.reviews[key], Date.now());
}

/** Registra o resultado de um exercício e reagenda a revisão espaçada. */
export function recordAnswer(key: string, correct: boolean): Promise<Progress> {
  const now = Date.now();
  return update((current) => ({
    ...current,
    reviews: applyAnswer(current.reviews, key, correct, now),
  }));
}
