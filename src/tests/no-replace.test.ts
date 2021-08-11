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

  for (let result of results) {
    let loot = GetLoot(cards, 2)
    expect(loot.length).toBe(result.length)
    for (let i = 0; i < loot.length; i++) {
      expect(loot[i].id).toBe(result[i].id)
      expect(loot[i].quantity).toBe(result[i].quantity)
    }
  }
})

/*
const gems: LootTable = [
  LootTableEntry('pearl', 5, 10, 1, 1, 1),
  LootTableEntry('garnet', 3, 12, 1, 1, 1),
  LootTableEntry('ruby', 4, 9, 1, 1, 1),
  LootTableEntry('sapphire', 1, 2, 1, 1, 1),
]

const treasure: LootTable = [
  LootTableEntry('@gems', 0, 2, 1, 1, 1),
  LootTableEntry('gold', 15, 20, 1, 2, 1),
]

function ResolveLootTable(id: string): LootTable | null {
  switch (id) {
    case 'scavenge_bare':
      return scavenge_bare
    case 'scavenge_tool':
      return scavenge_tool
    case 'gems':
      return gems
    case 'treasure':
      return treasure
  }
  return null
}

for (let x = 0; x < 5; x++) {
  loot = GetLoot(treasure, 1, ResolveLootTable)
  const message = LootToString(loot)
  console.log(message ? message : 'nothing')
}
*/
