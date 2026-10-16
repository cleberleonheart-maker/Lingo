import { Stack } from 'expo-router';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { INK } from '@/constants/theme';

export default function RootLayout() {
  return (
    <>
      <AnimatedSplashOverlay />
      <Stack
        screenOptions={{
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: INK.bg },
          headerShown: false,
        }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="lesson/[id]" />
        <Stack.Screen name="exam/[id]" />
        <Stack.Screen name="review/[id]" />
        <Stack.Screen name="result" />
      </Stack>
    </>
  );
}
