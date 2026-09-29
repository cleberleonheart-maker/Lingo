import { NativeTabs } from 'expo-router/unstable-native-tabs';

import { INK } from '@/constants/theme';

export default function AppTabs() {
  return (
    <NativeTabs
      backgroundColor={INK.bg}
      indicatorColor={INK.card}
      labelStyle={{ selected: { color: INK.text } }}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Mapa</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/home.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="languages">
        <NativeTabs.Trigger.Label>Idiomas</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/explore.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
