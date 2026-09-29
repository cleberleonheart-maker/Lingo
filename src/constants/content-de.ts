import type { Unit } from './content';

export const DE: Unit = {
  id: 'de-u1',
  title: 'Erste Kontakte',
  description: 'Grüßen, sich vorstellen und sagen, woher man kommt.',
  lessons: [
    {
      id: 'de-u1-l1',
      title: 'Begrüßungen',
      subtitle: 'hallo, guten tag',
      perSession: 10,
      exercises: [
        { kind: 'choice', id: 'e1', prompt: 'Wie sagt man "gute Nacht"?', answer: 'c', options: [{ id: 'a', text: 'guten Morgen' }, { id: 'b', text: 'guten Tag' }, { id: 'c', text: 'gute Nacht' }, { id: 'd', text: 'tschüss' }] },
        { kind: 'translate', id: 'e2', from: 'Oi!', to: 'alemão', accept: ['hallo', 'hi'] },
        { kind: 'listen', id: 'e3', speak: 'Guten Tag', accept: ['guten tag'] },
        { kind: 'fill', id: 'e4', before: 'Gute ', after: '!', answer: 'Nacht', accept: ['Nacht', 'nacht'] },
      ],
      pool: [
        { kind: 'choice', id: 'p1', prompt: 'Wie sagt man "gute Nacht"?', answer: 'c', options: [{ id: 'a', text: 'guten Morgen' }, { id: 'b', text: 'guten Tag' }, { id: 'c', text: 'gute Nacht' }, { id: 'd', text: 'tschüss' }] },
        { kind: 'choice', id: 'p2', prompt: 'Wie sagt man "auf Wiedersehen"?', answer: 'a', options: [{ id: 'a', text: 'auf Wiedersehen' }, { id: 'b', text: 'guten Morgen' }, { id: 'c', text: 'bitte' }, { id: 'd', text: 'vielen Dank' }] },
        { kind: 'choice', id: 'p3', prompt: 'Wie sagt man "vielen Dank"?', answer: 'b', options: [{ id: 'a', text: 'danke schön' }, { id: 'b', text: 'vielen Dank' }, { id: 'c', text: 'bitte' }, { id: 'd', text: 'gute Nacht' }] },
        { kind: 'translate', id: 'p4', from: 'Oi!', to: 'alemão', accept: ['hallo', 'hi'] },
        { kind: 'translate', id: 'p5', from: 'Bom dia.', to: 'alemão', accept: ['guten tag'] },
        { kind: 'translate', id: 'p6', from: 'Boa noite.', to: 'alemão', accept: ['gute nacht'] },
        { kind: 'translate', id: 'p7', from: 'Adeus!', to: 'alemão', accept: ['auf wiedersehen'] },
        { kind: 'translate', id: 'p8', from: 'Tchau!', to: 'alemão', accept: ['tschüss', 'tschuss'] },
        { kind: 'fill', id: 'p9', before: 'Gute ', after: '!', answer: 'Nacht', accept: ['Nacht', 'nacht'] },
        { kind: 'fill', id: 'p10', before: 'Guten ', after: '!', answer: 'Morgen', accept: ['Morgen', 'morgen'] },
        { kind: 'listen', id: 'p11', speak: 'Guten Tag', accept: ['guten tag'] },
        { kind: 'listen', id: 'p12', speak: 'Auf Wiedersehen', accept: ['auf wiedersehen'] },
        {
          kind: 'match',
          id: 'p13',
          pairs: [
            { left: 'Hallo', right: 'Olá' },
            { left: 'Tschüss', right: 'Tchau' },
            { left: 'Danke', right: 'Obrigado' },
            { left: 'Bitte', right: 'Se favor' },
          ],
        },
      ],
    },
    {
      id: 'de-u1-l2',
      title: 'Ich heiße',
      subtitle: 'sich vorstellen',
      exercises: [
        {
          kind: 'match',
          id: 'e1',
          pairs: [
            { left: 'Hallo', right: 'Olá' },
            { left: 'Ich heiße…', right: 'Meu nome é…' },
            { left: 'Wie geht es dir?', right: 'Como vai?' },
            { left: 'Danke', right: 'Obrigado' },
          ],
        },
        { kind: 'translate', id: 'e2', from: 'Meu nome é Ana.', to: 'alemão', accept: ['ich heiße ana', 'ich heisse ana'] },
        { kind: 'fill', id: 'e3', before: 'Ich ', after: ' Ana.', answer: 'heiße', accept: ['heiße', 'heisse'] },
        { kind: 'choice', id: 'e4', prompt: 'Qual dos dois completa "___ Ana"?', answer: 'c', options: [{ id: 'a', text: 'Ich bin' }, { id: 'b', text: 'Ana ist' }, { id: 'c', text: 'Ich heiße' }] },
        { kind: 'translate', id: 'e5', from: 'Prazer em conhecê-lo.', to: 'alemão', accept: ['freut mich', 'freut'] },
        { kind: 'choice', id: 'e6', prompt: 'O que "Freut mich" quer dizer?', answer: 'a', options: [{ id: 'a', text: 'Prazer' }, { id: 'b', text: 'Adeus' }, { id: 'c', text: 'Obrigado' }] },
      ],
    },
    {
      id: 'de-u1-l3',
      title: 'Woher kommst du?',
      subtitle: 'Land und Sprache',
      perSession: 10,
      exercises: [
        { kind: 'fill', id: 'e1', before: 'Ich komme ', after: ' Deutschland.', answer: 'aus', accept: ['aus'] },
        { kind: 'choice', id: 'e2', prompt: 'O que "Ich komme aus Brasilien" quer dizer?', answer: 'b', options: [{ id: 'a', text: 'Ich heiße Ana' }, { id: 'b', text: 'Eu venho do Brasil' }, { id: 'c', text: 'Eu vou para o Brasil' }] },
        { kind: 'listen', id: 'e3', speak: 'Ich komme aus Brasilien', accept: ['ich komme aus brasilien'] },
      ],
      pool: [
        { kind: 'fill', id: 'p1', before: 'Ich komme ', after: ' Deutschland.', answer: 'aus', accept: ['aus'] },
        { kind: 'fill', id: 'p2', before: 'Ich komme aus ', after: '.', answer: 'Deutschland', accept: ['deutschland'] },
        { kind: 'choice', id: 'p3', prompt: 'Wie fragt man "woher kommst du?"', answer: 'a', options: [{ id: 'a', text: 'Woher kommst du?' }, { id: 'b', text: 'Wie geht es dir?' }, { id: 'c', text: 'Was kostet das?' }] },
        { kind: 'choice', id: 'p4', prompt: 'O que "Ich spreche Deutsch" quer dizer?', answer: 'c', options: [{ id: 'a', text: 'Eu sou alemão' }, { id: 'b', text: 'Eu estou na Alemanha' }, { id: 'c', text: 'Eu falo alemão' }] },
        { kind: 'translate', id: 'p5', from: 'Venho do Brasil.', to: 'alemão', accept: ['ich komme aus brasilien'] },
        { kind: 'translate', id: 'p6', from: 'Meu nome é Peter.', to: 'alemão', accept: ['ich heiße peter', 'ich heisse peter'] },
        { kind: 'translate', id: 'p7', from: 'Falo alemão.', to: 'alemão', accept: ['ich spreche deutsch'] },
        { kind: 'fill', id: 'p8', before: 'Ich spreche ', after: '.', answer: 'Deutsch', accept: ['Deutsch', 'deutsch'] },
        { kind: 'listen', id: 'p9', speak: 'Ich komme aus Brasilien', accept: ['ich komme aus brasilien'] },
        {
          kind: 'match',
          id: 'p10',
          pairs: [
            { left: 'aus', right: 'de' },
            { left: 'woher', right: 'de onde' },
            { left: 'ich', right: 'eu' },
          ],
        },
      ],
    },
  ],
  exam: {
    id: 'de-u1-exam',
    title: 'Prüfung der Einheit 1',
    exercises: [
      { kind: 'choice', id: 'q1', prompt: '"Gute Nacht" bedeutet…', answer: 'a', options: [{ id: 'a', text: 'boa noite' }, { id: 'b', text: 'bom dia' }, { id: 'c', text: 'adeus' }] },
      { kind: 'translate', id: 'q2', from: 'Meu nome é Paul.', to: 'alemão', accept: ['ich heiße paul', 'ich heisse paul'] },
      { kind: 'fill', id: 'q3', before: 'Ich komme ', after: ' Berlin.', answer: 'aus', accept: ['aus'] },
      { kind: 'choice', id: 'q4', prompt: 'Como responde a "Wie geht es dir?"', answer: 'b', options: [{ id: 'a', text: 'Ich heiße Ana' }, { id: 'b', text: 'Gut, danke' }, { id: 'c', text: 'Ich komme aus Brasilien' }] },
      { kind: 'translate', id: 'q5', from: 'Adeus!', to: 'alemão', accept: ['auf wiedersehen', 'tschüss', 'tschuss'] },
    ],
  },
};
