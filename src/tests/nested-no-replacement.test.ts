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
    LootTableEntry('ace'),
    LootTableEntry('king'),
    LootTableEntry('queen'),
    LootTableEntry('jack'),
  ]

  const cards_chips: LootTable = [
    LootTableEntry('chips', 1, 10, 50, 5, 1),
    LootTableEntry('@cards(2)', 1, 1, 1, 1, 2),
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
    const loot = GetLoot(cards_chips, 1, (id) =>
      id == 'cards' ? cards : undefined
    )
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
