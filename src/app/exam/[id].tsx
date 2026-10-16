import { useLocalSearchParams, useRouter } from 'expo-router';

import { ExercisePlayer } from '@/components/exercise-player';
import { drawSession, getExam } from '@/constants/content';
import type { LanguageId } from '@/constants/languages';
import { addXp, completeExam, recordAnswer, reviewKey, XP_PER_CORRECT } from '@/lib/progress';

export default function ExamScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  if (!id) return null;

  for (const language of ['en', 'es', 'fr', 'de', 'it', 'ja'] as LanguageId[]) {
    const exam = getExam(language, id);
    if (!exam) continue;
    const goToMap = () => router.replace({ pathname: '/', params: { lang: language } });
    // Sorteado uma vez (o compilador mantém estável entre renders), como na
    // lição: reembaralhar a cada render trocaria o exercício no meio da prova.
    // `perSession` da prova é o tamanho do banco, então a ordem muda entre uma
    // tentativa e outra mas os 5 exercícios sempre aparecem.
    const exercises = drawSession(exam);
    return (
      <ExercisePlayer
        key={exam.id}
        exercises={exercises}
        language={language}
        onExit={goToMap}
        onDead={({ correct }) => {
          // Vidas a zero na prova: XP parcial, sem `completeExam`.
          void addXp(correct * XP_PER_CORRECT).then(goToMap);
        }}
        onResult={(exerciseId, correct) => {
          void recordAnswer(reviewKey(exam.id, exerciseId), correct);
        }}
        onFinish={({ correct, total }) => {
          const xp = correct * XP_PER_CORRECT;
          void completeExam(exam.id)
            .then(() => addXp(xp))
            .then(() => {
              router.replace({
                pathname: '/result',
                params: { id: exam.id, correct: String(correct), total: String(total), lang: language, xp: String(xp) },
              });
            });
        }}
      />
    );
  }

  return null;
}
