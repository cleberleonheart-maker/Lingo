import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';

import { Avatar } from '@/components/avatar';
import { LANGUAGE_LIST, type LanguageId } from '@/constants/languages';

export default function Result() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id: examId = '', correct = '0', total = '0', lang, xp = '0' } = useLocalSearchParams<{ id?: string; correct: string; total: string; lang?: string; xp?: string }>();
  const language: LanguageId = LANGUAGE_LIST.some((l) => l.id === lang) ? (lang as LanguageId) : 'en';

  const got = Number(correct);
  const max = Number(total);
  const pct = max > 0 ? got / max : 0;
  const perfect = got === max;
  const passed = pct >= 0.6;

  return (
    <View style={[styles.root, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}>
      <Animated.View entering={ZoomIn.duration(320)} style={styles.avatarWrap}>
        <Avatar
          asleep={!passed}
          blink={passed}
          language={language}
          size={140}
        />
      </Animated.View>

      <Animated.View entering={FadeIn.delay(180).duration(260)} style={styles.text}>
        <Text style={styles.title}>
          {perfect ? 'Perfeito!' : passed ? 'Muito bem!' : 'Quase lá'}
        </Text>
        <Text style={styles.sub}>
          {got} de {max} · {Math.round(pct * 100)}%
        </Text>
        {Number(xp) > 0 && <Text style={styles.xpChip}>⭐ +{xp} XP</Text>}
        {!passed && <Text style={styles.hint}>Refaça as lições da unidade e tente de novo.</Text>}
      </Animated.View>

      <View style={styles.actions}>
        <Pressable accessibilityRole="button" onPress={() => router.replace({ pathname: '/', params: { lang: language } })} style={styles.primary}>
          <Text style={styles.primaryText}>Voltar ao mapa</Text>
        </Pressable>
        {!passed && (
          <Pressable
            accessibilityRole="button"
            onPress={() => router.replace({ pathname: '/exam/[id]', params: { id: examId } })}
            style={styles.secondary}>
            <Text style={styles.secondaryText}>Tentar de novo</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { backgroundColor: '#12101a', flex: 1, gap: 24, paddingHorizontal: 24 },
  avatarWrap: { alignItems: 'center' },
  text: { alignItems: 'center', gap: 6 },
  title: { color: '#fff', fontSize: 30, fontWeight: '800' },
  sub: { color: '#a79fb8', fontSize: 17 },
  xpChip: { color: '#FFD166', fontSize: 16, fontWeight: '700', marginTop: 4 },
  hint: { color: '#7c7590', fontSize: 14, marginTop: 6, textAlign: 'center' },
  actions: { gap: 10, marginTop: 'auto' },
  primary: { backgroundColor: '#7C5CFF', borderRadius: 16, padding: 17 },
  primaryText: { color: '#fff', fontSize: 17, fontWeight: '700', textAlign: 'center' },
  secondary: { backgroundColor: '#241f33', borderRadius: 16, padding: 17 },
  secondaryText: { color: '#EDE9FE', fontSize: 17, fontWeight: '700', textAlign: 'center' },
});
