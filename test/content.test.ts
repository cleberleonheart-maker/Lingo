import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  allExercises,
  checkAnswer,
  COURSES,
  drawSession,
  getExam,
  getLesson,
  normalize,
  shuffle,
  type Exercise,
} from '@/constants/content';

function fill(id: string): Exercise {
  return { kind: 'fill', id, before: '', after: '', answer: 'a', accept: ['a'] };
}

test('normalize ignora acento, caixa e pontuação', () => {
  assert.equal(normalize('Olá, Mundo!'), 'olamundo');
  assert.equal(normalize('  Boa   noite  '), 'boanoite');
});

test('shuffle mantém os mesmos itens e o mesmo tamanho', () => {
  const input = [1, 2, 3, 4, 5, 6];
  const out = shuffle(input);
  assert.deepEqual([...out].sort((a, b) => a - b), input);
  assert.notEqual(out, input);
});

test('checkAnswer em translate aceita variações de acento, caixa e espaço', () => {
  const ex: Exercise = { kind: 'translate', id: 't', from: 'x', to: 'y', accept: ['Hola', 'Buenas'] };
  assert.equal(checkAnswer(ex, 'hola'), true);
  assert.equal(checkAnswer(ex, 'HOLA'), true);
  assert.equal(checkAnswer(ex, '  hola '), true);
  assert.equal(checkAnswer(ex, 'tchau'), false);
  assert.equal(checkAnswer(ex, ''), false);
});

test('checkAnswer em choice compara exatamente o id da opção', () => {
  const ex: Exercise = {
    kind: 'choice',
    id: 'c',
    prompt: 'p',
    answer: 'o2',
    options: [
      { id: 'o1', text: 'a' },
      { id: 'o2', text: 'b' },
    ],
  };
  assert.equal(checkAnswer(ex, 'o2'), true);
  assert.equal(checkAnswer(ex, 'b'), false);
  assert.equal(checkAnswer(ex, 'o1'), false);
});

test('checkAnswer em match é sempre falso (avaliado por pares)', () => {
  const ex: Exercise = { kind: 'match', id: 'm', pairs: [{ left: 'a', right: 'b' }] };
  assert.equal(checkAnswer(ex, 'b'), false);
});

test('drawSession respeita perSession e sorteia dentro do pool', () => {
  const pool = Array.from({ length: 12 }, (_, i) => fill(`p${i}`));
  const lesson = { id: 'x', title: '', subtitle: '', exercises: pool.slice(0, 3), pool, perSession: 10 };
  const session = drawSession(lesson);
  assert.equal(session.length, 10);
  assert.ok(session.every((e) => pool.includes(e)));
});

test('drawSession sem pool devolve os exercícios fixos', () => {
  const exercises = [fill('e1')];
  const lesson = { id: 'x', title: '', subtitle: '', exercises };
  assert.deepEqual(drawSession(lesson), exercises);
});

test('allExercises une fixos e pool', () => {
  const lesson = { id: 'x', title: '', subtitle: '', exercises: [fill('e1')], pool: [fill('p1')] };
  assert.deepEqual(
    allExercises(lesson).map((e) => e.id),
    ['e1', 'p1']
  );
});

test('getLesson e getExam acham por id e devolvem undefined quando não existe', () => {
  assert.ok(getLesson('en', 'en-u1-l1'));
  assert.equal(getLesson('en', 'nao-existe'), undefined);
  const exam = getExam('en', 'en-u1-exam');
  assert.ok(exam);
  assert.equal(getExam('en', 'nao-existe'), undefined);
});

test('todo curso tem lições, provas e ids de exercício únicos por lição', () => {
  for (const [language, course] of Object.entries(COURSES)) {
    const lessons = course.units.flatMap((u) => u.lessons);
    assert.ok(lessons.length > 0, `${language} sem lições`);
    for (const unit of course.units) {
      assert.ok(unit.exam.exercises.length > 0, `${unit.exam.id} sem exercícios`);
    }
    for (const lesson of lessons) {
      assert.ok(lesson.exercises.length > 0, `${lesson.id} sem exercícios`);
      const ids = allExercises(lesson).map((e) => e.id);
      assert.equal(new Set(ids).size, ids.length, `${lesson.id} tem ids repetidos`);
    }
  }
});
