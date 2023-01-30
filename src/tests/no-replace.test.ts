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
    { id: 'ace', supply: 1 },
    { id: 'king', supply: 1 },
    { id: 'queen', supply: 1 },
    { id: 'jack', supply: 1 },
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
    const loot = GetLoot(cards, {count: 2})
    expect(loot.length).toBe(result.length)
    for (let i = 0; i < loot.length; i++) {
      expect(loot[i].id).toBe(result[i].id)
      expect(loot[i].quantity).toBe(result[i].quantity)
    }
  }
})
