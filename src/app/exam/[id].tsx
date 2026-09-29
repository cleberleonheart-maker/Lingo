import { useLocalSearchParams, useRouter } from 'expo-router';

import { ExercisePlayer } from '@/components/exercise-player';
import { getExam } from '@/constants/content';
import type { LanguageId } from '@/constants/languages';
import { completeExam } from '@/lib/progress';

export default function ExamScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  if (!id) return null;

  for (const language of ['en', 'es', 'fr', 'de', 'it', 'ja'] as LanguageId[]) {
    const exam = getExam(language, id);
    if (!exam) continue;
    const goToMap = () => router.replace({ pathname: '/', params: { lang: language } });
    return (
      <ExercisePlayer
        key={exam.id}
        exercises={exam.exercises}
        language={language}
        onExit={goToMap}
        onFinish={({ correct, total }) => {
          void completeExam(exam.id).then(() => {
            router.replace({ pathname: '/result', params: { id: exam.id, correct: String(correct), total: String(total), lang: language } });
          });
        }}
      />
    );
  }

  return null;
}
