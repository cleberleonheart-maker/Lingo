import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import { LANGUAGES, type LanguageId } from '@/constants/languages';

const BOX = 108;
const BLINK_CYCLE = 4200;

/** Expressão do avatar. */
export type AvatarMood = 'idle' | 'sleep' | 'happy' | 'sad';

/** Encolhimento dos olhos (`scaleY`) por humor. `1` = olho aberto. */
const EYE_SQUINT: Record<AvatarMood, number> = {
  idle: 1,
  sleep: 0.12,
  happy: 0.5,
  sad: 1,
};

/**
 * Avatar no mesmo estilo do TAMI: a piscada encolhe o próprio olho com
 * `scaleY`, em vez de desenhar uma pálpebra por cima. É o motivo de aqui não
 * existir o problema de acertar a pálpebra na unha — não há nada para alinhar.
 *
 * Só o humor `idle` pisca: `sleep`, `happy` e `sad` mantêm a expressão parada.
 */
export type AvatarProps = {
  language: LanguageId;
  size?: number;
  blink?: boolean;
  /** Expressão do mascote. `idle` (padrão) pisca; os outros ficam parados. */
  mood?: AvatarMood;
  label?: string;
  style?: StyleProp<ViewStyle>;
};

export function Avatar({
  language,
  size = BOX,
  blink = true,
  mood = 'idle',
  label,
  style,
}: AvatarProps) {
  const lang = LANGUAGES[language];
  const scale = size / BOX;
  const lid = useSharedValue(1);
  const bounce = useSharedValue(0);

  useEffect(() => {
    if (!blink || mood !== 'idle') {
      lid.value = withTiming(EYE_SQUINT[mood], { duration: 140, easing: Easing.out(Easing.quad) });
      return;
    }
    lid.value = 1;
    lid.value = withRepeat(
      withSequence(
        withDelay(BLINK_CYCLE * 0.92, withTiming(0.12, { duration: 60, easing: Easing.in(Easing.quad) })),
        withTiming(1, { duration: 110, easing: Easing.out(Easing.quad) })
      ),
      -1,
      false
    );
  }, [blink, mood, lid]);

  // Um pulinho curto ao comemorar, para o estado `happy` não passar batido.
  useEffect(() => {
    if (mood !== 'happy') return;
    bounce.value = withSequence(
      withTiming(1, { duration: 160, easing: Easing.out(Easing.quad) }),
      withTiming(0, { duration: 240, easing: Easing.out(Easing.quad) })
    );
  }, [bounce, mood]);

  const leftEye = useAnimatedStyle(() => ({ transform: [{ scaleY: lid.value }] }));
  const rightEye = useAnimatedStyle(() => ({ transform: [{ scaleY: lid.value }] }));
  const root = useAnimatedStyle(() => ({ transform: [{ translateY: -6 * scale * bounce.value }] }));

  const closedEyes = mood === 'sleep' || mood === 'happy';
  const frown = mood === 'sad';
  const smileWidth = (mood === 'happy' ? 24 : 20) * scale;

  return (
    <Animated.View
      accessibilityLabel={label ?? `Avatar ${lang.name}`}
      accessibilityRole="image"
      style={[styles.box, { width: size, height: size, borderRadius: size / 2 }, style, root]}>
      <LinearGradient
        colors={lang.sphere as unknown as [string, string, ...string[]]}
        end={{ x: 1, y: 1 }}
        start={{ x: 0.35, y: 0.28 }}
        style={[StyleSheet.absoluteFill, { borderRadius: size / 2 }]}
      />

      <Text
        style={{
          fontSize: 30 * scale,
          position: 'absolute',
          right: 4 * scale,
          top: -8 * scale,
          transform: [{ rotate: '12deg' }],
        }}>
        {lang.accessoryEmoji}
      </Text>

      <Animated.View
        style={[
          styles.eye,
          {
            left: 28 * scale,
            top: 42 * scale,
            width: 13 * scale,
            height: 16 * scale,
            borderRadius: 13 * scale,
            backgroundColor: '#33113A',
          },
          leftEye,
        ]}>
        {!closedEyes && <View style={[styles.glint, { left: 4 * scale, top: 3 * scale, width: 5 * scale, height: 5 * scale, borderRadius: 5 * scale }]} />}
      </Animated.View>

      <Animated.View
        style={[
          styles.eye,
          {
            right: 28 * scale,
            top: 42 * scale,
            width: 13 * scale,
            height: 16 * scale,
            borderRadius: 13 * scale,
            backgroundColor: '#33113A',
          },
          rightEye,
        ]}>
        {!closedEyes && <View style={[styles.glint, { left: 4 * scale, top: 3 * scale, width: 5 * scale, height: 5 * scale, borderRadius: 5 * scale }]} />}
      </Animated.View>

      <View
        style={{
          position: 'absolute',
          left: 16 * scale,
          top: 58 * scale,
          width: 18 * scale,
          height: 10 * scale,
          borderRadius: 18 * scale,
          backgroundColor: lang.blush,
        }}
      />
      <View
        style={{
          position: 'absolute',
          right: 16 * scale,
          top: 58 * scale,
          width: 18 * scale,
          height: 10 * scale,
          borderRadius: 18 * scale,
          backgroundColor: lang.blush,
        }}
      />

      <View
        style={{
          position: 'absolute',
          left: '50%',
          top: (frown ? 62 : 60) * scale,
          marginLeft: -smileWidth / 2,
          width: smileWidth,
          height: (mood === 'happy' ? 11 : 9) * scale,
          borderTopWidth: frown ? 3 * scale : 0,
          borderTopColor: '#33113A',
          borderTopLeftRadius: 14 * scale,
          borderTopRightRadius: 14 * scale,
          borderBottomWidth: frown ? 0 : 3 * scale,
          borderBottomColor: '#33113A',
          borderBottomLeftRadius: 14 * scale,
          borderBottomRightRadius: 14 * scale,
        }}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  box: {
    overflow: 'hidden',
  },
  eye: {
    position: 'absolute',
  },
  glint: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    opacity: 0.95,
  },
});
