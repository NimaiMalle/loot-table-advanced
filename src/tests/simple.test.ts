import { GetLoot, LootTable } from '../loot-tables-advanced'

test('Simplest', () => {
  const simple: LootTable = [{ id: 'coin' }]
  const loot = GetLoot(simple)
  expect(loot.length).toBe(1)
  expect(loot[0].id).toBe('coin')
  expect(loot[0].quantity).toBe(1)
})

test('SimplestNeg', () => {
  const simple: LootTable = [{ id: 'health', min: -5, max: -5 }]
  const loot = GetLoot(simple)
  expect(loot.length).toBe(1)
  expect(loot[0].id).toBe('health')
  expect(loot[0].quantity).toBe(-5)
})
