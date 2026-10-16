import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  canClaimReward,
  rewardFor,
  REWARD_BASE,
  REWARD_MAX,
  REWARD_PER_STREAK,
} from '@/lib/reward';

test('a recompensa cresce com o streak', () => {
  assert.equal(rewardFor(0), REWARD_BASE);
  assert.equal(rewardFor(1), REWARD_BASE);
  assert.equal(rewardFor(2), REWARD_BASE + REWARD_PER_STREAK);
  assert.equal(rewardFor(3), REWARD_BASE + 2 * REWARD_PER_STREAK);
});

test('a recompensa para no teto', () => {
  assert.equal(rewardFor(1000), REWARD_MAX);
  assert.equal(rewardFor(REWARD_MAX), REWARD_MAX);
});

test('streak negativo (por segurança) vale só a base', () => {
  assert.equal(rewardFor(-5), REWARD_BASE);
});

test('só dá para resgatar depois de estudar no dia', () => {
  assert.equal(canClaimReward({ lastStudied: null, lastReward: null }, '2026-10-16'), false);
  assert.equal(
    canClaimReward({ lastStudied: '2026-10-15', lastReward: null }, '2026-10-16'),
    false
  );
  assert.equal(
    canClaimReward({ lastStudied: '2026-10-16', lastReward: null }, '2026-10-16'),
    true
  );
});

test('não dá para resgatar duas vezes no mesmo dia', () => {
  assert.equal(
    canClaimReward({ lastStudied: '2026-10-16', lastReward: '2026-10-16' }, '2026-10-16'),
    false
  );
});

test('o resgate de ontem libera de novo hoje', () => {
  assert.equal(
    canClaimReward({ lastStudied: '2026-10-16', lastReward: '2026-10-15' }, '2026-10-16'),
    true
  );
});
