import AsyncStorage from '@react-native-async-storage/async-storage';

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
  /** Revisão espaçada: chave do exercício -> estado da revisão. */
  reviews: Record<string, Review>;
};

/** Estado de uma revisão espaçada. */
export type Review = { step: number; due: number };

/** Intervalos entre revisões (ms): 5 min, 1 dia, 3 dias. */
export const REVIEW_STEPS = [5 * 60_000, 24 * 60 * 60_000, 3 * 24 * 60 * 60_000];

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

/** Registra um estudo: avança o streak se for o dia (ou o dia seguinte). */
export async function touchStudy(): Promise<Progress> {
  const current = await loadProgress();
  const now = today();

  if (current.lastStudied === now) return current;

  const gap = current.lastStudied ? daysBetween(current.lastStudied, now) : Infinity;
  const streak = gap === 1 ? current.streak + 1 : 1;
  const next: Progress = {
    ...current,
    lastStudied: now,
    streak,
    streakBest: Math.max(streak, current.streakBest),
  };
  await save(next);
  return next;
}

/** Soma XP do dia (zerando se mudou o dia) e avança o streak. */
export async function addXp(amount: number): Promise<Progress> {
  const current = await loadProgress();
  const now = today();
  const sameDay = current.today === now;
  const next: Progress = {
    ...current,
    xp: current.xp + amount,
    today: now,
    todayXp: (sameDay ? current.todayXp : 0) + amount,
  };
  await save(next);
  return touchStudy();
}

export async function completeLesson(lessonId: string): Promise<Progress> {
  const current = await loadProgress();
  if (!current.lessons.includes(lessonId)) {
    await save({ ...current, lessons: [...current.lessons, lessonId] });
  }
  return touchStudy();
}

export async function completeExam(examId: string): Promise<Progress> {
  const current = await loadProgress();
  if (!current.exams.includes(examId)) {
    await save({ ...current, exams: [...current.exams, examId] });
  }
  return touchStudy();
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
  const review = progress.reviews[key];
  return review !== undefined && review.due <= Date.now();
}

/** Registra o resultado de um exercício e reagenda a revisão espaçada. */
export async function recordAnswer(key: string, correct: boolean): Promise<Progress> {
  const current = await loadProgress();
  const existing = current.reviews[key];

  if (!correct) {
    const reviews = { ...current.reviews, [key]: { step: 0, due: Date.now() + REVIEW_STEPS[0] } };
    const next = { ...current, reviews };
    await save(next);
    return next;
  }

  if (!existing) return current;

  const reviews = { ...current.reviews };
  const step = existing.step + 1;
  if (step >= REVIEW_STEPS.length) {
    delete reviews[key];
  } else {
    reviews[key] = { step, due: Date.now() + REVIEW_STEPS[step] };
  }
  const next = { ...current, reviews };
  await save(next);
  return next;
}
