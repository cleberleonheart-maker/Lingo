import type { LanguageId } from '@/constants/languages';

/** Um item de escolha múltipla. */
export type Choice = { id: string; text: string };

export type Exercise =
  /** Traduzir escrevendo. */
  | { kind: 'translate'; id: string; from: string; to: string; accept: string[]; hint?: string }
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
};

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
              kind: 'choice',
              id: 'e3',
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
              id: 'e4',
              from: 'Obrigado!',
              to: 'inglês',
              accept: ['thank you', 'thanks', 'thankyou'],
            },
          ],
        },
        {
          id: 'en-u1-l3',
          title: 'De onde você é',
          subtitle: 'país e nacionalidade',
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
            {
              kind: 'match',
              id: 'e4',
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
  es: { language: 'es', from: 'pt', units: [] },
  fr: { language: 'fr', from: 'pt', units: [] },
  de: { language: 'de', from: 'pt', units: [] },
  it: { language: 'it', from: 'pt', units: [] },
  ja: { language: 'ja', from: 'pt', units: [] },
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
