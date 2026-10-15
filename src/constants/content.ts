import { DE } from '@/constants/content-de';
import { ES } from '@/constants/content-es';
import { FR } from '@/constants/content-fr';
import { IT } from '@/constants/content-it';
import { JA } from '@/constants/content-ja';
import type { LanguageId } from '@/constants/languages';

/** Um item de escolha múltipla. */
export type Choice = { id: string; text: string };

export type Exercise =
  /** Traduzir escrevendo. */
  /**
   * Traduzir. `from` e sempre na lingua de origem (portugues) e as respostas em
   * `accept` no idioma estudado. Em japones o `from` fica em kana e a resposta em
   * romaji (nao da para digitar kana no teclado), entao `label` troca o texto
   * de "traduza para" para "leia em romaji".
   */
  | {
      kind: 'translate';
      id: string;
      from: string;
      to: string;
      accept: string[];
      label?: string;
      hint?: string;
    }
  /** Escolha múltipla. */
  | { kind: 'choice'; id: string; prompt: string; answer: string; options: Choice[] }
  /**preencher a lacuna. */
  | { kind: 'fill'; id: string; before: string; after: string; answer: string; accept: string[] }
  /**escolher a tradução de cada palavra. */
  | { kind: 'match'; id: string; pairs: { left: string; right: string }[] }
  /**ouvir e escrever o que ouviu. */
  | { kind: 'listen'; id: string; speak: string; accept: string[] };

export type Lesson = {
  id: string;
  title: string;
  subtitle: string;
  exercises: Exercise[];
  /**
   * Banco maior de exercícios. Quando existe, a lição sorteia `perSession`
   * em vez de usar `exercises` em ordem — aí refazer a mesma lição não repete
   * a mesma sequência. `exercises` vira só a ordem canônica de primeira vez.
   */
  pool?: Exercise[];
  perSession?: number;
};

export function drawSession(lesson: Lesson): Exercise[] {
  if (!lesson.pool || lesson.pool.length === 0) return lesson.exercises;
  const want = Math.min(lesson.perSession ?? 8, lesson.pool.length);
  return shuffle(lesson.pool).slice(0, want);
}

/** Todos os exercícios de uma lição (fixos + banco), para agendar revisões. */
export function allExercises(lesson: Lesson): Exercise[] {
  return [...lesson.exercises, ...(lesson.pool ?? [])];
}

export function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export type Unit = {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
  exam: { id: string; title: string; exercises: Exercise[] };
};

export type Course = {
  language: LanguageId;
  from: string;
  units: Unit[];
};

const EN: Course = {
  language: 'en',
  from: 'pt',
  units: [
    {
      id: 'en-u1',
      title: 'Primeiros contatos',
      description: 'Cumprimentar, se apresentar e dizer de onde você é.',
      lessons: [
        {
          id: 'en-u1-l1',
          title: 'Cumprimentos',
          subtitle: 'oi, olá, até logo',
          exercises: [
            {
              kind: 'choice',
              id: 'e1',
              prompt: 'Como você diz "bom dia" em inglês?',
              answer: 'b',
              options: [
                { id: 'a', text: 'good night' },
                { id: 'b', text: 'good morning' },
                { id: 'c', text: 'good evening' },
                { id: 'd', text: 'goodbye' },
              ],
            },
            {
              kind: 'translate',
              id: 'e2',
              from: 'Olá!',
              to: 'inglês',
              accept: ['hello', 'hi'],
              hint: 'O primeiro "olá" que todo mundo aprende.',
            },
            {
              kind: 'listen',
              id: 'e3',
              speak: 'Good evening',
              accept: ['good evening', 'goodevening'],
            },
            {
              kind: 'fill',
              id: 'e4',
              before: 'Good ',
              after: '!',
              answer: 'morning',
              accept: ['morning'],
            },
          ],
          perSession: 10,
          pool: [
            {
              kind: 'choice',
              id: 'p1',
              prompt: 'Como você diz "bom dia" em inglês?',
              answer: 'b',
              options: [
                { id: 'a', text: 'good night' },
                { id: 'b', text: 'good morning' },
                { id: 'c', text: 'good evening' },
                { id: 'd', text: 'goodbye' },
              ],
            },
            {
              kind: 'choice',
              id: 'p2',
              prompt: 'E "boa noite"?',
              answer: 'a',
              options: [
                { id: 'a', text: 'good night' },
                { id: 'b', text: 'good morning' },
                { id: 'c', text: 'goodbye' },
                { id: 'd', text: 'hello' },
              ],
            },
            {
              kind: 'choice',
              id: 'p3',
              prompt: 'E "boa tarde"?',
              answer: 'c',
              options: [
                { id: 'a', text: 'good night' },
                { id: 'b', text: 'good morning' },
                { id: 'c', text: 'good afternoon' },
                { id: 'd', text: 'thank you' },
              ],
            },
            {
              kind: 'translate',
              id: 'p4',
              from: 'Olá!',
              to: 'inglês',
              accept: ['hello', 'hi', 'hey'],
            },
            {
              kind: 'translate',
              id: 'p5',
              from: 'Bom dia!',
              to: 'inglês',
              accept: ['good morning', 'goodmorning'],
            },
            {
              kind: 'translate',
              id: 'p6',
              from: 'Boa noite!',
              to: 'inglês',
              accept: ['good night', 'goodnight'],
            },
            {
              kind: 'translate',
              id: 'p7',
              from: 'Até logo!',
              to: 'inglês',
              accept: ['goodbye', 'bye', 'see you', 'seeyou', 'good bye'],
            },
            {
              kind: 'translate',
              id: 'p8',
              from: 'Até amanhã!',
              to: 'inglês',
              accept: ['see you tomorrow', 'seeyoutomorrow', 'see you tomorrow!'],
            },
            {
              kind: 'fill',
              id: 'p9',
              before: 'Good ',
              after: '!',
              answer: 'morning',
              accept: ['morning'],
            },
            {
              kind: 'fill',
              id: 'p10',
              before: 'Good ',
              after: '.',
              answer: 'night',
              accept: ['night'],
            },
            {
              kind: 'fill',
              id: 'p11',
              before: 'See you ',
              after: '!',
              answer: 'later',
              accept: ['later'],
            },
            {
              kind: 'listen',
              id: 'p12',
              speak: 'Good evening',
              accept: ['good evening', 'goodevening'],
            },
            {
              kind: 'listen',
              id: 'p13',
              speak: 'See you tomorrow',
              accept: ['see you tomorrow', 'seeyoutomorrow', 'see you tommorow'],
            },
            {
              kind: 'match',
              id: 'p14',
              pairs: [
                { left: 'Hello', right: 'Olá' },
                { left: 'Goodbye', right: 'Adeus' },
                { left: 'Thank you', right: 'Obrigado' },
                { left: 'Please', right: 'Por favor' },
              ],
            },
          ],
        },
        {
          id: 'en-u1-l2',
          title: 'Meu nome é',
          subtitle: 'se apresentar',
          exercises: [
            {
              kind: 'match',
              id: 'e1',
              pairs: [
                { left: 'Hello', right: 'Olá' },
                { left: 'My name is…', right: 'Meu nome é…' },
                { left: 'Nice to meet you', right: 'Prazer em conhecê-lo' },
                { left: 'Thank you', right: 'Obrigado' },
              ],
            },
            {
              kind: 'translate',
              id: 'e2',
              from: 'Meu nome é Ana.',
              to: 'inglês',
              accept: ['my name is ana', 'mynameisana', "my name's ana", "myname'sana"],
            },
            {
              kind: 'fill',
              id: 'e3',
              before: 'My ',
              after: ' is Ana.',
              answer: 'name',
              accept: ['name'],
            },
            {
              kind: 'choice',
              id: 'e4',
              prompt: 'Qual destas completa a frase?',
              answer: 'c',
              options: [
                { id: 'a', text: 'You are Ana' },
                { id: 'b', text: 'Ana is my' },
                { id: 'c', text: 'My name is Ana' },
              ],
            },
            {
              kind: 'translate',
              id: 'e5',
              from: 'Prazer em conhecê-lo.',
              to: 'inglês',
              accept: ['nice to meet you', 'nicetomeetyou'],
            },
            {
              kind: 'choice',
              id: 'e6',
              prompt: 'Qual destas significa "prazer em conhecê-lo"?',
              answer: 'a',
              options: [
                { id: 'a', text: 'nice to meet you' },
                { id: 'b', text: 'thank you' },
                { id: 'c', text: 'goodbye' },
              ],
            },
          ],
        },
        {
          id: 'en-u1-l3',
          title: 'De onde você é',
          subtitle: 'país e nacionalidade',
          perSession: 10,
          exercises: [
            {
              kind: 'fill',
              id: 'e1',
              before: 'I am ',
              after: ' Brazil.',
              answer: 'from',
              accept: ['from'],
            },
            {
              kind: 'choice',
              id: 'e2',
              prompt: '"Where are you from?" responde:',
              answer: 'b',
              options: [
                { id: 'a', text: 'I am fine' },
                { id: 'b', text: 'I am from Brazil' },
                { id: 'c', text: 'I am Ana' },
              ],
            },
            {
              kind: 'listen',
              id: 'e3',
              speak: 'I am from Brazil',
              accept: ['i am from brazil', 'imfrombrazil', "i'm from brazil", "i'mfrombrazil"],
            },
          ],
          pool: [
            {
              kind: 'fill',
              id: 'p1',
              before: 'I am ',
              after: ' Brazil.',
              answer: 'from',
              accept: ['from'],
            },
            {
              kind: 'fill',
              id: 'p2',
              before: 'I am from ',
              after: '.',
              answer: 'Brazil',
              accept: ['brazil'],
            },
            {
              kind: 'choice',
              id: 'p3',
              prompt: '"Where are you from?" responde:',
              answer: 'b',
              options: [
                { id: 'a', text: 'I am fine' },
                { id: 'b', text: 'I am from Brazil' },
                { id: 'c', text: 'I am Ana' },
              ],
            },
            {
              kind: 'choice',
              id: 'p4',
              prompt: 'Como se pergunta "de onde você é"?',
              answer: 'a',
              options: [
                { id: 'a', text: 'Where are you from?' },
                { id: 'b', text: 'How are you?' },
                { id: 'c', text: 'What is your name?' },
              ],
            },
            {
              kind: 'choice',
              id: 'p5',
              prompt: '"I speak English" significa…',
              answer: 'c',
              options: [
                { id: 'a', text: 'Sou inglês' },
                { id: 'b', text: 'Estou na Inglaterra' },
                { id: 'c', text: 'Falo inglês' },
              ],
            },
            {
              kind: 'translate',
              id: 'p6',
              from: 'Sou do Brasil.',
              to: 'inglês',
              accept: ['i am from brazil', 'imfrombrazil', "i'm from brazil", "i'mfrombrazil"],
            },
            {
              kind: 'translate',
              id: 'p7',
              from: 'Eu falo inglês.',
              to: 'inglês',
              accept: ['i speak english', 'ispeakenglish'],
            },
            {
              kind: 'translate',
              id: 'p8',
              from: 'Eu moro no Brasil.',
              to: 'inglês',
              accept: ['i live in brazil', 'iliveinbrazil'],
            },
            {
              kind: 'listen',
              id: 'p9',
              speak: 'I am from Brazil',
              accept: ['i am from brazil', 'imfrombrazil', "i'm from brazil", "i'mfrombrazil"],
            },
            {
              kind: 'listen',
              id: 'p10',
              speak: 'I speak English',
              accept: ['i speak english', 'ispeakenglish'],
            },
            {
              kind: 'match',
              id: 'p11',
              pairs: [
                { left: 'from', right: 'de' },
                { left: 'where', right: 'onde' },
                { left: 'you', right: 'você' },
              ],
            },
          ],
        },
      ],
      exam: {
        id: 'en-u1-exam',
        title: 'Prova da unidade 1',
        exercises: [
          {
            kind: 'choice',
            id: 'q1',
            prompt: '"Boa noite" em inglês é:',
            answer: 'a',
            options: [
              { id: 'a', text: 'good night' },
              { id: 'b', text: 'good morning' },
              { id: 'c', text: 'good day' },
            ],
          },
          {
            kind: 'translate',
            id: 'q2',
            from: 'Meu nome é Pedro.',
            to: 'inglês',
            accept: ['my name is pedro', 'mynameispedro', "my name's pedro", "myname'spedro"],
          },
          {
            kind: 'fill',
            id: 'q3',
            before: 'Nice to meet ',
            after: '!',
            answer: 'you',
            accept: ['you'],
          },
          {
            kind: 'choice',
            id: 'q4',
            prompt: 'Qual é a resposta correta a "How are you?"',
            answer: 'b',
            options: [
              { id: 'a', text: 'My name is Ana' },
              { id: 'b', text: 'I am fine, thank you' },
              { id: 'c', text: 'I am from Brazil' },
            ],
          },
          {
            kind: 'translate',
            id: 'q5',
            from: 'Até logo!',
            to: 'inglês',
            accept: ['goodbye', 'bye', 'see you', 'seeyou', 'good bye'],
          },
        ],
      },
    },
  ],
};

export const COURSES: Record<LanguageId, Course> = {
  en: EN,
  es: { language: 'es', from: 'pt', units: [ES] },
  fr: { language: 'fr', from: 'pt', units: [FR] },
  de: { language: 'de', from: 'pt', units: [DE] },
  it: { language: 'it', from: 'pt', units: [IT] },
  ja: { language: 'ja', from: 'pt', units: [JA] },
};

export function getLesson(language: LanguageId, lessonId: string) {
  return COURSES[language].units.flatMap((u) => u.lessons).find((l) => l.id === lessonId);
}

export function getExam(language: LanguageId, examId: string) {
  return COURSES[language].units.find((u) => u.exam.id === examId)?.exam;
}

export function getUnitOfLesson(language: LanguageId, lessonId: string) {
  return COURSES[language].units.find((u) => u.lessons.some((l) => l.id === lessonId));
}

/** Normaliza para comparar: minúsculas, sem acento, sem pontuação e sem espaço. */
export function normalize(text: string) {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

export function checkAnswer(exercise: Exercise, given: string): boolean {
  const value = normalize(given);
  if (!value) return false;
  if (exercise.kind === 'choice') return given === exercise.answer;
  if (exercise.kind === 'match') return false;
  return exercise.accept.some((a) => normalize(a) === value);
}
