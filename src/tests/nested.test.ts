import { mockRandomForEach } from 'jest-mock-random'
import {
  GetLoot,
  Loot,
  LootTable,
  LootTableEntry,
} from '../loot-tables-advanced'
import { rnd } from './random-table'

mockRandomForEach(rnd)

test('Nested Loot Tables', () => {
  const gems: LootTable = [
    {group:1, id:'pearl', min:5, max:10},
    {group:1, id:'garnet', min:3, max:12},
    {group:1, id:'ruby', min:4, max:9},
    {group:1, id:'sapphire', max:2},
  ]

  const treasure: LootTable = [
    {group:1, id:gems, min:0, max:2},
    {group:2, id:'gold', min:15, max:20},
  ]

  const results: Array<Loot> = [
    [
      { id: 'sapphire', quantity: 1 },
      { id: 'garnet', quantity: 3 },
      { id: 'gold', quantity: 19 },
    ],
    [{ id: 'gold', quantity: 19 }],
    [
      { id: 'sapphire', quantity: 1 },
      { id: 'gold', quantity: 20 },
    ],
    [{ id: 'gold', quantity: 15 }],
    [
      { id: 'ruby', quantity: 4 },
      { id: 'sapphire', quantity: 1 },
      { id: 'gold', quantity: 19 },
    ],
    [
      { id: 'pearl', quantity: 10 },
      { id: 'gold', quantity: 16 },
    ],
  ]

  for (const result of results) {
    const loot = GetLoot(treasure)
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

test('Nested Loot Tables 2', () => {
  const gems: LootTable = [
    {group:1, id:'pearl', min:5, max:10},
    {group:1, id:'garnet', min:3, max:12},
    {group:1, id:'ruby', min:4, max:9},
    {group:1, id:'sapphire', max:2},
  ]

  const treasure: LootTable = [
    {group:1, id:{ lootTable: gems, count: 1 }, min:0, max:2},
    {group:2, id:'gold', min:15, max:20},
  ]

  const results: Array<Loot> = [
    [
      { id: 'sapphire', quantity: 1 },
      { id: 'garnet', quantity: 3 },
      { id: 'gold', quantity: 19 },
    ],
    [{ id: 'gold', quantity: 19 }],
    [
      { id: 'sapphire', quantity: 1 },
      { id: 'gold', quantity: 20 },
    ],
    [{ id: 'gold', quantity: 15 }],
    [
      { id: 'ruby', quantity: 4 },
      { id: 'sapphire', quantity: 1 },
      { id: 'gold', quantity: 19 },
    ],
    [
      { id: 'pearl', quantity: 10 },
      { id: 'gold', quantity: 16 },
    ],
  ]

  for (const result of results) {
    const loot = GetLoot(treasure)
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
test.skip('Summarize Loot Tables', async () => {
  const gems: LootTable = [
    {group:1, id:'pearl', min:5, max:10},
    {group:1, id:'garnet', min:3, max:12},
    {group:1, id:'ruby', min:4, max:9},
    {group:1, id:'sapphire', max:2},
    {group:1, id:'gold', min:0},
  ]

  const treasure: LootTable = [
    {group:1, id:null},
    {group:1, id:gems, min:0, max:2},
    {group:2, id:'gold', min:15, max:20},
  ]

  // const summary = await LootTableSummaryAsync(treasure, ResolveHelperAsync)
  // for (const entry of summary) {
  //   console.log(`${entry.id}\t${entry.min}\t${entry.max}`)
  // }
})
