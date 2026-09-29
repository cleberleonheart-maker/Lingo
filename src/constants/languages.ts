export type LanguageId = 'en' | 'es' | 'fr' | 'de' | 'it' | 'ja';

export type Language = {
  id: LanguageId;
  name: string;
  flag: string;
  /** Paleta do avatar: gradiente da cabeça, nas posições 35% 28% / 48% / 100%. */
  sphere: readonly [string, string, string];
  /** Cor do laço / adereço. */
  accessory: string;
  /** Emoji do adereço, desenhado no lugar do path. */
  accessoryEmoji: string;
  /** Cor da bochecha. */
  blush: string;
  /** Rosto visto de trás (usado no resumo). */
  tint: string;
};

export const LANGUAGES: Record<LanguageId, Language> = {
  en: {
    id: 'en',
    name: 'Inglês',
    flag: '🇬🇧',
    sphere: ['#FFE3F2', '#FF8AD0', '#B388FF'],
    accessory: '#FF6EC7',
    accessoryEmoji: '🎀',
    blush: 'rgba(255,55,140,0.55)',
    tint: '#F3E8FF',
  },
  es: {
    id: 'es',
    name: 'Espanhol',
    flag: '🇪🇸',
    sphere: ['#E3F2FF', '#81D4FA', '#4FC3F7'],
    accessory: '#FF9E40',
    accessoryEmoji: '🧢',
    blush: 'rgba(255,150,64,0.45)',
    tint: '#E1F5FE',
  },
  fr: {
    id: 'fr',
    name: 'Francês',
    flag: '🇫🇷',
    sphere: ['#FFF7CE', '#F1FFB8', '#C91F36'],
    accessory: '#B6FF2E',
    accessoryEmoji: '🎩',
    blush: 'rgba(255,90,120,0.5)',
    tint: '#FFFDE7',
  },
  de: {
    id: 'de',
    name: 'Alemão',
    flag: '🇩🇪',
    sphere: ['#E8F6FF', '#6FA9F0', '#7AB51F'],
    accessory: '#B6FF2E',
    accessoryEmoji: '🎓',
    blush: 'rgba(168,230,42,0.35)',
    tint: '#E3F2FD',
  },
  it: {
    id: 'it',
    name: 'Italiano',
    flag: '🇮🇹',
    sphere: ['#D7F9EF', '#67E8F9', '#0E7490'],
    accessory: '#22D3EE',
    accessoryEmoji: '🍕',
    blush: 'rgba(34,211,238,0.4)',
    tint: '#ECFDF5',
  },
  ja: {
    id: 'ja',
    name: 'Japonês',
    flag: '🇯🇵',
    sphere: ['#FFE4E6', '#FDA4AF', '#9F1239'],
    accessory: '#ECFEFF',
    accessoryEmoji: '🌸',
    blush: 'rgba(253,164,175,0.5)',
    tint: '#FFF1F2',
  },
};

export const LANGUAGE_LIST: Language[] = Object.values(LANGUAGES);

export function isLanguageId(value: string): value is LanguageId {
  return value in LANGUAGES;
}
