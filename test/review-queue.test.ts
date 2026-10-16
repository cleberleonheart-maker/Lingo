import assert from 'node:assert/strict';
import { test } from 'node:test';

import { COURSES } from '@/constants/content';
import { reviewKey, type Review } from '@/lib/review';
import { dueItems } from '@/lib/review-queue';

const NOW = 1_700_000_000_000;

const firstLesson = COURSES.en.units[0].lessons[0];
const firstExercise = firstLesson.exercises[0];
const exam = COURSES.en.units[0].exam;

test('dueItems devolve o item vencido com o container de origem', () => {
  const reviews: Record<string, Review> = {
    [reviewKey(firstLesson.id, firstExercise.id)]: { step: 0, due: NOW - 1 },
  };
  const items = dueItems('en', reviews, NOW);
  assert.equal(items.length, 1);
  assert.equal(items[0].containerId, firstLesson.id);
  assert.equal(items[0].exercise.id, firstExercise.id);
});

test('dueItems ignora revisão futura e revisão inexistente', () => {
  const future: Record<string, Review> = {
    [reviewKey(firstLesson.id, firstExercise.id)]: { step: 1, due: NOW + 1 },
  };
  assert.deepEqual(dueItems('en', future, NOW), []);
  assert.deepEqual(dueItems('en', {}, NOW), []);
});

test('dueItems inclui exercícios da prova (container é a prova)', () => {
  const reviews: Record<string, Review> = {
    [reviewKey(exam.id, exam.exercises[0].id)]: { step: 0, due: NOW },
  };
  const items = dueItems('en', reviews, NOW);
  assert.equal(items.length, 1);
  assert.equal(items[0].containerId, exam.id);
});

test('dueItems só olha o idioma pedido', () => {
  const reviews: Record<string, Review> = {
    [reviewKey(firstLesson.id, firstExercise.id)]: { step: 0, due: NOW },
  };
  assert.equal(dueItems('fr', reviews, NOW).length, 0);
  assert.equal(dueItems('en', reviews, NOW).length, 1);
});
