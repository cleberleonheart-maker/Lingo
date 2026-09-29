import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'lingo/progress/v1';

export type Progress = {
  /** Ids de lições concluídas. */
  lessons: string[];
  /** Ids de provas concluídas. */
  exams: string[];
  /** Data (YYYY-MM-DD) do último estudo, para o streak. */
  lastStudied: string | null;
  /** Data de início do streak atual. */
  streak: number;
  streakBest: number;
};

const EMPTY: Progress = {
  lessons: [],
  exams: [],
  lastStudied: null,
  streak: 0,
  streakBest: 0,
};

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
    if (!raw) return EMPTY;
    return { ...EMPTY, ...(JSON.parse(raw) as Partial<Progress>) };
  } catch {
    return EMPTY;
  }
}

async function save(progress: Progress) {
  await AsyncStorage.setItem(KEY, JSON.stringify(progress));
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

export async function completeLesson(lessonId: string): Promise<Progress> {
  const current = await loadProgress();
  if (current.lessons.includes(lessonId)) return current;
  const next = { ...current, lessons: [...current.lessons, lessonId] };
  await save(next);
  return touchStudy();
}

export async function completeExam(examId: string): Promise<Progress> {
  const current = await loadProgress();
  if (current.exams.includes(examId)) return current;
  const next = { ...current, exams: [...current.exams, examId] };
  await save(next);
  return touchStudy();
}

/** Os ids de lição já carregam o idioma (`en-u1-l1`), então não precisa de prefixo. */
export function isLessonDone(progress: Progress, lessonId: string) {
  return progress.lessons.includes(lessonId);
}

export function isExamDone(progress: Progress, examId: string) {
  return progress.exams.includes(examId);
}
