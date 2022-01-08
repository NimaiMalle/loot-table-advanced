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

test('SimpleTransform', () => {
  const simple: LootTable = [
    { id: 'test', min: 0, max: 100, transform: (x: number) => 0.75 },
  ]
  const loot = GetLoot(simple)
  expect(loot.length).toBe(1)
  expect(loot[0].id).toBe('test')
  expect(loot[0].quantity).toBe(75)
})
