import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar } from '@/components/avatar';
import { COURSES } from '@/constants/content';
import { LANGUAGES, LANGUAGE_LIST } from '@/constants/languages';

export default function Languages() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      contentContainerStyle={[styles.root, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 32 }]}
      style={styles.bg}>
      <Text style={styles.title}>Idiomas</Text>
      <Text style={styles.sub}>Escolha com quem você quer estudar.</Text>

      {LANGUAGE_LIST.map((lang) => {
        const lessons = COURSES[lang.id].units.reduce((n, u) => n + u.lessons.length, 0);
        return (
          <Pressable
            accessibilityRole="button"
            key={lang.id}
            onPress={() => router.push('/')}
            style={styles.row}>
            <Avatar blink={false} language={lang.id} size={64} />
            <View style={styles.rowText}>
              <Text style={styles.name}>
                {lang.flag} {lang.name}
              </Text>
              <Text style={styles.count}>
                {lessons > 0 ? `${lessons} liç${lessons > 1 ? 'ões' : 'ão'}` : 'em breve'}
              </Text>
            </View>
            <Text style={styles.chev}>›</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  bg: { backgroundColor: '#12101a', flex: 1 },
  root: { gap: 12, paddingHorizontal: 20 },
  title: { color: '#fff', fontSize: 30, fontWeight: '800' },
  sub: { color: '#a79fb8', fontSize: 15, marginBottom: 6, marginTop: -8 },
  row: { alignItems: 'center', backgroundColor: '#1c1927', borderRadius: 18, flexDirection: 'row', gap: 14, padding: 14 },
  rowText: { flex: 1, gap: 2 },
  name: { color: '#EDE9FE', fontSize: 17, fontWeight: '700' },
  count: { color: '#7c7590', fontSize: 13 },
  chev: { color: '#7c7590', fontSize: 26 },
});
