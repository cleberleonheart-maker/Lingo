import { useEffect, useState } from 'react';
import { AppState, StyleSheet, Text, View } from 'react-native';
import * as Localization from 'expo-localization';

import { INK } from '@/constants/theme';

/** `pt-BR` → `pt`, para o `Intl` escolher o formato certo. */
function baseLanguage() {
  const tag = Localization.getLocales()[0]?.languageTag;
  return tag ? tag.split(/[-_]/)[0] : 'en';
}

function zoneId() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return '';
  }
}

/**
 * Hora local do aparelho, no idioma dele. Atualiza a cada 30s e se corrigindo
 * quando o app volta do background (o timer congela fora da tela).
 */
export function LocalClock({ style }: { style?: object }) {
  const language = baseLanguage();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const tick = setInterval(() => setNow(new Date()), 30_000);
    const resume = AppState.addEventListener('change', (state) => {
      if (state === 'active') setNow(new Date());
    });
    return () => {
      clearInterval(tick);
      resume.remove();
    };
  }, []);

  let time: string;
  try {
    time = new Intl.DateTimeFormat(language, {
      hour: '2-digit',
      minute: '2-digit',
    }).format(now);
  } catch {
    // `Intl` sem ICU (alguns builds Android): cai para o formato manual.
    const hh = `${now.getHours()}`.padStart(2, '0');
    const mm = `${now.getMinutes()}`.padStart(2, '0');
    time = `${hh}:${mm}`;
  }

  const zone = zoneId();

  return (
    <View style={[styles.root, style]}>
      <Text style={styles.time}>{time}</Text>
      {zone ? <Text style={styles.zone}>{zone}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { alignItems: 'flex-end', gap: 1 },
  time: {
    color: INK.text,
    fontSize: 15,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  zone: { color: INK.dim, fontSize: 11 },
});
