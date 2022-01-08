import { mockRandom } from 'jest-mock-random'
import { GetLoot, LootTable } from '../loot-tables-advanced'
import { rnd } from './random-table'

describe('Test using NaN for step to get floating point values', () => {
  const float: LootTable = [
    { id: 'value', min: -5, max: 10.5, step: Number.NaN },
  ]
  const results = [
    10.243946712481323, -0.21740640800691935, 9.168678942339989,
    -2.099336296525789, 5.334806478589146, 2.3555418672637405,
    7.780328109089865, 2.22621099937645, 4.425250465930933, -0.2588591877999029,
  ]
  mockRandom(rnd)
  test.each(results)('returns %p', (result) => {
    const value = GetLoot(float)
    expect(value.length).toBe(1)
    expect(value[0].quantity).toBe(result)
  })
})
