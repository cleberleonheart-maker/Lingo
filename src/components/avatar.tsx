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

/**
 * Avatar no mesmo estilo do TAMI: a piscada encolhe o próprio olho com
 * `scaleY`, em vez de desenhar uma pálpebra por cima. É o motivo de aqui não
 * existir o problema de acertar a pálpebra na unha — não há nada para alinhar.
 */
export type AvatarProps = {
  language: LanguageId;
  size?: number;
  blink?: boolean;
  /** Olhos fechados (estado de descanso). */
  asleep?: boolean;
  label?: string;
  style?: StyleProp<ViewStyle>;
};

export function Avatar({
  language,
  size = BOX,
  blink = true,
  asleep = false,
  label,
  style,
}: AvatarProps) {
  const lang = LANGUAGES[language];
  const scale = size / BOX;
  const lid = useSharedValue(1);

  useEffect(() => {
    if (!blink || asleep) {
      lid.value = withTiming(asleep ? 0.12 : 1, { duration: 120 });
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
  }, [asleep, blink, lid]);

  const leftEye = useAnimatedStyle(() => ({ transform: [{ scaleY: lid.value }] }));
  const rightEye = useAnimatedStyle(() => ({ transform: [{ scaleY: lid.value }] }));

  return (
    <View
      accessibilityLabel={label ?? `Avatar ${lang.name}`}
      accessibilityRole="image"
      style={[styles.box, { width: size, height: size, borderRadius: size / 2 }, style]}>
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
        {!asleep && <View style={[styles.glint, { left: 4 * scale, top: 3 * scale, width: 5 * scale, height: 5 * scale, borderRadius: 5 * scale }]} />}
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
        {!asleep && <View style={[styles.glint, { left: 4 * scale, top: 3 * scale, width: 5 * scale, height: 5 * scale, borderRadius: 5 * scale }]} />}
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
          top: 60 * scale,
          marginLeft: -10 * scale,
          width: 20 * scale,
          height: 9 * scale,
          borderBottomWidth: 3 * scale,
          borderBottomColor: '#33113A',
          borderBottomLeftRadius: 14 * scale,
          borderBottomRightRadius: 14 * scale,
        }}
      />
    </View>
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
