import { useLocalSearchParams, useRouter } from 'expo-router';

import { ExercisePlayer } from '@/components/exercise-player';
import { drawSession, getLesson } from '@/constants/content';
import type { LanguageId } from '@/constants/languages';
import { completeLesson } from '@/lib/progress';

const LANGUAGES: LanguageId[] = ['en', 'es', 'fr', 'de', 'it', 'ja'];

export default function LessonScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  if (!id) return null;

  for (const language of LANGUAGES) {
    const lesson = getLesson(language, id);
    if (!lesson) continue;

    // Nao usar `router.back()` aqui: ele depende de existir uma tela anterior na
    // pilha. Se a licao foi aberta sem historico (F5 na URL, link direto), o
    // React Navigation nao tem o que voltar e dispara "The action 'goBack' was
    // not handled by any navigator", com a licao travada na ultima tela. Como o
    // destino e sempre o mapa, navegar explicitamente funciona nos dois casos.
    const goToMap = () => router.replace({ pathname: '/', params: { lang: language } });

    return (
      <ExercisePlayer
        // Sorteado uma vez por abertura da tela: se fosse dentro do player, a
        // sequencia mudaria a cada re-render e o `index` deixaria de bater.
        exercises={drawSession(lesson)}
        language={language}
        onExit={goToMap}
        onFinish={() => {
          void completeLesson(lesson.id).then(goToMap);
        }}
      />
    );
  }

  return null;
}
