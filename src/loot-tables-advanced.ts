export interface ILootTableEntry {
  id: string | null
  weight: number
  min: number
  max: number
  step: number
  group: number
}

export declare type LootTable = Array<Partial<ILootTableEntry>>

export declare type LootTableResolver = (id: string) => LootTable | undefined
export declare type LootTableResolverAsync = (
  id: string
) => Promise<LootTable | undefined>

export interface ILootItem {
  id: string | null
  quantity: number
}

export type Loot = Array<ILootItem>

export function AddLoot(loot: Loot, item: ILootItem): Loot {
  const i = loot.findIndex((e) => e.id == item.id)
  if (i >= 0) loot[i].quantity += item.quantity
  else loot.push(item)
  return loot
}

function MergeLoot(a: Loot, b: Loot): Loot {
  b.forEach((e) => AddLoot(a, e))
  return a
}

function CloneLootTable(table: LootTable): LootTable {
  const result = JSON.parse(JSON.stringify(table)) as LootTable
  return result
}

function isPositiveInt(value: number): boolean {
  return value >= 0 && value === Math.floor(value)
}

const rxLootTableEntryID = new RegExp('^@?([a-z0-9_]+)(\\(([0-9]+)\\))?$')

function ParseLootID(id: string): { id: string | null; count: number } {
  var count = 0
  var name: string | null = null
  const matches = id.match(rxLootTableEntryID)
  if (matches) {
    name = matches[1]
    count = matches[3] === undefined ? 1 : parseInt(matches[3])
  }
  return { id: name, count }
}

export function LootTableEntry(
  id: string | null,
  weight: number = 1,
  min: number = 1,
  max: number = 1,
  step: number = 1,
  group: number = 1
): ILootTableEntry {
  if (id !== null && !rxLootTableEntryID.test(id))
    throw Error(`LootTableEntry ${id} invalid id format.`)
  if (!isPositiveInt(min) || !isPositiveInt(max))
    throw Error(
      `LootTableEntry ${id} min and max must both be non-negative integers.`
    )
  if (min > max)
    throw Error(`LootTableEntry ${id} min must be less than or equal to max.`)
  if (!isPositiveInt(step) || step == 0)
    throw Error(`LootTableEntry ${id} step must be a positive integer.`)
  if (!isPositiveInt(group))
    throw Error(`LootTableEntry ${id} group must be a non-negative integer.`)
  if (!isPositiveInt(weight))
    throw Error(`LootTableEntry ${id} weight must be a non-negative integer.`)
  return { id, min, max, step, group, weight }
}

const loot_defaults: ILootTableEntry = {
  id: null,
  weight: 1,
  min: 1,
  max: 1,
  step: 1,
  group: 1,
}

function FillInLootEntryDefaults(
  entry: Partial<ILootTableEntry>
): ILootTableEntry {
  if (entry.id === undefined) entry.id = loot_defaults.id
  if (entry.weight === undefined) entry.weight = loot_defaults.weight
  if (entry.min === undefined) entry.min = loot_defaults.min
  if (entry.max === undefined)
    entry.max = Math.max(loot_defaults.max, loot_defaults.min)
  if (entry.step === undefined) entry.step = loot_defaults.step
  if (entry.group === undefined) entry.group = loot_defaults.group
  return entry as ILootTableEntry
}

export async function GetLootAsync(
  table: LootTable,
  count: number = 1,
  resolver?: LootTableResolverAsync,
  depth = 0
): Promise<Loot> {
  if (!Array.isArray(table)) throw new Error('Not a loot table')
  if (depth > 9) throw new Error(`Too many nested loot tables`)
  if (count != 1) {
    table = CloneLootTable(table)
  }
  const result = new Array<ILootItem>()
  const groups = new Set()
  table.map((e) => groups.add(e.group))
  for (let pull = 0; pull < count; ++pull) {
    for (const groupID of groups) {
      const entries = table
        .filter((e) => e.group === groupID)
        .map(FillInLootEntryDefaults)
      const totalWeight = entries
        .map((e) => e.weight)
        .reduce((a, b) => a + b, 0)
      if (totalWeight == 0) {
        continue
      }
      const rand = Math.random() * totalWeight
      let entry: ILootTableEntry | null = null
      let sum = 0
      for (const e of entries) {
        sum += e.weight
        if (sum > rand) {
          entry = e
          break
        }
      }
      if (entry === null)
        throw new Error(`No loot table row could be selected.`)
      const range = Math.floor(
        (entry.max - entry.min + entry.step) / entry.step
      )
      let quantity = entry.min + Math.floor(Math.random() * range) * entry.step
      if (quantity > 0) {
        if (count != 1) {
          quantity = Math.max(quantity, entry.weight)
          entry.weight -= quantity
        }
        const id = entry.id
        if (id?.startsWith('@')) {
          const otherInfo = ParseLootID(id.substring(1))
          if (!otherInfo.id) throw new Error(`Unable to parse ${id}`)
          if (!resolver) throw new Error(`No resolver for ${id}`)
          const otherTable = await resolver(otherInfo.id)
          if (!otherTable) throw new Error(`${id} could not be resolved`)
          for (let i = 0; i < quantity; i++) {
            const loot = await GetLootAsync(
              otherTable,
              otherInfo.count,
              resolver,
              ++depth
            )
            MergeLoot(result, loot)
          }
        } else {
          if (entry.id !== null) {
            AddLoot(result, { id: entry.id, quantity })
          }
        }
      }
    }
  }
  return result
}

export function GetLoot(
  table: LootTable,
  count: number = 1,
  resolver?: LootTableResolver,
  depth = 0
): Loot {
  if (!Array.isArray(table)) throw new Error('Not a loot table')
  if (depth > 9) throw new Error(`Too many nested loot tables`)
  if (count != 1) {
    table = CloneLootTable(table)
  }
  const result = new Array<ILootItem>()
  const groups = new Set()
  table.map((e) => groups.add(e.group))
  for (let pull = 0; pull < count; ++pull) {
    for (const groupID of groups) {
      const entries = table
        .filter((e) => e.group === groupID)
        .map(FillInLootEntryDefaults)
      const totalWeight = entries
        .map((e) => e.weight)
        .reduce((a, b) => a + b, 0)
      if (totalWeight == 0) {
        continue
      }
      const rand = Math.random() * totalWeight
      let entry: ILootTableEntry | null = null
      let sum = 0
      for (const e of entries) {
        sum += e.weight
        if (sum > rand) {
          entry = e
          break
        }
      }
      if (entry === null)
        throw new Error(`No loot table row could be selected.`)
      const range = Math.floor(
        (entry.max - entry.min + entry.step) / entry.step
      )
      let quantity = entry.min + Math.floor(Math.random() * range) * entry.step
      if (quantity > 0) {
        if (count != 1) {
          quantity = Math.max(quantity, entry.weight)
          entry.weight -= quantity
        }
        const id = entry.id
        if (id?.startsWith('@')) {
          const otherInfo = ParseLootID(id.substring(1))
          if (!otherInfo.id) throw new Error(`Unable to parse ${id}`)
          if (!resolver) throw new Error(`No resolver for ${id}`)
          const otherTable = resolver(otherInfo.id)
          if (!otherTable) throw new Error(`${id} could not be resolved`)
          for (let i = 0; i < quantity; i++) {
            const loot = GetLoot(otherTable, otherInfo.count, resolver, ++depth)
            MergeLoot(result, loot)
          }
        } else {
          if (entry.id !== null) {
            AddLoot(result, { id: entry.id, quantity })
          }
        }
      }
    }
  }
  return result
}
