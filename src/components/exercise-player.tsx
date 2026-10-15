import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Speech from 'expo-speech';
import Animated, { FadeIn } from 'react-native-reanimated';

import { checkAnswer, normalize, type Exercise } from '@/constants/content';
import { LANGUAGES, type LanguageId } from '@/constants/languages';

import { Avatar } from './avatar';

type Props = {
  language: LanguageId;
  exercises: Exercise[];
  onFinish: (score: { correct: number; total: number }) => void;
  /** Botao de sair: abandona a licao sem conta-la como concluida. */
  onExit: () => void;
};

/** Em `match`, o acerto é todos os pares ligados corretamente. */
function matches(exercise: Exercise, given: string, linked: Map<string, string> | null) {
  if (exercise.kind === 'match') {
    if (!linked) return false;
    return exercise.pairs.every((p) => linked.get(p.left) === p.right);
  }
  return checkAnswer(exercise, given);
}

export function ExercisePlayer({ language, exercises, onFinish, onExit }: Props) {
  const insets = useSafeAreaInsets();
  const [index, setIndex] = useState(0);
  const [given, setGiven] = useState('');
  const [picked, setPicked] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [matchSel, setMatchSel] = useState<string | null>(null);
  const [linked, setLinked] = useState<Map<string, string>>(new Map());

  const exercise = exercises[index];
  const lang = LANGUAGES[language];
  const total = exercises.length;
  const progress = (index + (done ? 1 : 0)) / total;

  // A coluna da direita vai embaralhada, senão a resposta fica óbvia.
  const shuffledRights = useMemo(() => {
    if (exercise.kind !== 'match') return [];
    return [...exercise.pairs]
      .map((p) => p.right)
      .sort((a, b) => (a < b ? 1 : a > b ? -1 : 0));
  }, [exercise]);

  const pairs = exercise.kind === 'match' ? exercise.pairs : [];

  function speakNow() {
    Speech.stop();
    Speech.speak(textToSpeak(exercise), { language, rate: 0.85 });
  }

  // O exercício de ouvir precisa falar sozinho ao entrar.
  useEffect(() => {
    if (exercise.kind !== 'listen') return;
    const timer = setTimeout(() => {
      Speech.stop();
      Speech.speak(exercise.speak, { language, rate: 0.85 });
    }, 320);
    return () => {
      clearTimeout(timer);
      Speech.stop();
    };
  }, [exercise, language]);

  function reset() {
    setGiven('');
    setPicked(null);
    setDone(false);
    setMatchSel(null);
    setLinked(new Map());
  }

  function advance(wasCorrect: boolean) {
    if (wasCorrect) setCorrectCount((c) => c + 1);
    if (index + 1 >= total) {
      onFinish({ correct: correctCount + (wasCorrect ? 1 : 0), total });
      return;
    }
    setIndex((i) => i + 1);
    reset();
  }

  function submit(raw?: string) {
    if (done) return;
    const value = raw ?? picked ?? given;
    if (exercise.kind === 'match') {
      const ok = matches(exercise, '', linked);
      setDone(true);
      if (ok) Speech.stop();
      return;
    }
    if (!value) return;
    const ok = matches(exercise, value, null);
    setDone(true);
    if (ok) Speech.stop();
  }

  function tapMatch(side: 'left' | 'right', value: string) {
    if (done) return;
    if (side === 'left') {
      setMatchSel(value);
      return;
    }
    if (!matchSel) return;
    const next = new Map(linked);
    for (const [k, v] of next) if (v === value) next.delete(k);
    next.set(matchSel, value);
    setLinked(next);
    setMatchSel(null);
    if (next.size === pairs.length) {
      const ok = pairs.every((p) => next.get(p.left) === p.right);
      setDone(true);
      if (ok) Speech.stop();
    }
  }

  const answered = done;
  const wasRight = answered && matches(exercise, picked ?? given, linked);

  return (
    <View style={[styles.root, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 12 }]}>
      <View style={styles.topBar}>
        <Pressable accessibilityLabel="Sair" onPress={onExit} style={styles.iconBtn}>
          <Text style={styles.icon}>✕</Text>
        </Pressable>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${Math.min(100, progress * 100)}%` }]} />
        </View>
        <Avatar blink={!answered} language={language} size={34} />
      </View>

      <Animated.View entering={FadeIn.duration(180)} key={exercise.id} style={styles.body}>
        {renderPrompt(exercise, lang.name, () => {
          Speech.stop();
          Speech.speak(exercise.kind === 'listen' ? exercise.speak : textToSpeak(exercise), {
            language: language,
            rate: 0.85,
          });
        })}

        {exercise.kind === 'choice' && (
          <View style={styles.options}>
            {exercise.options.map((option) => {
              const selected = picked === option.id;
              const correct = option.id === exercise.answer;
              const state = !answered ? undefined : correct ? 'ok' : selected ? 'bad' : 'dim';
              return (
                <Pressable
                  accessibilityRole="button"
                  disabled={answered}
                  key={option.id}
                  onPress={() => {
                    setPicked(option.id);
                    submit(option.id);
                  }}
                  style={[styles.option, state === 'ok' && styles.optionOk, state === 'bad' && styles.optionBad, state === 'dim' && styles.optionDim]}>
                  <Text style={styles.optionText}>{option.text}</Text>
                </Pressable>
              );
            })}
          </View>
        )}

        {(exercise.kind === 'translate' || exercise.kind === 'listen' || exercise.kind === 'fill') && (
          <>
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              editable={!answered}
              onChangeText={setGiven}
              onSubmitEditing={() => submit()}
              placeholder="escreva aqui"
              placeholderTextColor="#7c7590"
              returnKeyType="done"
              style={styles.input}
              value={given}
            />
            {exercise.kind === 'fill' && (
              <Text style={styles.fillPreview}>
                {exercise.before}
                <Text style={styles.fillBlank}>{given || '_______'}</Text>
                {exercise.after}
              </Text>
            )}
          </>
        )}

        {exercise.kind === 'match' && (
          <View style={styles.matchWrap}>
            <View style={styles.matchCol}>
              {pairs.map((pair) => {
                const mine = linked.get(pair.left);
                const selected = matchSel === pair.left;
                return (
                  <Pressable
                    accessibilityRole="button"
                    disabled={answered}
                    key={pair.left}
                    onPress={() => tapMatch('left', pair.left)}
                    style={[styles.chip, selected && styles.chipSel, mine && styles.chipDone]}>
                    <Text style={styles.chipText}>{pair.left}</Text>
                    {mine && <Text style={styles.chipArrow}>→ {mine}</Text>}
                  </Pressable>
                );
              })}
            </View>
            <View style={styles.matchCol}>
              {shuffledRights.map((right) => {
                const owner = [...linked].find(([, v]) => v === right)?.[0];
                return (
                  <Pressable
                    accessibilityRole="button"
                    disabled={answered}
                    key={right}
                    onPress={() => tapMatch('right', right)}
                    style={[styles.chip, styles.chipRight, owner && styles.chipDone]}>
                    <Text style={styles.chipText}>{right}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}
      </Animated.View>

      <Animated.View entering={FadeIn.duration(140)} style={styles.footer}>
        {answered && (
          <View style={[styles.banner, wasRight ? styles.bannerOk : styles.bannerBad]}>
            <Text style={styles.bannerTitle}>{wasRight ? 'Isso aí!' : 'Quase!'}</Text>
            {!wasRight && <Text style={styles.bannerBody}>{showAnswer(exercise)}</Text>}
          </View>
        )}
        <Pressable
          accessibilityRole="button"
          disabled={!answered}
          onPress={() => advance(wasRight)}
          style={[styles.cta, !answered && styles.ctaOff]}>
          <Text style={styles.ctaText}>{answered ? 'Continuar' : 'Verificar'}</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

function textToSpeak(exercise: Exercise) {
  if (exercise.kind === 'translate') return exercise.from;
  if (exercise.kind === 'fill') return `${exercise.before} ${exercise.answer} ${exercise.after}`;
  return '';
}

function showAnswer(exercise: Exercise) {
  switch (exercise.kind) {
    case 'translate':
      return exercise.accept[0];
    case 'fill':
      return exercise.answer;
    case 'choice':
      return exercise.options.find((o) => o.id === exercise.answer)?.text ?? '';
    case 'listen':
      return exercise.speak;
    case 'match':
      return exercise.pairs.map((p) => `${p.left} = ${p.right}`).join(' · ');
  }
}

function renderPrompt(exercise: Exercise, languageName: string, onSpeak: () => void) {
  switch (exercise.kind) {
    case 'choice': {
      const [main, sub] = exercise.prompt.split('|');
      return (
        <View style={styles.promptBox}>
          <Text style={styles.prompt}>{main}</Text>
          {sub ? <Text style={styles.promptSub}>{sub}</Text> : null}
        </View>
      );
    }
    case 'translate':
      return (
        <View style={styles.promptBox}>
          <Text style={styles.promptLabel}>
            {exercise.label ?? `traduza para ${languageName.toLowerCase()}`}
          </Text>
          <Text style={styles.promptBig}>{exercise.from}</Text>
          {exercise.hint && <Text style={styles.promptHint}>{exercise.hint}</Text>}
        </View>
      );
    case 'listen':
      return (
        <View style={styles.promptBox}>
          <Text style={styles.promptLabel}>o que você ouviu?</Text>
          <Pressable accessibilityLabel="Ouvir de novo" onPress={onSpeak} style={styles.speaker}>
            <Text style={styles.speakerIcon}>🔊</Text>
          </Pressable>
        </View>
      );
    case 'fill':
      return (
        <View style={styles.promptBox}>
          <Text style={styles.promptLabel}>complete a frase</Text>
          <Text style={styles.promptBig}>
            {exercise.before}
            <Text style={styles.promptGap}>______</Text>
            {exercise.after}
          </Text>
        </View>
      );
    case 'match':
      return (
        <View style={styles.promptBox}>
          <Text style={styles.promptLabel}>relacione</Text>
          <Text style={styles.promptBig}>{languageName.toLowerCase()} ↔ português</Text>
        </View>
      );
  }
}

const styles = StyleSheet.create({
  root: { backgroundColor: '#12101a', flex: 1, paddingHorizontal: 20 },
  topBar: { alignItems: 'center', flexDirection: 'row', gap: 12 },
  iconBtn: { padding: 6 },
  icon: { color: '#6f6880', fontSize: 18 },
  track: { backgroundColor: '#241f33', borderRadius: 99, flex: 1, height: 12, overflow: 'hidden' },
  fill: { backgroundColor: '#7C5CFF', borderRadius: 99, height: 12 },
  body: { flex: 1, justifyContent: 'center' },
  promptBox: { alignItems: 'center', gap: 12 },
  prompt: { color: '#EDE9FE', fontSize: 24, fontWeight: '700', lineHeight: 32 },
  promptSub: { color: '#9a92ad', fontSize: 15, fontWeight: '600', marginTop: -4, textAlign: 'center' },
  promptLabel: { color: '#7c7590', fontSize: 13, textTransform: 'uppercase', letterSpacing: 1 },
  promptBig: { color: '#fff', fontSize: 28, fontWeight: '700', textAlign: 'center' },
  promptGap: { color: '#7C5CFF' },
  promptHint: { color: '#7c7590', fontSize: 14, textAlign: 'center' },
  speaker: {
    alignItems: 'center',
    backgroundColor: '#241f33',
    borderRadius: 99,
    height: 92,
    justifyContent: 'center',
    width: 92,
  },
  speakerIcon: { fontSize: 38 },
  options: { gap: 10, marginTop: 24 },
  option: { backgroundColor: '#241f33', borderColor: '#3a3350', borderRadius: 14, borderWidth: 2, padding: 16 },
  optionOk: { backgroundColor: '#14361f', borderColor: '#3FB950' },
  optionBad: { backgroundColor: '#3a1620', borderColor: '#F85149' },
  optionDim: { opacity: 0.4 },
  optionText: { color: '#EDE9FE', fontSize: 17, fontWeight: '600' },
  input: {
    backgroundColor: '#241f33',
    borderColor: '#3a3350',
    borderRadius: 14,
    borderWidth: 2,
    color: '#fff',
    fontSize: 18,
    marginTop: 24,
    padding: 16,
  },
  fillPreview: { color: '#7c7590', fontSize: 15, marginTop: 10, textAlign: 'center' },
  fillBlank: { color: '#7C5CFF', fontWeight: '700' },
  matchWrap: { flexDirection: 'row', gap: 10, marginTop: 24 },
  matchCol: { flex: 1, gap: 8 },
  chip: { backgroundColor: '#241f33', borderColor: '#3a3350', borderRadius: 12, borderWidth: 2, gap: 2, padding: 12 },
  chipRight: { alignItems: 'flex-end' },
  chipSel: { borderColor: '#7C5CFF' },
  chipDone: { backgroundColor: '#14361f', borderColor: '#3FB950' },
  chipText: { color: '#EDE9FE', fontSize: 15, fontWeight: '600' },
  chipArrow: { color: '#3FB950', fontSize: 12 },
  footer: { gap: 10 },
  banner: { borderRadius: 14, padding: 14 },
  bannerOk: { backgroundColor: '#14361f' },
  bannerBad: { backgroundColor: '#3a1620' },
  bannerTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  bannerBody: { color: '#c9c2d8', fontSize: 14, marginTop: 4 },
  cta: { backgroundColor: '#7C5CFF', borderRadius: 14, padding: 16 },
  ctaOff: { opacity: 0.35 },
  ctaText: { color: '#fff', fontSize: 17, fontWeight: '700', textAlign: 'center' },
});
