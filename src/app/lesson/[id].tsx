import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';

import { ExercisePlayer } from '@/components/exercise-player';
import { drawSession, getLesson } from '@/constants/content';
import type { LanguageId } from '@/constants/languages';
import { completeLesson } from '@/lib/progress';

const LANGUAGES: LanguageId[] = ['en', 'es', 'fr', 'de', 'it', 'ja'];

export default function LessonScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const match = useMemo(() => {
    if (!id) return null;
    for (const language of LANGUAGES) {
      const lesson = getLesson(language, id);
      if (lesson) return { language, lesson };
    }
    return null;
  }, [id]);

  // Sorteado uma vez por licao e memorizado: se fosse recalculado a cada render
  // (dentro do player ou direto no JSX), a sequencia mudaria e o `index` da
  // sessao deixaria de bater com o exercicio exibido.
  const exercises = useMemo(() => (match ? drawSession(match.lesson) : []), [match]);

  if (!match) return null;

  const { language, lesson } = match;

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
      onFinish={() => {
        void completeLesson(lesson.id).then(goToMap);
      }}
    />
  );
}
