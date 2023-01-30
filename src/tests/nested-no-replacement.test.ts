import { mockRandom } from 'jest-mock-random'
import {
  GetLoot,
  Loot,
  LootTable,
  LootTableEntry,
} from '../loot-tables-advanced'
import { rnd } from './random-table'

mockRandom(rnd)

test('Select Without Replace Nested', () => {
  const cards: LootTable = [
    { id: 'ace', supply: 1 },
    { id: 'king', supply: 1 },
    { id: 'queen', supply: 1 },
    { id: 'jack', supply: 1 },
  ]

  const cards_chips: LootTable = [
    { group: 1, id: 'chips', min: 10, max: 50, step: 5 },
    { group: 2, id: { lootTable: cards, count: 2 } },
  ]

  const results: Array<Loot> = [
    [
      { id: 'chips', quantity: 50 },
      { id: 'king', quantity: 1 },
      { id: 'ace', quantity: 1 },
    ],
    [
      { id: 'chips', quantity: 20 },
      { id: 'king', quantity: 1 },
      { id: 'jack', quantity: 1 },
    ],
    [
      { id: 'chips', quantity: 50 },
      { id: 'king', quantity: 1 },
      { id: 'ace', quantity: 1 },
    ],
    [
      { id: 'chips', quantity: 10 },
      { id: 'queen', quantity: 1 },
      { id: 'king', quantity: 1 },
    ],
    [
      { id: 'chips', quantity: 50 },
      { id: 'jack', quantity: 1 },
      { id: 'king', quantity: 1 },
    ],
  ]

  for (const result of results) {
    const loot = GetLoot(cards_chips)
    // let results_gen = '['
    // for (let entry of loot) {
    //   results_gen += `  {id: '${entry.id}', quantity: ${entry.quantity} },`
    // }
    // console.log(results_gen + '],')
    expect(loot.length).toBe(result.length)
    for (let i = 0; i < loot.length; i++) {
      expect(loot[i].id).toBe(result[i].id)
      expect(loot[i].quantity).toBe(result[i].quantity)
    }
  }
})
