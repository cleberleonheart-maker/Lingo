import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';

import { ExercisePlayer } from '@/components/exercise-player';
import { allExercises, drawSession, getLesson, type Exercise, type Lesson } from '@/constants/content';
import type { LanguageId } from '@/constants/languages';
import {
  addXp,
  completeLesson,
  isDue,
  loadProgress,
  recordAnswer,
  reviewKey,
  XP_PER_CORRECT,
  type Progress,
} from '@/lib/progress';

const LANGUAGES: LanguageId[] = ['en', 'es', 'fr', 'de', 'it', 'ja'];

function findLesson(id: string | undefined): { language: LanguageId; lesson: Lesson } | null {
  if (!id) return null;
  for (const language of LANGUAGES) {
    const lesson = getLesson(language, id);
    if (lesson) return { language, lesson };
  }
  return null;
}

/** Sorteio do dia, com os exercícios vencidos na repetição espaçada na frente. */
function buildSession(lesson: Lesson, progress: Progress): Exercise[] {
  const base = drawSession(lesson);
  const due = allExercises(lesson).filter((e) => isDue(progress, reviewKey(lesson.id, e.id)));
  if (due.length === 0) return base;
  const dueIds = new Set(due.map((e) => e.id));
  return [...due, ...base.filter((e) => !dueIds.has(e.id))];
}

export default function LessonScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  // O React Compiler (app.json) memoriza `match` e `exercises` por dependência,
  // então não usamos `useMemo` aqui: ele faria o compilador pular o componente.
  const match = findLesson(id);

  // Lido uma vez para saber quais exercícios estão vencidos na revisão espaçada.
  const [progress, setProgress] = useState<Progress | null>(null);
  useEffect(() => {
    let alive = true;
    void loadProgress().then((p) => {
      if (alive) setProgress(p);
    });
    return () => {
      alive = false;
    };
  }, [match]);

  if (!match || !progress) return null;

  const { language, lesson } = match;
  // Sorteado uma vez (o compilador mantém estável entre renders). Recriar a
  // sequência a cada render trocaria o exercício e o `index` da sessão sairia
  // do lugar.
  const exercises = buildSession(lesson, progress);

  // Nao usar `router.back()` aqui: ele depende de existir uma tela anterior na
  // pilha. Se a licao foi aberta sem historico (F5 na URL, link direto), o
  // React Navigation nao tem o que voltar e dispara "The action 'goBack' was
  // not handled by any navigator", com a licao travada na ultima tela. Como o
  // destino e sempre o mapa, navegar explicitamente funciona nos dois casos.
  const goToMap = () => router.replace({ pathname: '/', params: { lang: language } });

  return (
    // `key` forca remontar ao trocar de licao. Sem isso o React reaproveita a
    // mesma instancia do componente entre /lesson/en-u1-l2 e /lesson/fr-u1-l2 e
    // o `index` da licao inglesa continua valendo na francesa.
    <ExercisePlayer
      key={lesson.id}
      exercises={exercises}
      language={language}
      onExit={goToMap}
      onDead={({ correct }) => {
        // Morreu no meio: credita o XP do que acertou, mas não conclui a lição
        // (por isso não chama `completeLesson`). Antes esse XP era descartado.
        void addXp(correct * XP_PER_CORRECT).then(goToMap);
      }}
      onResult={(exerciseId, correct) => {
        void recordAnswer(reviewKey(lesson.id, exerciseId), correct);
      }}
      onFinish={({ correct }) => {
        void completeLesson(lesson.id)
          .then(() => addXp(correct * XP_PER_CORRECT))
          .then(goToMap);
      }}
    />
  );
}
