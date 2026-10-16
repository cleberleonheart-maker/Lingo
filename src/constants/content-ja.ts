import type { Unit } from './content';

/**
 * Japonês: os enunciados vão em kana/kanji e as respostas em romaji, porque o
 * campo de texto do exercício é o teclado latin do aparelho.
 */
export const JA: Unit = {
  id: 'ja-u1',
  title: 'はじめての出会い',
  description: 'あいさつ、自己紹介、出身の話。',
  lessons: [
    {
      id: 'ja-u1-l1',
      title: 'あいさつ',
      subtitle: 'ohayou gozaimasu',
      perSession: 10,
      exercises: [
        { kind: 'choice', id: 'e1', prompt: 'Qual destas frases significa "bom dia"?', answer: 'b', options: [{ id: 'a', text: 'こんばんは' }, { id: 'b', text: 'おはようございます' }, { id: 'c', text: 'さようなら' }] },
        { kind: 'translate', label: 'leia em romaji: kana -> teclado', id: 'e2', from: 'こんにちは', accept: ['konnichiwa'] },
        { kind: 'listen', id: 'e3', speak: 'こんばんは', accept: ['konbanwa'] },
        { kind: 'fill', id: 'e4', before: 'ohayou ', after: '!', answer: 'gozaimasu', accept: ['gozaimasu'] },
      ],
      pool: [
        { kind: 'choice', id: 'p1', prompt: 'Qual destas frases significa "bom dia"?', answer: 'b', options: [{ id: 'a', text: 'こんばんは' }, { id: 'b', text: 'おはようございます' }, { id: 'c', text: 'さようなら' }] },
        { kind: 'choice', id: 'p2', prompt: '「こんばんは」はいつ使いますか?|Quando se usa "konbanwa"?', answer: 'b', options: [{ id: 'a', text: '朝 (manhã)' }, { id: 'b', text: '夕方・夜 (noite)' }, { id: 'c', text: 'お昼 (tarde)' }] },
        { kind: 'choice', id: 'p3', prompt: '「ありがとうございます」は何の挨拶?|O que "arigatou gozaimasu" é?', answer: 'c', options: [{ id: 'a', text: 'さようなら (adeus)' }, { id: 'b', text: 'こんにちは (olá)' }, { id: 'c', text: 'ありがとう (obrigado)' }] },
        { kind: 'translate', label: 'leia em romaji: kana -> teclado', id: 'p4', from: 'こんにちは', accept: ['konnichiwa'] },
        { kind: 'translate', label: 'leia em romaji: kana -> teclado', id: 'p5', from: 'おはようございます', accept: ['ohayou gozaimasu', 'ohayougozaimasu'] },
        { kind: 'translate', label: 'leia em romaji: kana -> teclado', id: 'p6', from: 'こんばんは', accept: ['konbanwa'] },
        { kind: 'translate', label: 'leia em romaji: kana -> teclado', id: 'p7', from: 'さようなら', accept: ['sayounara', 'sayonara'] },
        { kind: 'translate', label: 'leia em romaji: kana -> teclado', id: 'p8', from: 'ありがとう', accept: ['arigatou'] },
        { kind: 'fill', id: 'p9', before: 'ohayou ', after: '!', answer: 'gozaimasu', accept: ['gozaimasu'] },
        { kind: 'fill', id: 'p10', before: 'sayou', after: '!', answer: 'nara', accept: ['nara'] },
        { kind: 'listen', id: 'p11', speak: 'こんにちは', accept: ['konnichiwa'] },
        { kind: 'listen', id: 'p12', speak: 'ありがとうございます', accept: ['arigatou gozaimasu', 'arigatougozaimasu'] },
        {
          kind: 'match',
          id: 'p13',
          pairs: [
            { left: 'konnichiwa', right: 'こんにちは' },
            { left: 'sayounara', right: 'さようなら' },
            { left: 'arigatou', right: 'ありがとう' },
            { left: 'ohayou', right: 'おはよう' },
          ],
        },
      ],
    },
    {
      id: 'ja-u1-l2',
      title: 'じこしょうかい',
      subtitle: 'watashi wa…',
      exercises: [
        {
          kind: 'match',
          id: 'e1',
          pairs: [
            { left: 'konnichiwa', right: 'こんにちは' },
            { left: 'watashi wa…', right: 'eu sou…' },
            { left: 'arigatou', right: 'ありがとう' },
            { left: 'nihon', right: 'Japão' },
          ],
        },
        { kind: 'translate', label: 'leia em romaji: kana -> teclado', id: 'e2', from: 'わたしはアナです。', accept: ['watashi wa ana desu'] },
        { kind: 'fill', id: 'e3', before: 'わたしは', after: 'です。', answer: 'ana', accept: ['ana'] },
        { kind: 'choice', id: 'e4', prompt: '「わたし」は何?|O que "watashi" é?', answer: 'a', options: [{ id: 'a', text: '私 (eu)' }, { id: 'b', text: 'あなた (você)' }, { id: 'c', text: 'これ (isto)' }] },
        { kind: 'translate', label: 'leia em romaji: kana -> teclado', id: 'e5', from: 'はじめまして。', accept: ['hajimemashite'] },
        { kind: 'choice', id: 'e6', prompt: '「はじめまして」はいつ使いますか?|Quando se usa "hajimemashite"?', answer: 'b', options: [{ id: 'a', text: '別れのとき (despedida)' }, { id: 'b', text: '出会ったとき (primeiro encontro)' }, { id: 'c', text: '寝るとき (dormir)' }] },
      ],
    },
    {
      id: 'ja-u1-l3',
      title: 'しゅっしん',
      subtitle: 'wa doko kara',
      perSession: 10,
      exercises: [
        { kind: 'fill', id: 'e1', before: 'わたしは', after: 'からです。', answer: 'burajiru', accept: ['burajiru'] },
        { kind: 'choice', id: 'e2', prompt: '「わたしはブラジルからです」は?|O que "watashi wa burajiru kara desu" quer dizer?', answer: 'b', options: [{ id: 'a', text: 'わたしはアナです (me chamo Ana)' }, { id: 'b', text: 'ブラジルから来ました (vim do Brasil)' }, { id: 'c', text: 'ブラジルへ行きます (vou ao Brasil)' }] },
        { kind: 'listen', id: 'e3', speak: 'わたしはブラジルからです', accept: ['watashi wa burajiru kara desu'] },
      ],
      pool: [
        { kind: 'fill', id: 'p1', before: 'わたしは', after: 'からです。', answer: 'burajiru', accept: ['burajiru'] },
        { kind: 'fill', id: 'p2', before: 'わたしは', after: 'にすみます。', answer: 'tokyo', accept: ['tokyo', 'toukyou', 'tokio'] },
        { kind: 'choice', id: 'p3', prompt: '「わたしはブラジルからです」は?|O que "watashi wa burajiru kara desu" quer dizer?', answer: 'b', options: [{ id: 'a', text: 'わたしはアナです (me chamo Ana)' }, { id: 'b', text: 'ブラジルから来ました (vim do Brasil)' }, { id: 'c', text: 'ブラジルへ行きます (vou ao Brasil)' }] },
        { kind: 'choice', id: 'p4', prompt: '出身を聞く質問は?|Qual pergunta pergunta a origem?', answer: 'a', options: [{ id: 'a', text: 'どこから来ますか (de onde você é)' }, { id: 'b', text: 'お元気ですか (como você está)' }, { id: 'c', text: 'いくらですか (quanto custa)' }] },
        { kind: 'choice', id: 'p5', prompt: '「にほんごを話します」は?|O que "nihongo o hanashimasu" quer dizer?', answer: 'c', options: [{ id: 'a', text: 'Sou japonês' }, { id: 'b', text: 'Estou no Japão' }, { id: 'c', text: 'Falo japonês' }] },
        { kind: 'translate', label: 'leia em romaji: kana -> teclado', id: 'p6', from: 'わたしはブラジルから来ます。', accept: ['watashi wa burajiru kara kimasu'] },
        { kind: 'translate', label: 'leia em romaji: kana -> teclado', id: 'p7', from: 'わたしはがくせいです。', accept: ['watashi wa gakusei desu'] },
        { kind: 'translate', label: 'leia em romaji: kana -> teclado', id: 'p8', from: 'にほんごを話します。', accept: ['nihongo o hanashimasu'] },
        { kind: 'listen', id: 'p9', speak: 'わたしはブラジルからです', accept: ['watashi wa burajiru kara desu'] },
        {
          kind: 'match',
          id: 'p10',
          pairs: [
            { left: 'から', right: 'de' },
            { left: 'どこ', right: 'onde' },
            { left: 'わたし', right: 'eu' },
          ],
        },
      ],
    },
  ],
  exam: {
    id: 'ja-u1-exam',
    title: '第1単元の試験',
    exercises: [
      { kind: 'choice', id: 'q1', prompt: '「こんばんは」は?|O que "konbanwa" é?', answer: 'a', options: [{ id: 'a', text: 'こんばんは (boa noite)' }, { id: 'b', text: 'おはよう (bom dia)' }, { id: 'c', text: 'さようなら (adeus)' }] },
      { kind: 'translate', label: 'leia em romaji: kana -> teclado', id: 'q2', from: 'わたしはパウロです。', accept: ['watashi wa pauru desu'] },
      { kind: 'fill', id: 'q3', before: 'わたしは', after: 'からです。', answer: 'burajiru', accept: ['burajiru'] },
      { kind: 'choice', id: 'q4', prompt: '「お元気ですか」への返事は?|Como responde a "o-genki desu ka"?', answer: 'b', options: [{ id: 'a', text: 'わたしはアナです' }, { id: 'b', text: 'はい、げんきです' }, { id: 'c', text: 'ブラジルからです' }] },
      { kind: 'translate', label: 'leia em romaji: kana -> teclado', id: 'q5', from: 'さようなら。', accept: ['sayounara', 'sayonara'] },
    ],
  },
};
