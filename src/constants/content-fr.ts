import type { Unit } from './content';

export const FR: Unit = {
  id: 'fr-u1',
  title: 'Premiers contacts',
  description: 'Saluer, se présenter et dire d’où vous venez.',
  lessons: [
    {
      id: 'fr-u1-l1',
      title: 'Salutations',
      subtitle: 'bonjour, bonsoir',
      perSession: 10,
      exercises: [
        { kind: 'choice', id: 'e1', prompt: 'Comment on dit "bonne nuit" ?', answer: 'c', options: [{ id: 'a', text: 'bonjour' }, { id: 'b', text: 'bonne soirée' }, { id: 'c', text: 'bonne nuit' }, { id: 'd', text: 'adieu' }] },
        { kind: 'translate', id: 'e2', from: 'Salut !', to: 'francês', accept: ['salut', 'bonjour', 'coucou'] },
        { kind: 'listen', id: 'e3', speak: 'Bonsoir', accept: ['bonsoir'] },
        { kind: 'fill', id: 'e4', before: 'Bonne ', after: ' !', answer: 'nuit', accept: ['nuit'] },
      ],
      pool: [
        { kind: 'choice', id: 'p1', prompt: 'Comment on dit "bonne nuit" ?', answer: 'c', options: [{ id: 'a', text: 'bonjour' }, { id: 'b', text: 'bonne soirée' }, { id: 'c', text: 'bonne nuit' }, { id: 'd', text: 'adieu' }] },
        { kind: 'choice', id: 'p2', prompt: 'Comment on dit "bonne soirée" ?', answer: 'b', options: [{ id: 'a', text: 'bonne nuit' }, { id: 'b', text: 'bonne soirée' }, { id: 'c', text: 'bonjour' }, { id: 'd', text: 'merci' }] },
        { kind: 'choice', id: 'p3', prompt: 'Comment on dit "au revoir" ?', answer: 'a', options: [{ id: 'a', text: 'au revoir' }, { id: 'b', text: 'bonsoir' }, { id: 'c', text: 'merci' }, { id: 'd', text: "s'il vous plaît" }] },
        { kind: 'translate', id: 'p4', from: 'Bonjour !', to: 'francês', accept: ['bonjour'] },
        { kind: 'translate', id: 'p5', from: 'Bonsoir.', to: 'francês', accept: ['bonsoir'] },
        { kind: 'translate', id: 'p6', from: 'Bonne nuit.', to: 'francês', accept: ['bonne nuit'] },
        { kind: 'translate', id: 'p7', from: 'Au revoir.', to: 'francês', accept: ['au revoir', 'adieu'] },
        { kind: 'translate', id: 'p8', from: 'À bientôt !', to: 'francês', accept: ['à bientôt', 'a bientôt'] },
        { kind: 'fill', id: 'p9', before: 'Bonne ', after: ' !', answer: 'nuit', accept: ['nuit'] },
        { kind: 'fill', id: 'p10', before: 'Bonne ', after: '.', answer: 'soirée', accept: ['soirée', 'soiree'] },
        { kind: 'listen', id: 'p11', speak: 'Bonsoir', accept: ['bonsoir'] },
        { kind: 'listen', id: 'p12', speak: 'Au revoir', accept: ['au revoir'] },
        {
          kind: 'match',
          id: 'p13',
          pairs: [
            { left: 'Bonjour', right: 'Olá' },
            { left: 'Au revoir', right: 'Adeus' },
            { left: 'Merci', right: 'Obrigado' },
            { left: "S'il vous plaît", right: 'Se favor' },
          ],
        },
      ],
    },
    {
      id: 'fr-u1-l2',
      title: "Je m'appelle",
      subtitle: 'se présenter',
      exercises: [
        {
          kind: 'match',
          id: 'e1',
          pairs: [
            { left: 'Bonjour', right: 'Olá' },
            { left: 'Je m’appelle…', right: 'Meu nome é…' },
            { left: 'Comment ça va ?', right: 'Como vai?' },
            { left: 'Merci', right: 'Obrigado' },
          ],
        },
        { kind: 'translate', id: 'e2', from: "Je m'appelle Ana.", to: 'francês', accept: ["je m'appelle ana"] },
        { kind: 'fill', id: 'e3', before: 'Je m', after: ' Ana.', answer: 'appelle', accept: ['appelle'] },
        { kind: 'choice', id: 'e4', prompt: 'Qual dos dois completa "___ Ana" ?', answer: 'b', options: [{ id: 'a', text: 'je suis' }, { id: 'b', text: "je m'appelle" }, { id: 'c', text: "j'ai" }] },
        { kind: 'translate', id: 'e5', from: 'Enchanté !', to: 'francês', accept: ['enchanté', 'enchante'] },
        { kind: 'choice', id: 'e6', prompt: 'O que "Enchanté" quer dizer?', answer: 'a', options: [{ id: 'a', text: 'Prazer' }, { id: 'b', text: 'Adeus' }, { id: 'c', text: 'Obrigado' }] },
      ],
    },
    {
      id: 'fr-u1-l3',
      title: "D'où venez-vous ?",
      subtitle: 'pays et langue',
      perSession: 10,
      exercises: [
        { kind: 'fill', id: 'e1', before: 'Je viens ', after: ' Brésil.', answer: 'du', accept: ['du', 'de'] },
        { kind: 'choice', id: 'e2', prompt: '"Je viens du Brésil" veut dire…', answer: 'b', options: [{ id: 'a', text: "Je m'appelle Ana" }, { id: 'b', text: 'Je viens du Brésil' }, { id: 'c', text: 'Je vais au Brésil' }] },
        { kind: 'listen', id: 'e3', speak: 'Je viens du Brésil', accept: ['je viens du bresil'] },
      ],
      pool: [
        { kind: 'fill', id: 'p1', before: 'Je viens ', after: ' Brésil.', answer: 'du', accept: ['du', 'de'] },
        { kind: 'fill', id: 'p2', before: 'Je viens ', after: ' France.', answer: 'de', accept: ['de', 'du'] },
        { kind: 'choice', id: 'p3', prompt: 'Comment on demande "d’où venez-vous ?"', answer: 'a', options: [{ id: 'a', text: "D'où venez-vous ?" }, { id: 'b', text: 'Comment ça va ?' }, { id: 'c', text: 'Ça coûte combien ?' }] },
        { kind: 'choice', id: 'p4', prompt: 'O que "Je viens du Brésil" quer dizer?', answer: 'b', options: [{ id: 'a', text: 'Eu me chamo Ana' }, { id: 'b', text: 'Eu venho do Brasil' }, { id: 'c', text: 'Eu vou para o Brasil' }] },
        { kind: 'translate', id: 'p5', from: 'Je viens du Brésil.', to: 'francês', accept: ['je viens du bresil'] },
        { kind: 'translate', id: 'p6', from: "Je m'appelle Pierre.", to: 'francês', accept: ["je m'appelle pierre"] },
        { kind: 'translate', id: 'p7', from: 'Je parle français.', to: 'francês', accept: ['je parle français', 'je parle francais'] },
        { kind: 'translate', id: 'p8', from: 'Je viens de France.', to: 'francês', accept: ['je viens de france'] },
        { kind: 'listen', id: 'p9', speak: 'Je viens du Brésil', accept: ['je viens du bresil'] },
        {
          kind: 'match',
          id: 'p10',
          pairs: [
            { left: 'de', right: 'de' },
            { left: 'où', right: 'onde' },
            { left: 'je', right: 'eu' },
          ],
        },
      ],
    },
  ],
  exam: {
    id: 'fr-u1-exam',
    title: "Examen de l'unité 1",
    exercises: [
      { kind: 'choice', id: 'q1', prompt: '"Bonne nuit" signifie…', answer: 'a', options: [{ id: 'a', text: 'boa noite' }, { id: 'b', text: 'bom dia' }, { id: 'c', text: 'adeus' }] },
      { kind: 'translate', id: 'q2', from: "Je m'appelle Paul.", to: 'francês', accept: ["je m'appelle paul"] },
      { kind: 'fill', id: 'q3', before: 'Je viens ', after: ' Paris.', answer: 'de', accept: ['de', 'du'] },
      { kind: 'choice', id: 'q4', prompt: 'Como responde a "Ça va ?"', answer: 'b', options: [{ id: 'a', text: "Je m'appelle Ana" }, { id: 'b', text: 'Ça va bien, merci' }, { id: 'c', text: 'Je viens du Brésil' }] },
      { kind: 'translate', id: 'q5', from: 'Au revoir !', to: 'francês', accept: ['au revoir', 'adieu', 'salut'] },
    ],
  },
};
