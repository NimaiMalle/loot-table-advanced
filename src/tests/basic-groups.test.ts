import { mockRandomForEach } from 'jest-mock-random'
import {
  GetLoot,
  GetLootAsync,
  Loot,
  LootTable,
  LootTableEntry,
} from '../loot-tables-advanced'
import { rnd } from './random-table'

mockRandomForEach(rnd)

test('Basic groups test', async () => {
  const crate_1: LootTable = [
    LootTableEntry('coin', 10, 50, 100, 25, 1),
    LootTableEntry(null, 4, 1, 1, 1, 1),
    LootTableEntry('wood', 5, 40, 50, 5, 2),
    LootTableEntry(null, 5, 1, 1, 1, 2),
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
    const loot = await GetLootAsync(crate_1)
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
