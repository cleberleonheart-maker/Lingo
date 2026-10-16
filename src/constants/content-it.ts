import type { Unit } from './content';

export const IT: Unit = {
  id: 'it-u1',
  title: 'Primi contatti',
  description: 'Salutare, presentarsi e dire da dove si è.',
  lessons: [
    {
      id: 'it-u1-l1',
      title: 'Saluti',
      subtitle: 'ciao, buongiorno',
      perSession: 10,
      exercises: [
        { kind: 'choice', id: 'p1', prompt: 'Como você diz "boa noite" em italiano?', answer: 'c', options: [{ id: 'a', text: 'buongiorno' }, { id: 'b', text: 'buonasera' }, { id: 'c', text: 'buonanotte' }, { id: 'd', text: 'arrivederci' }] },
        { kind: 'choice', id: 'p2', prompt: 'E "adeus"?', answer: 'a', options: [{ id: 'a', text: 'arrivederci' }, { id: 'b', text: 'buongiorno' }, { id: 'c', text: 'per favore' }, { id: 'd', text: 'molte grazie' }] },
        { kind: 'choice', id: 'p3', prompt: 'E "por favor"?', answer: 'b', options: [{ id: 'a', text: 'grazie' }, { id: 'b', text: 'per favore' }, { id: 'c', text: 'arrivederci' }, { id: 'd', text: 'buonanotte' }] },
        { kind: 'translate', id: 'p4', from: 'Oi!', accept: ['ciao'] },
        { kind: 'translate', id: 'p5', from: 'Bom dia.', accept: ['buongiorno'] },
        { kind: 'translate', id: 'p6', from: 'Boa noite.', accept: ['buonanotte'] },
        { kind: 'translate', id: 'p7', from: 'Adeus!', accept: ['arrivederci', 'addio'] },
        { kind: 'translate', id: 'p8', from: 'Obrigado.', accept: ['grazie'] },
        { kind: 'fill', id: 'p9', before: 'Buona ', after: '!', answer: 'notte', accept: ['notte'] },
        { kind: 'fill', id: 'p10', before: 'Buona', after: '!', answer: 'sera', accept: ['sera'] },
        { kind: 'listen', id: 'p11', speak: 'Buongiorno', accept: ['buongiorno'] },
        { kind: 'listen', id: 'p12', speak: 'Arrivederci', accept: ['arrivederci'] },
        {
          kind: 'match',
          id: 'p13',
          pairs: [
            { left: 'Ciao', right: 'Olá' },
            { left: 'Arrivederci', right: 'Adeus' },
            { left: 'Grazie', right: 'Obrigado' },
            { left: 'Per favore', right: 'Por favor' },
          ],
        },
      ],
    },
    {
      id: 'it-u1-l2',
      title: 'Mi chiamo',
      subtitle: 'presentarsi',
      exercises: [
        {
          kind: 'match',
          id: 'e1',
          pairs: [
            { left: 'Ciao', right: 'Olá' },
            { left: 'Mi chiamo…', right: 'Meu nome é…' },
            { left: 'Come stai?', right: 'Como vai?' },
            { left: 'Grazie', right: 'Obrigado' },
          ],
        },
        { kind: 'translate', id: 'e2', from: 'Meu nome é Ana.', accept: ['mi chiamo ana'] },
        { kind: 'fill', id: 'e3', before: 'Mi ', after: ' Ana.', answer: 'chiamo', accept: ['chiamo'] },
        { kind: 'choice', id: 'e4', prompt: 'Qual dos dois completa "___ Ana"?', answer: 'c', options: [{ id: 'a', text: 'Io sono' }, { id: 'b', text: 'Sono mi' }, { id: 'c', text: 'Mi chiamo' }] },
        { kind: 'translate', id: 'e5', from: 'Prazer.', accept: ['piacere'] },
        { kind: 'choice', id: 'e6', prompt: 'O que "Piacere" quer dizer?', answer: 'a', options: [{ id: 'a', text: 'Prazer' }, { id: 'b', text: 'Adeus' }, { id: 'c', text: 'Obrigado' }] },
      ],
    },
    {
      id: 'it-u1-l3',
      title: 'Di dove sei?',
      subtitle: 'paese e lingua',
      perSession: 10,
      exercises: [
        { kind: 'fill', id: 'p1', before: 'Vengo ', after: ' Brasile.', answer: 'dal', accept: ['dal', 'da'] },
        { kind: 'fill', id: 'p2', before: 'Vengo ', after: ' Francia.', answer: 'dalla', accept: ['dalla', 'da'] },
        { kind: 'choice', id: 'p3', prompt: 'Como se pergunta "de onde você é"?', answer: 'a', options: [{ id: 'a', text: 'Di dove sei?' }, { id: 'b', text: 'Come stai?' }, { id: 'c', text: 'Quanto costa?' }] },
        { kind: 'choice', id: 'p4', prompt: 'O que "Parlo italiano" quer dizer?', answer: 'c', options: [{ id: 'a', text: 'Eu sou italiano' }, { id: 'b', text: 'Eu estou na Itália' }, { id: 'c', text: 'Eu falo italiano' }] },
        { kind: 'translate', id: 'p5', from: 'Venho do Brasil.', accept: ['vengo dal brasil'] },
        { kind: 'translate', id: 'p6', from: 'Meu nome é Paolo.', accept: ['mi chiamo paolo'] },
        { kind: 'translate', id: 'p7', from: 'Falo italiano.', accept: ['parlo italiano'] },
        { kind: 'fill', id: 'p8', before: 'Parlo ', after: '.', answer: 'italiano', accept: ['italiano'] },
        { kind: 'listen', id: 'p9', speak: 'Vengo dal Brasile', accept: ['vengo dal brasil'] },
        {
          kind: 'match',
          id: 'p10',
          pairs: [
            { left: 'da', right: 'de' },
            { left: 'dove', right: 'onde' },
            { left: 'io', right: 'eu' },
          ],
        },
        { kind: 'choice', id: 'p11', prompt: 'O que "Vengo dal Brasile" quer dizer?', answer: 'b', options: [{ id: 'a', text: 'Mi chiamo Ana' }, { id: 'b', text: 'Eu venho do Brasil' }, { id: 'c', text: 'Eu vou para o Brasil' }] },
      ],
    },
  ],
  exam: {
    id: 'it-u1-exam',
    title: "Esame dell'unità 1",
    exercises: [
      { kind: 'choice', id: 'q1', prompt: '"Buonanotte" significa…', answer: 'a', options: [{ id: 'a', text: 'boa noite' }, { id: 'b', text: 'bom dia' }, { id: 'c', text: 'adeus' }] },
      { kind: 'translate', id: 'q2', from: 'Meu nome é Paolo.', accept: ['mi chiamo paolo'] },
      { kind: 'fill', id: 'q3', before: 'Vengo ', after: " Italia.", answer: "dall'", accept: ["dall'", 'dall', 'da'] },
      { kind: 'choice', id: 'q4', prompt: 'Como responde a "Come stai?"', answer: 'b', options: [{ id: 'a', text: 'Mi chiamo Ana' }, { id: 'b', text: 'Bene, grazie' }, { id: 'c', text: 'Vengo dal Brasile' }] },
      { kind: 'translate', id: 'q5', from: 'Adeus!', accept: ['arrivederci', 'ciao', 'addio'] },
    ],
  },
};
