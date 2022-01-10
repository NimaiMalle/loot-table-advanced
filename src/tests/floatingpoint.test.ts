import { mockRandom, resetMockRandom } from 'jest-mock-random'
import { GetLoot, LootTable } from '../loot-tables-advanced'
import { rnd } from './random-table'

mockRandom(rnd)

test('Test using NaN for step to get floating point values', () => {
  const float: LootTable = [
    { id: 'value', min: -5, max: 10.5, step: Number.NaN },
  ]
  const value = GetLoot(float)
  expect(value.length).toBe(1)
  expect(value[0].quantity).toBe(10.243946712481323)
})
