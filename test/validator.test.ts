import { test } from 'node:test';
import assert from 'node:assert/strict';

import { findContentProblems } from '@/lib/validate-content';

test('nenhum problema de conteúdo nos 6 idiomas', () => {
  const problems = findContentProblems();
  assert.deepEqual(problems, [], `Problemas encontrados:\n${problems.join('\n')}`);
});
