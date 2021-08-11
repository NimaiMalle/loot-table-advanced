import { GetLoot, LootTable } from '../loot-tables-advanced'

test('Simplest', () => {
  const simple: LootTable = [
    { id: 'coin', min: 1, max: 1, step: 1, group: 1, weight: 1 },
  ]
  let loot = GetLoot(simple)
  expect(loot.length).toBe(1)
  expect(loot[0].id).toBe('coin')
  expect(loot[0].quantity).toBe(1)
})
