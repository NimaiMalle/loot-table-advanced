import { mockRandomForEach } from 'jest-mock-random'
import {
  GetLoot,
  Loot,
  LootTable,
  LootTableEntry,
  LootTableSummary,
} from '../loot-tables-advanced'
import { rnd } from './random-table'

mockRandomForEach(rnd)

test('Recirsive summary', () => {
  const health_1 = [{ id: 'hp', min: 3, max: 10 }]
  const health_2 = [{ id: 'hp', min: 5, max: 25 }]
  const loot = [{ id: health_1 }, { id: health_2 }]

  const result: Loot<string> = GetLoot(loot)
  // console.log(result)
  const summary = LootTableSummary(loot)
  expect(summary[0].id).toBe('hp')
  expect(summary[0].min).toBe(3)
  expect(summary[0].max).toBe(25)
})

test('Summary returns min min and max max', () => {
  const loot: { [id: string]: LootTable } = {
    eat: [
      { group: 1, id: 'hp', min: 16, max: 16 },
      { group: 4, id: 'hp', weight: 89, min: 2, max: 4 },
      { group: 4, id: 'hp', weight: 10, max: 6 },
      { group: 4, id: 'hp', min: 5, max: 25 },
    ],
  }

  const summary = LootTableSummary(loot['eat'])
  expect(summary[0].id).toBe('hp')
  expect(summary[0].min).toBe(17)
  expect(summary[0].max).toBe(41)
})

test('Summary nested returns min min and max max', () => {
  const eat_1 = [
    { group: 1, id: 'hp', weight: 89, min: 2, max: 4 },
    { group: 1, id: 'hp', weight: 10, max: 6 },
    { group: 1, id: 'hp', min: 5, max: 25 },
  ]
  const eat = [
    { group: 1, id: 'hp', min: 16, max: 16 },
    { group: 2, id: eat_1, max: 3 },
  ]

  const summary = LootTableSummary(eat)
  expect(summary[0].id).toBe('hp')
  expect(summary[0].min).toBe(17)
  expect(summary[0].max).toBe(91)
})

test('Summary returns min min and max max ', () => {
  const loot: { [id: string]: LootTable } = {
    eat: [
      { group: 1, id: 'hp', min: 16, max: 16 },
      { group: 4, id: 'hp', weight: 89, min: 2, max: 4 },
      { group: 4, id: 'hp', weight: 10, max: 6 },
      { group: 4, id: 'hp', min: 5, max: 25 },
    ],
  }

  const summary = LootTableSummary(loot['eat'])
  expect(summary[0].id).toBe('hp')
  expect(summary[0].min).toBe(17)
  expect(summary[0].max).toBe(41)
})

test('Summary nested returns min min and max max ', () => {
  const eat_1 = [
    { group: 1, id: 'hp', weight: 89, min: 2, max: 4 },
    { group: 1, id: 'hp', weight: 10, max: 6 },
    { group: 1, id: 'hp', min: 5, max: 25 },
  ]
  const eat = [
    { group: 1, id: 'hp', min: 16, max: 16 },
    { group: 2, id: eat_1, max: 3 },
  ]

  const summary = LootTableSummary(eat)
  expect(summary[0].id).toBe('hp')
  expect(summary[0].min).toBe(17)
  expect(summary[0].max).toBe(91)
})
