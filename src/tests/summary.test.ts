import { mockRandomForEach } from 'jest-mock-random'
import {
  LootTable,
  LootTableEntry,
  LootTableSummaryAsync,
} from '../loot-tables-advanced'
import { rnd } from './random-table'

mockRandomForEach(rnd)

test('Summary returns min min and max max', async () => {
  const loot: { [id: string]: LootTable } = {
    health: [LootTableEntry('@health_1'), LootTableEntry('@health_2')],
    health_1: [LootTableEntry('hp', 1, 3, 10)],
    health_2: [LootTableEntry('hp', 1, 5, 25)],
  }
  const summary = await LootTableSummaryAsync(
    loot['health'],
    async (id: string) => loot[id]
  )
  expect(summary[0].id).toBe('hp')
  expect(summary[0].min).toBe(3)
  expect(summary[0].max).toBe(25)
})
