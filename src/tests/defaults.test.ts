import { GetLoot, ILootTableEntry } from '../loot-tables-advanced'

test('Test not supplying all loot table entries', () => {
  let loot = GetLoot([{ id: 'test' } as ILootTableEntry])
  expect(loot.length).toBe(1)
  expect(loot[0].id).toBe('test')
})
