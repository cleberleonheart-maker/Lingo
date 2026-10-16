import { test } from 'node:test';
import assert from 'node:assert/strict';

import type { Exercise } from '@/constants/content';
import {
  isAnswerCorrect,
  isMatchComplete,
  linkPair,
  loseHeart,
  MAX_HEARTS,
  nextStep,
} from '@/lib/quiz';

const choice: Exercise = {
  kind: 'choice',
  id: 'c',
  prompt: 'p',
  answer: 'b',
  options: [
    { id: 'a', text: 'x' },
    { id: 'b', text: 'y' },
  ],
};

const match: Exercise = {
  kind: 'match',
  id: 'm',
  pairs: [
    { left: 'Hello', right: 'Olá' },
    { left: 'Bye', right: 'Tchau' },
  ],
};

test('isAnswerCorrect usa checkAnswer fora do match', () => {
  assert.equal(isAnswerCorrect(choice, 'b', null), true);
  assert.equal(isAnswerCorrect(choice, 'a', null), false);
});

test('isAnswerCorrect em match só acerta com todos os pares certos', () => {
  const allRight = new Map([
    ['Hello', 'Olá'],
    ['Bye', 'Tchau'],
  ]);
  const oneWrong = new Map([
    ['Hello', 'Tchau'],
    ['Bye', 'Olá'],
  ]);
  assert.equal(isAnswerCorrect(match, '', null), false);
  assert.equal(isAnswerCorrect(match, '', allRight), true);
  assert.equal(isAnswerCorrect(match, '', oneWrong), false);
});

test('linkPair desfaz a ligação anterior do mesmo item da direita', () => {
  let linked = linkPair(new Map(), 'Hello', 'Olá');
  linked = linkPair(linked, 'Bye', 'Olá');
  assert.equal(linked.get('Hello'), undefined);
  assert.equal(linked.get('Bye'), 'Olá');
});

test('isMatchComplete só quando todos os pares foram ligados', () => {
  const linked = linkPair(new Map(), 'Hello', 'Olá');
  assert.equal(isMatchComplete(match as Exercise & { kind: 'match' }, linked), false);
  const full = linkPair(linked, 'Bye', 'Tchau');
  assert.equal(isMatchComplete(match as Exercise & { kind: 'match' }, full), true);
});

test('loseHeart desconta e sinaliza morte ao zerar', () => {
  assert.deepEqual(loseHeart(MAX_HEARTS), { hearts: 2, dead: false });
  assert.deepEqual(loseHeart(2), { hearts: 1, dead: false });
  assert.deepEqual(loseHeart(1), { hearts: 0, dead: true });
  assert.deepEqual(loseHeart(0), { hearts: 0, dead: true });
});

test('nextStep avança no meio e encerra com o placar na última', () => {
  assert.deepEqual(nextStep(0, 3, 0, true), { finished: false, index: 1, correct: 1 });
  assert.deepEqual(nextStep(0, 3, 0, false), { finished: false, index: 1, correct: 0 });
  assert.deepEqual(nextStep(2, 3, 1, true), { finished: true, correct: 2, total: 3 });
  assert.deepEqual(nextStep(2, 3, 1, false), { finished: true, correct: 1, total: 3 });
});

test('nextStep num só exercício encerra de imediato', () => {
  assert.deepEqual(nextStep(0, 1, 0, true), { finished: true, correct: 1, total: 1 });
});
