import { Stack } from 'expo-router';

import { AnimatedSplashOverlay } from '@/components/animated-icon';

export default function RootLayout() {
  return (
    <>
      <AnimatedSplashOverlay />
      <Stack
        screenOptions={{
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: '#12101a' },
          headerShown: false,
        }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="lesson/[id]" />
        <Stack.Screen name="exam/[id]" />
        <Stack.Screen name="result" />
      </Stack>
    </>
  );
}
