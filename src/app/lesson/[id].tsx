import { useLocalSearchParams, useRouter } from 'expo-router';

import { ExercisePlayer } from '@/components/exercise-player';
import { drawSession, getLesson } from '@/constants/content';
import type { LanguageId } from '@/constants/languages';
import { completeLesson } from '@/lib/progress';

export default function LessonScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  if (!id) return null;

  for (const language of ['en', 'es', 'fr', 'de', 'it', 'ja'] as LanguageId[]) {
    const lesson = getLesson(language, id);
    if (!lesson) continue;
    return (
      <ExercisePlayer
        // Sorteado uma vez por abertura da tela: se fosse dentro do player, a
        // sequência mudaria a cada re-render e o `index` deixaria de bater.
        exercises={drawSession(lesson)}
        language={language}
        onFinish={() => {
          void completeLesson(lesson.id).then(() => router.back());
        }}
      />
    );
  }

  return null;
}
