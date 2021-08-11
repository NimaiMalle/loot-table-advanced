import { GetLoot, LootTable } from '../loot-tables-advanced'

test('Simplest', () => {
  const simple: LootTable = [{ id: 'coin' }]
  let loot = GetLoot(simple)
  expect(loot.length).toBe(1)
  expect(loot[0].id).toBe('coin')
  expect(loot[0].quantity).toBe(1)
})
