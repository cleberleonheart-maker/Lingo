import { test } from 'node:test';
import assert from 'node:assert/strict';

import { applyAnswer, isDueAt, REVIEW_STEPS, type Review } from '@/lib/review';

const NOW = 1_000_000;

test('errar cria revisão no passo 0 (volta em 5 min)', () => {
  const reviews = applyAnswer({}, 'k', false, NOW);
  assert.deepEqual(reviews.k, { step: 0, due: NOW + REVIEW_STEPS[0] });
});

test('o primeiro acerto entra na fila (passo 1, revisa em 1 dia)', () => {
  const reviews = applyAnswer({}, 'k', true, NOW);
  assert.deepEqual(reviews.k, { step: 1, due: NOW + REVIEW_STEPS[1] });
});

test('acertar depois de errar avança do passo 0 para o 1', () => {
  const wrong = applyAnswer({}, 'k', false, NOW);
  const right = applyAnswer(wrong, 'k', true, NOW);
  assert.deepEqual(right.k, { step: 1, due: NOW + REVIEW_STEPS[1] });
});

test('acertos seguidos avançam até o item sair da fila', () => {
  let reviews = applyAnswer({}, 'k', true, NOW); // passo 1
  reviews = applyAnswer(reviews, 'k', true, NOW); // passo 2
  assert.deepEqual(reviews.k, { step: 2, due: NOW + REVIEW_STEPS[2] });
  reviews = applyAnswer(reviews, 'k', true, NOW); // passou do último -> sai
  assert.equal(reviews.k, undefined);
});

test('errar de novo reinicia para o passo 0', () => {
  let reviews = applyAnswer({}, 'k', true, NOW); // passo 1
  reviews = applyAnswer(reviews, 'k', false, NOW);
  assert.deepEqual(reviews.k, { step: 0, due: NOW + REVIEW_STEPS[0] });
});

test('applyAnswer não altera o objeto de revisões original', () => {
  const original: Record<string, Review> = { k: { step: 1, due: NOW } };
  const next = applyAnswer(original, 'k', false, NOW);
  assert.notEqual(next, original);
  assert.deepEqual(original.k, { step: 1, due: NOW });
});

test('isDueAt respeita o vencimento', () => {
  assert.equal(isDueAt(undefined, NOW), false);
  assert.equal(isDueAt({ step: 0, due: NOW }, NOW), true);
  assert.equal(isDueAt({ step: 0, due: NOW - 1 }, NOW), true);
  assert.equal(isDueAt({ step: 0, due: NOW + 1 }, NOW), false);
});
