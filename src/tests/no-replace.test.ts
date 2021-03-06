import {
  GetLoot,
  Loot,
  LootTable,
  LootTableEntry,
} from '../loot-tables-advanced'

import { mockRandomForEach } from 'jest-mock-random'
import { rnd } from './random-table'

mockRandomForEach(rnd)

test('Select Without Replace', () => {
  const cards: LootTable = [
    LootTableEntry('ace'),
    LootTableEntry('king'),
    LootTableEntry('queen'),
    LootTableEntry('jack'),
  ]

  const results: Array<Loot> = [
    [
      { id: 'jack', quantity: 1 },
      { id: 'queen', quantity: 1 },
    ],
    [
      { id: 'king', quantity: 1 },
      { id: 'ace', quantity: 1 },
    ],
    [
      { id: 'jack', quantity: 1 },
      { id: 'ace', quantity: 1 },
    ],
    [
      { id: 'king', quantity: 1 },
      { id: 'jack', quantity: 1 },
    ],
    [
      { id: 'jack', quantity: 1 },
      { id: 'ace', quantity: 1 },
    ],
  ]

  for (const result of results) {
    const loot = GetLoot(cards, 2)
    expect(loot.length).toBe(result.length)
    for (let i = 0; i < loot.length; i++) {
      expect(loot[i].id).toBe(result[i].id)
      expect(loot[i].quantity).toBe(result[i].quantity)
    }
  }
})
