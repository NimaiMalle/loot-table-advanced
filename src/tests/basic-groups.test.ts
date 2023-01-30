import { mockRandomForEach } from 'jest-mock-random'
import {
  GetLoot,
  Loot,
  LootTable,
  LootTableEntry,
} from '../loot-tables-advanced'
import { rnd } from './random-table'

mockRandomForEach(rnd)

test('Basic groups test', () => {
  const crate_1: LootTable = [
    { group: 1, id: 'coin', weight: 10, min: 50, max: 100, step: 25 },
    { group: 1, id: null, weight: 4 },
    { group: 2, id: 'wood', weight: 5, min: 40, max: 50, step: 5 },
    { group: 2, id: null, weight: 5 },
  ]
  const results: Array<Loot> = [
    [],
    [
      { id: 'coin', quantity: 50 },
      { id: 'wood', quantity: 50 },
    ],
    [{ id: 'wood', quantity: 50 }],
    [{ id: 'coin', quantity: 75 }],
    [{ id: 'wood', quantity: 40 }],
  ]
  for (const result of results) {
    const loot = GetLoot(crate_1)
    // console.log('[')
    // for (let entry of loot) {
    //   console.log(`  {id: '${entry.id}', quantity: ${entry.quantity} },`)
    // }
    // console.log('],')
    expect(loot.length).toBe(result.length)
    for (let i = 0; i < loot.length; i++) {
      expect(loot[i].id).toBe(result[i].id)
      expect(loot[i].quantity).toBe(result[i].quantity)
    }
  }
})
