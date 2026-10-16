import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Speech from 'expo-speech';
import Animated, { FadeIn } from 'react-native-reanimated';

import { shuffle, type Exercise } from '@/constants/content';
import { LANGUAGES, type LanguageId } from '@/constants/languages';
import { INK } from '@/constants/theme';
import {
  isAnswerCorrect,
  isMatchComplete,
  linkPair,
  loseHeart,
  MAX_HEARTS,
  nextStep,
} from '@/lib/quiz';

import { Avatar } from './avatar';

type Props = {
  language: LanguageId;
  exercises: Exercise[];
  onFinish: (score: { correct: number; total: number }) => void;
  /** Botao de sair: abandona a licao sem conta-la como concluida. */
  onExit: () => void;
  /** Resultado de cada exercício, para a repetição espaçada. */
  onResult?: (exerciseId: string, correct: boolean) => void;
};

export function ExercisePlayer({ language, exercises, onFinish, onExit, onResult }: Props) {
  const insets = useSafeAreaInsets();
  const [index, setIndex] = useState(0);
  const [given, setGiven] = useState('');
  const [picked, setPicked] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [matchSel, setMatchSel] = useState<string | null>(null);
  const [linked, setLinked] = useState<Map<string, string>>(new Map());
  const [hearts, setHearts] = useState(MAX_HEARTS);
  const [dead, setDead] = useState(false);

  const exercise = exercises[index];
  const lang = LANGUAGES[language];
  const total = exercises.length;
  const progress = (index + (done ? 1 : 0)) / total;

  // A coluna da direita vai embaralhada, senão a resposta fica óbvia.
  const shuffledRights = useMemo(() => {
    if (exercise.kind !== 'match') return [];
    return shuffle(exercise.pairs.map((p) => p.right));
  }, [exercise]);

  const pairs = exercise.kind === 'match' ? exercise.pairs : [];

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

  function loseAHeart() {
    const next = loseHeart(hearts);
    setHearts(next.hearts);
    if (next.dead) setDead(true);
  }

  function advance(wasCorrect: boolean) {
    const step = nextStep(index, total, correctCount, wasCorrect);
    if (step.finished) {
      onFinish({ correct: step.correct, total });
      return;
    }
    if (wasCorrect) setCorrectCount(step.correct);
    setIndex(step.index);
    reset();
  }

  function submit(raw?: string) {
    if (done || dead) return;
    const value = raw ?? picked ?? given;
    if (exercise.kind === 'match') {
      const ok = isAnswerCorrect(exercise, '', linked);
      setDone(true);
      onResult?.(exercise.id, ok);
      if (ok) Speech.stop();
      else loseAHeart();
      return;
    }
    if (!value) return;
    const ok = isAnswerCorrect(exercise, value, null);
    setDone(true);
    onResult?.(exercise.id, ok);
    if (ok) Speech.stop();
    else loseAHeart();
  }

  function tapMatch(side: 'left' | 'right', value: string) {
    if (done || dead) return;
    if (side === 'left') {
      setMatchSel(value);
      return;
    }
    if (!matchSel) return;
    const next = linkPair(linked, matchSel, value);
    setLinked(next);
    setMatchSel(null);
    if (isMatchComplete(exercise as Exercise & { kind: 'match' }, next)) {
      const ok = isAnswerCorrect(exercise, '', next);
      setDone(true);
      onResult?.(exercise.id, ok);
      if (ok) Speech.stop();
      else loseAHeart();
    }
  }

  const answered = done;
  const wasRight = answered && isAnswerCorrect(exercise, picked ?? given, linked);

  return (
    <View style={[styles.root, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 12 }]}>
      <View style={styles.topBar}>
        <Pressable accessibilityLabel="Sair" onPress={onExit} style={styles.iconBtn}>
          <Text style={styles.icon}>✕</Text>
        </Pressable>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${Math.min(100, progress * 100)}%` }]} />
        </View>
        <Text style={styles.hearts}>{`❤️ ${hearts}`}</Text>
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
              placeholderTextColor={INK.dim}
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
        {dead ? (
          <View style={[styles.banner, styles.bannerBad]}>
            <Text style={styles.bannerTitle}>Acabaram as vidas 💔</Text>
            <Text style={styles.bannerBody}>Volte mais tarde e refaça esta lição.</Text>
          </View>
        ) : (
          answered && (
            <View style={[styles.banner, wasRight ? styles.bannerOk : styles.bannerBad]}>
              <Text style={styles.bannerTitle}>{wasRight ? 'Isso aí!' : 'Quase!'}</Text>
              {!wasRight && <Text style={styles.bannerBody}>{showAnswer(exercise)}</Text>}
            </View>
          )
        )}
        <Pressable
          accessibilityRole="button"
          disabled={!answered && !dead}
          onPress={() => (dead ? onExit() : advance(wasRight))}
          style={[styles.cta, !answered && !dead && styles.ctaOff]}>
          <Text style={styles.ctaText}>{dead ? 'Voltar ao mapa' : answered ? 'Continuar' : 'Verificar'}</Text>
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
  root: { backgroundColor: INK.bg, flex: 1, paddingHorizontal: 20 },
  topBar: { alignItems: 'center', flexDirection: 'row', gap: 12 },
  iconBtn: { padding: 6 },
  icon: { color: '#6f6880', fontSize: 18 },
  track: { backgroundColor: INK.cardAlt, borderRadius: 99, flex: 1, height: 12, overflow: 'hidden' },
  fill: { backgroundColor: INK.violet, borderRadius: 99, height: 12 },
  hearts: { color: INK.white, fontSize: 15, fontWeight: '700' },
  body: { flex: 1, justifyContent: 'center' },
  promptBox: { alignItems: 'center', gap: 12 },
  prompt: { color: INK.text, fontSize: 24, fontWeight: '700', lineHeight: 32 },
  promptSub: { color: '#9a92ad', fontSize: 15, fontWeight: '600', marginTop: -4, textAlign: 'center' },
  promptLabel: { color: INK.dim, fontSize: 13, textTransform: 'uppercase', letterSpacing: 1 },
  promptBig: { color: INK.white, fontSize: 28, fontWeight: '700', textAlign: 'center' },
  promptGap: { color: INK.violet },
  promptHint: { color: INK.dim, fontSize: 14, textAlign: 'center' },
  speaker: {
    alignItems: 'center',
    backgroundColor: INK.cardAlt,
    borderRadius: 99,
    height: 92,
    justifyContent: 'center',
    width: 92,
  },
  speakerIcon: { fontSize: 38 },
  options: { gap: 10, marginTop: 24 },
  option: { backgroundColor: INK.cardAlt, borderColor: INK.borderStrong, borderRadius: 14, borderWidth: 2, padding: 16 },
  optionOk: { backgroundColor: INK.okBg, borderColor: INK.ok },
  optionBad: { backgroundColor: INK.badBg, borderColor: INK.bad },
  optionDim: { opacity: 0.4 },
  optionText: { color: INK.text, fontSize: 17, fontWeight: '600' },
  input: {
    backgroundColor: INK.cardAlt,
    borderColor: INK.borderStrong,
    borderRadius: 14,
    borderWidth: 2,
    color: INK.white,
    fontSize: 18,
    marginTop: 24,
    padding: 16,
  },
  fillPreview: { color: INK.dim, fontSize: 15, marginTop: 10, textAlign: 'center' },
  fillBlank: { color: INK.violet, fontWeight: '700' },
  matchWrap: { flexDirection: 'row', gap: 10, marginTop: 24 },
  matchCol: { flex: 1, gap: 8 },
  chip: { backgroundColor: INK.cardAlt, borderColor: INK.borderStrong, borderRadius: 12, borderWidth: 2, gap: 2, padding: 12 },
  chipRight: { alignItems: 'flex-end' },
  chipSel: { borderColor: INK.violet },
  chipDone: { backgroundColor: INK.okBg, borderColor: INK.ok },
  chipText: { color: INK.text, fontSize: 15, fontWeight: '600' },
  chipArrow: { color: INK.ok, fontSize: 12 },
  footer: { gap: 10 },
  banner: { borderRadius: 14, padding: 14 },
  bannerOk: { backgroundColor: INK.okBg },
  bannerBad: { backgroundColor: INK.badBg },
  bannerTitle: { color: INK.white, fontSize: 16, fontWeight: '700' },
  bannerBody: { color: '#c9c2d8', fontSize: 14, marginTop: 4 },
  cta: { backgroundColor: INK.violet, borderRadius: 14, padding: 16 },
  ctaOff: { opacity: 0.35 },
  ctaText: { color: INK.white, fontSize: 17, fontWeight: '700', textAlign: 'center' },
});
