import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ExercisePlayer } from '@/components/exercise-player';
import { shuffle } from '@/constants/content';
import { LANGUAGE_LIST, type LanguageId } from '@/constants/languages';
import { INK } from '@/constants/theme';
import {
  addXp,
  loadProgress,
  recordAnswer,
  reviewKey,
  XP_PER_CORRECT,
  type Progress,
} from '@/lib/progress';
import { dueItems } from '@/lib/review-queue';

/** Teto de itens por sessão de revisão, para não virar uma lição sem fim. */
const REVIEW_MAX = 20;

function languageOf(id: string | undefined): LanguageId {
  return LANGUAGE_LIST.some((l) => l.id === id) ? (id as LanguageId) : 'en';
}

export default function ReviewScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const language = languageOf(id);

  const [progress, setProgress] = useState<Progress | null>(null);
  useEffect(() => {
    let alive = true;
    void loadProgress().then((p) => {
      if (alive) setProgress(p);
    });
    return () => {
      alive = false;
    };
  }, []);

  const goToMap = () => router.replace({ pathname: '/', params: { lang: language } });

  if (!progress) return null;

  // O id de cada item vira a própria chave de revisão (`container#exercise`),
  // única entre lições e provas. Assim o `onResult` já sabe onde reagendar sem
  // precisar carregar de volta qual lição era.
  // `dueItems` já vem do mais atrasado para o menos: cortar antes de embaralhar
  // garante que os 20 escolhidos sejam os mais urgentes (a ordem da sessão em si
  // é sorteada, para não decorar a sequência).
  const exercises = shuffle(dueItems(language, progress.reviews).slice(0, REVIEW_MAX)).map((item) => ({
    ...item.exercise,
    id: reviewKey(item.containerId, item.exercise.id),
  }));

  if (exercises.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyIcon}>✅</Text>
        <Text style={styles.emptyTitle}>Nada para revisar agora</Text>
        <Text style={styles.emptyBody}>
          Quando um exercício vencido aparecer, ele entra aqui para você treinar de novo.
        </Text>
        <Pressable accessibilityRole="button" onPress={goToMap} style={styles.cta}>
          <Text style={styles.ctaText}>Voltar ao mapa</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ExercisePlayer
      key={`review-${language}`}
      exercises={exercises}
      language={language}
      onExit={goToMap}
      onDead={({ correct }) => {
        // Morreu no meio: credita o XP do que acertou (revisão não conclui lição).
        void addXp(correct * XP_PER_CORRECT).then(goToMap);
      }}
      onResult={(exerciseId, correct) => {
        // `exerciseId` já é a chave de revisão (container#exercise).
        void recordAnswer(exerciseId, correct);
      }}
      onFinish={({ correct }) => {
        void addXp(correct * XP_PER_CORRECT).then(goToMap);
      }}
    />
  );
}

const styles = StyleSheet.create({
  empty: { alignItems: 'center', backgroundColor: INK.bg, flex: 1, gap: 10, justifyContent: 'center', padding: 28 },
  emptyIcon: { fontSize: 44 },
  emptyTitle: { color: INK.white, fontSize: 20, fontWeight: '800' },
  emptyBody: { color: INK.muted, fontSize: 14, textAlign: 'center' },
  cta: { backgroundColor: INK.violet, borderRadius: 14, marginTop: 12, paddingHorizontal: 24, paddingVertical: 14 },
  ctaText: { color: INK.white, fontSize: 16, fontWeight: '700' },
});
