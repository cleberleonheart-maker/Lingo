import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar } from '@/components/avatar';
import { LocalClock } from '@/components/local-clock';
import { COURSES } from '@/constants/content';
import { LANGUAGES, LANGUAGE_LIST, type LanguageId } from '@/constants/languages';
import { emptyProgress, isExamDone, isLessonDone, loadProgress, type Progress } from '@/lib/progress';

export default function Home() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  // A tela de Idiomas escolhe o idioma por parametro de URL; sem ler isso o
  // mapa voltaria sempre para ingles e os outros cursos ficariam inacessiveis.
  const { lang: wanted } = useLocalSearchParams<{ lang?: string }>();
  const language: LanguageId = LANGUAGE_LIST.some((l) => l.id === wanted)
    ? (wanted as LanguageId)
    : 'en';
  const [progress, setProgress] = useState<Progress | null>(null);

  // `useFocusEffect` e nao `useEffect`: a licao salva o progresso no
  // AsyncStorage e volta com `router.back()`, que NAO remonta esta tela. Com
  // `useEffect` o mapa ficaria mostrando o estado velho para sempre.
  useFocusEffect(
    useCallback(() => {
      let alive = true;
      loadProgress().then((p) => {
        if (alive) setProgress(p);
      });
      return () => {
        alive = false;
      };
    }, [])
  );

  const lang = LANGUAGES[language];
  const course = COURSES[language];
  const p = progress ?? emptyProgress();

  return (
    <ScrollView
      contentContainerStyle={[styles.root, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 32 }]}
      style={styles.bg}>
      <View style={styles.hero}>
        <View style={styles.heroText}>
          <Text style={styles.hello}>Lingo</Text>
          <Text style={styles.streak}>
            {p.streak ? `🔥 ${p.streak} dia${p.streak > 1 ? 's' : ''}` : '🔥 comece hoje'}
          </Text>
          <Text style={styles.xp}>⭐ {p.xp} XP</Text>
        </View>
        <View style={styles.heroRight}>
          <LocalClock style={styles.clock} />
          <Avatar asleep={!p.streak} blink language={language} size={72} />
        </View>
      </View>

      <View style={styles.goal}>
        <View style={styles.goalHead}>
          <Text style={styles.goalLabel}>Meta de hoje</Text>
          <Text style={styles.goalValue}>
            {Math.min(p.todayXp, p.dailyGoal)}/{p.dailyGoal} XP
          </Text>
        </View>
        <View style={styles.goalTrack}>
          <View
            style={[styles.goalFill, { width: `${Math.min(100, (p.todayXp / (p.dailyGoal || 1)) * 100)}%` }]}
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.langRow} horizontal showsHorizontalScrollIndicator={false}>
        {LANGUAGE_LIST.map((item) => {
          const active = item.id === language;
          return (
            <Pressable
              accessibilityRole="button"
              key={item.id}
              // Grava na URL, nao so no estado: se so no estado, um F5 ou um
              // link direto volta para o ingles mesmo com o frances selecionado.
              onPress={() => router.setParams({ lang: item.id })}
              style={[styles.langCard, active && styles.langCardOn]}>
              <Avatar blink={false} language={item.id} size={48} />
              <Text style={[styles.langName, active && styles.langNameOn]}>{item.name}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {course.units.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>{lang.flag} {lang.name} está chegando</Text>
          <Text style={styles.emptyBody}>
            As lições dessa ainda não foram escritas. O avatar já está pronto.
          </Text>
        </View>
      ) : (
        course.units.map((unit) => {
          const allDone = unit.lessons.every((l) => isLessonDone(p, l.id));
          return (
            <View key={unit.id} style={styles.unit}>
              <Text style={styles.unitTitle}>{unit.title}</Text>
              <Text style={styles.unitDesc}>{unit.description}</Text>

              {unit.lessons.map((lesson, i) => {
                const done = isLessonDone(p, lesson.id);
                return (
                  <Pressable
                    accessibilityRole="button"
                    key={lesson.id}
                    onPress={() => router.push(`/lesson/${lesson.id}`)}
                    style={styles.lesson}>
                    <View style={[styles.bubble, done && styles.bubbleDone]}>
                      <Text style={[styles.bubbleText, done && styles.bubbleTextDone]}>
                        {done ? '✓' : i + 1}
                      </Text>
                    </View>
                    <View style={styles.lessonText}>
                      <Text style={styles.lessonTitle}>{lesson.title}</Text>
                      <Text style={styles.lessonSub}>{lesson.subtitle}</Text>
                    </View>
                  </Pressable>
                );
              })}

              <Pressable
                accessibilityRole="button"
                onPress={() => router.push(`/exam/${unit.exam.id}`)}
                style={[styles.exam, allDone && styles.examOn]}>
                <Text style={styles.examText}>
                  {isExamDone(p, unit.exam.id)
                    ? '✓ '
                    : ''}
                  {unit.exam.title}
                </Text>
              </Pressable>
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  bg: { backgroundColor: '#12101a', flex: 1 },
  root: { gap: 20, paddingHorizontal: 20 },
  hero: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  heroText: { gap: 4 },
  heroRight: { alignItems: 'center', flexDirection: 'row', gap: 14 },
  clock: { marginBottom: 2 },
  hello: { color: '#fff', fontSize: 30, fontWeight: '800' },
  streak: { color: '#a79fb8', fontSize: 15 },
  xp: { color: '#FFD166', fontSize: 15, fontWeight: '700' },
  goal: { backgroundColor: '#1c1927', borderColor: '#2c2740', borderRadius: 14, borderWidth: 2, gap: 8, padding: 14 },
  goalHead: { flexDirection: 'row', justifyContent: 'space-between' },
  goalLabel: { color: '#a79fb8', fontSize: 13, fontWeight: '600' },
  goalValue: { color: '#EDE9FE', fontSize: 13, fontWeight: '700' },
  goalTrack: { backgroundColor: '#241f33', borderRadius: 99, height: 10, overflow: 'hidden' },
  goalFill: { backgroundColor: '#FFD166', borderRadius: 99, height: 10 },
  langRow: { gap: 10, paddingRight: 4 },
  langCard: {
    alignItems: 'center',
    backgroundColor: '#1c1927',
    borderColor: '#2c2740',
    borderRadius: 16,
    borderWidth: 2,
    gap: 6,
    padding: 10,
    width: 92,
  },
  langCardOn: { backgroundColor: '#2a2142', borderColor: '#7C5CFF' },
  langName: { color: '#a79fb8', fontSize: 12, fontWeight: '600' },
  langNameOn: { color: '#EDE9FE' },
  empty: { alignItems: 'center', backgroundColor: '#1c1927', borderRadius: 18, gap: 8, padding: 28 },
  emptyTitle: { color: '#EDE9FE', fontSize: 17, fontWeight: '700' },
  emptyBody: { color: '#a79fb8', fontSize: 14, textAlign: 'center' },
  unit: { gap: 10 },
  unitTitle: { color: '#fff', fontSize: 20, fontWeight: '800' },
  unitDesc: { color: '#a79fb8', fontSize: 14, marginTop: -6 },
  lesson: { alignItems: 'center', flexDirection: 'row', gap: 14 },
  bubble: {
    alignItems: 'center',
    backgroundColor: '#241f33',
    borderColor: '#3a3350',
    borderRadius: 99,
    borderWidth: 2,
    height: 52,
    justifyContent: 'center',
    width: 52,
  },
  bubbleDone: { backgroundColor: '#14361f', borderColor: '#3FB950' },
  bubbleText: { color: '#EDE9FE', fontSize: 18, fontWeight: '800' },
  bubbleTextDone: { color: '#3FB950' },
  lessonText: { flex: 1 },
  lessonTitle: { color: '#EDE9FE', fontSize: 16, fontWeight: '700' },
  lessonSub: { color: '#7c7590', fontSize: 13 },
  exam: { backgroundColor: '#241f33', borderRadius: 14, padding: 16 },
  examOn: { backgroundColor: '#2a2142' },
  examText: { color: '#EDE9FE', fontSize: 15, fontWeight: '700', textAlign: 'center' },
});
