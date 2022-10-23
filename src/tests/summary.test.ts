import { mockRandomForEach } from 'jest-mock-random'
import {
  GetLoot,
  Loot,
  LootTable,
  LootTableEntry,
  LootTableSummary,
  LootTableSummaryAsync,
} from '../loot-tables-advanced'
import { rnd } from './random-table'

mockRandomForEach(rnd)

test('Recirsive summary async', async () => {
  const loot: { [id: string]: LootTable } = {
    health: [LootTableEntry('@health_1'), LootTableEntry('@health_2')],
    health_1: [LootTableEntry('hp', 1, 3, 10)],
    health_2: [LootTableEntry('hp', 1, 5, 25)],
  }
  const result: Loot<string> = GetLoot(
    loot['health'],
    1,
    (id: string) => loot[id]
  )
  console.log(result)
  const summary = await LootTableSummaryAsync(
    loot['health'],
    async (id: string) => loot[id]
  )
  expect(summary[0].id).toBe('hp')
  expect(summary[0].min).toBe(3)
  expect(summary[0].max).toBe(25)
})

test('Summary returns min min and max max async', async () => {
  const loot: { [id: string]: LootTable } = {
    eat: [
      LootTableEntry('hp', 1, 16, 16, 1, 1),
      LootTableEntry('hp', 89, 2, 4, 1, 4),
      LootTableEntry('hp', 10, 1, 6, 1, 4),
      LootTableEntry('hp', 1, 5, 25, 1, 4),
    ],
  }

  const summary = await LootTableSummaryAsync(loot['eat'])
  expect(summary[0].id).toBe('hp')
  expect(summary[0].min).toBe(17)
  expect(summary[0].max).toBe(41)
})

test('Summary nested returns min min and max max async', async () => {
  const loot: { [id: string]: LootTable } = {
    eat: [
      LootTableEntry('hp', 1, 16, 16, 1, 1),
      LootTableEntry('@eat_1', 1, 1, 3, 1, 2),
    ],
    eat_1: [
      LootTableEntry('hp', 89, 2, 4, 1),
      LootTableEntry('hp', 10, 1, 6, 1),
      LootTableEntry('hp', 1, 5, 25, 1),
    ],
  }

  const summary = await LootTableSummaryAsync(
    loot['eat'],
    async (id: string) => loot[id]
  )
  expect(summary[0].id).toBe('hp')
  expect(summary[0].min).toBe(17)
  expect(summary[0].max).toBe(91)
})

test('Recirsive summary', () => {
  const loot: { [id: string]: LootTable } = {
    health: [LootTableEntry('@health_1'), LootTableEntry('@health_2')],
    health_1: [LootTableEntry('hp', 1, 3, 10)],
    health_2: [LootTableEntry('hp', 1, 5, 25)],
  }
  const result: Loot<string> = GetLoot(
    loot['health'],
    1,
    (id: string) => loot[id]
  )
  console.log(result)
  const summary = LootTableSummary(
    loot['health'],
    (id: string) => loot[id]
  )
  expect(summary[0].id).toBe('hp')
  expect(summary[0].min).toBe(3)
  expect(summary[0].max).toBe(25)
})

test('Summary returns min min and max max ', () => {
  const loot: { [id: string]: LootTable } = {
    eat: [
      LootTableEntry('hp', 1, 16, 16, 1, 1),
      LootTableEntry('hp', 89, 2, 4, 1, 4),
      LootTableEntry('hp', 10, 1, 6, 1, 4),
      LootTableEntry('hp', 1, 5, 25, 1, 4),
    ],
  }

  const summary = LootTableSummary(loot['eat'])
  expect(summary[0].id).toBe('hp')
  expect(summary[0].min).toBe(17)
  expect(summary[0].max).toBe(41)
})

test('Summary nested returns min min and max max ', () => {
  const loot: { [id: string]: LootTable } = {
    eat: [
      LootTableEntry('hp', 1, 16, 16, 1, 1),
      LootTableEntry('@eat_1', 1, 1, 3, 1, 2),
    ],
    eat_1: [
      LootTableEntry('hp', 89, 2, 4, 1),
      LootTableEntry('hp', 10, 1, 6, 1),
      LootTableEntry('hp', 1, 5, 25, 1),
    ],
  }

  const summary = LootTableSummary(
    loot['eat'],
    (id: string) => loot[id]
  )
  expect(summary[0].id).toBe('hp')
  expect(summary[0].min).toBe(17)
  expect(summary[0].max).toBe(91)
})
