export interface ILootTableEntry<T extends string = string> {
  id: T | null
  weight: number
  min: number
  max: number
  step: number
  group: number
  transform: null | ((x: number) => number)
}

export declare type LootTable<T extends string = string> = Array<
  Partial<ILootTableEntry<T>>
>

export declare type LootTableResolver<
  T extends string = string, // Item Id type
  V extends string = string // Loot Table Id type
> = (id: V) => LootTable<T> | undefined

export declare type LootTableResolverAsync<
  T extends string = string,
  V extends string = string
> = (id: V) => Promise<LootTable<T> | undefined>

export interface ILootItem<T extends string = string> {
  id: T | null
  quantity: number
}

export type Loot<T extends string = string> = Array<ILootItem<T>>

export function AddLoot<T extends string = string>(
  loot: Loot,
  item: ILootItem
): Loot {
  const i = loot.findIndex((e) => e.id == item.id)
  if (i >= 0) loot[i].quantity += item.quantity
  else loot.push({ id: item.id, quantity: item.quantity })
  return loot
}

function MergeLoot(a: Loot, b: Loot): Loot {
  b.forEach((e) => AddLoot(a, e))
  return a
}

function CloneEntry<T extends string = string>(
  entry: Partial<ILootTableEntry<T>>
): Partial<ILootTableEntry<T>> {
  return JSON.parse(JSON.stringify(entry)) as Partial<ILootTableEntry<T>>
}

function CloneLootTable<T extends string = string>(
  table: LootTable<T>
): LootTable<T> {
  const result = JSON.parse(JSON.stringify(table)) as LootTable<T>
  return result
}

function isPositiveInt(value: number): boolean {
  return value >= 0 && value === Math.floor(value)
}

const rxLootTableEntryID = new RegExp('^@?([a-z0-9_-]+)(\\(([0-9]+)\\))?$', 'i')

function ParseLootID<T extends string = string>(
  id: string
): { id: T | null; count: number } {
  var count = 0
  var name: T | null = null
  const matches = id.match(rxLootTableEntryID)
  if (matches) {
    name = matches[1] as T
    count = matches[3] === undefined ? 1 : parseInt(matches[3])
  }
  return { id: name, count }
}

export function LootTableEntry<T extends string = string>(
  id: T | null,
  weight: number = 1,
  min: number = 1,
  max: number = 1,
  step: number = 1,
  group: number = 1,
  transform: null | ((x: number) => number) = null
): ILootTableEntry {
  if (id !== null && !rxLootTableEntryID.test(id))
    throw Error(`LootTableEntry ${id} invalid id format.`)
  // if (!isPositiveInt(min) || !isPositiveInt(max))
  //   throw Error(
  //     `LootTableEntry ${id} min and max must both be non-negative integers.`
  //   )
  if (min > max)
    throw Error(`LootTableEntry ${id} min must be less than or equal to max.`)
  if ((!isPositiveInt(step) || step == 0) && !Number.isNaN(step))
    throw Error(`LootTableEntry ${id} step must be a positive integer or NaN.`)
  if (!isPositiveInt(group))
    throw Error(`LootTableEntry ${id} group must be a non-negative integer.`)
  if (!isPositiveInt(weight))
    throw Error(`LootTableEntry ${id} weight must be a non-negative integer.`)
  return { id, min, max, step, group, weight, transform }
}

const loot_defaults: ILootTableEntry = {
  id: null,
  weight: 1,
  min: 1,
  max: 1,
  step: 1,
  group: 1,
  transform: null,
}

function FillInLootEntryDefaults<T extends string = string>(
  entry: Partial<ILootTableEntry<T>>
): ILootTableEntry<T> {
  if (entry.id === undefined) entry.id = null
  if (entry.weight === undefined) entry.weight = loot_defaults.weight
  if (entry.min === undefined) entry.min = loot_defaults.min
  if (entry.max === undefined)
    entry.max = Math.max(loot_defaults.max, loot_defaults.min)
  if (entry.step === undefined) entry.step = loot_defaults.step
  if (entry.group === undefined) entry.group = loot_defaults.group
  return entry as ILootTableEntry<T>
}

const MAX_NESTED = 100

export async function LootTableSummaryAsync<
  T extends string = string, // Item Id type
  V extends string = string // Loot Table Id type
>(
  table: LootTable<T>,
  resolver?: LootTableResolverAsync<T, V>
): Promise<LootTable<T>> {
  return _LootTableSummaryAsync(table, resolver)
}

export async function _LootTableSummaryAsync<
  T extends string = string,
  V extends string = string
>(
  table: LootTable<T>,
  resolver?: LootTableResolverAsync<T, V>,
  depth: number = 0,
  multiple: number = 1, // Not supported yet
  min: number = 1,
  max: number = 1
): Promise<LootTable<T>> {
  if (!Array.isArray(table)) throw new Error('Not a loot table')
  if (depth > MAX_NESTED) throw new Error(`Too many nested loot tables`)
  let result = sum(condense(table))
  const length = result.length
  for (let i = 0; i < length; i++) {
    const entry: Partial<ILootTableEntry> &
      Pick<ILootTableEntry, 'id' | 'min' | 'max'> = FillInLootEntryDefaults(
      result[i]
    )
    const id = entry.id
    const group = entry.group
    delete entry.weight
    delete entry.step
    delete entry.group
    if (id?.startsWith('@')) {
      const otherInfo = ParseLootID<V>(id.substring(1))
      if (!otherInfo.id) throw new Error(`Unable to parse ${id}`)
      if (!resolver) throw new Error(`No resolver for ${id}`)
      const otherTable = await resolver(otherInfo.id)
      if (!otherTable) throw new Error(`${id} could not be resolved`)
      const otherSummarized = await _LootTableSummaryAsync(
        otherTable,
        resolver,
        depth + 1,
        otherInfo.count,
        entry.min,
        entry.max
      )
      otherSummarized.map((e) => (e.group = group))
      result.push(...otherSummarized)
      result = condense(result)
      sum(result)
    }
  }
  result.map((e) => delete e.group)
  result = sum(result)
  const scaled = scale(
    result.filter((e) => !e.id?.startsWith('@')),
    min,
    max
  )
  return scaled
}

/**
 * Combine all entries with the same id and group, making min be the smallest min, and max be the largest max
 * @param input Loot Table
 * @returns
 */
function condense<T extends string = string>(
  input: LootTable<T>
): LootTable<T> {
  const result = new Array<Partial<ILootTableEntry<T>>>()
  for (const entry of input) {
    const existing = result.find(
      (x) => x.id === entry.id && x.group === entry.group
    )
    if (existing) {
      existing.min = Math.min(existing.min!, entry.min!)
      existing.max = Math.max(existing.max!, entry.max!)
    } else {
      result.push(CloneEntry<T>(entry))
    }
  }
  return result
}

/**
 * Combine all entries with the same id, summing the mins and maxes
 * @param input Loot Table
 * @returns
 */
function sum<T extends string = string>(
  input: LootTable<T>,
  into?: LootTable<T>
): LootTable<T> {
  const result = into ?? new Array<Partial<ILootTableEntry<T>>>()
  for (const entry of input) {
    const existing = result.find((x) => x.id === entry.id)
    if (existing) {
      existing.min! += entry.min!
      existing.max! += entry.max!
    } else {
      result.push(CloneEntry<T>(entry))
    }
  }
  return result
}

function scale<T extends string = string>(
  input: LootTable<T>,
  min: number,
  max: number
): LootTable<T> {
  for (const entry of input) {
    entry.min! *= min
    entry.max! *= max
  }
  return input
}

export async function GetLootAsync<
  T extends string = string, // Item Id type
  V extends string = string // Loot Table Id type
>(
  table: LootTable<T>,
  count: number = 1,
  resolver?: LootTableResolverAsync<T, V>,
  depth = 0
): Promise<Loot<T>> {
  if (!Array.isArray(table)) throw new Error('Not a loot table')
  if (depth > MAX_NESTED) throw new Error(`Too many nested loot tables`)
  if (count != 1) {
    table = CloneLootTable<T>(table)
  }
  const result = new Array<ILootItem<T>>()
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
      let entry: ILootTableEntry<T> | null = null
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
      const range = isNaN(entry.step)
        ? entry.max - entry.min
        : Math.floor((entry.max - entry.min + entry.step) / entry.step)
      const rnd = entry.transform
        ? entry.transform(Math.random())
        : Math.random()
      let quantity =
        entry.min +
        (isNaN(entry.step) ? rnd * range : Math.floor(rnd * range) * entry.step)
      let absQuantity = Math.abs(quantity)
      if (absQuantity > 0) {
        if (count != 1) {
          absQuantity = Math.max(absQuantity, entry.weight)
          quantity = quantity < 0 ? -absQuantity : absQuantity
          entry.weight -= absQuantity
        }
        const id = entry.id
        if (id?.startsWith('@')) {
          const otherInfo = ParseLootID<V>(id.substring(1))
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
            depth--
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

export function GetLoot<
  T extends string = string, // Item Id type
  V extends string = string // Loot Table Id type
>(
  table: LootTable<T>,
  count: number = 1,
  resolver?: LootTableResolver<T, V>,
  depth = 0
): Loot<T> {
  if (!Array.isArray(table)) throw new Error('Not a loot table')
  if (depth > MAX_NESTED) throw new Error(`Too many nested loot tables`)
  if (count != 1) {
    table = CloneLootTable(table)
  }
  const result = new Array<ILootItem<T>>()
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
      const range = isNaN(entry.step)
        ? entry.max - entry.min
        : Math.floor((entry.max - entry.min + entry.step) / entry.step)
      const rnd = entry.transform
        ? entry.transform(Math.random())
        : Math.random()
      let quantity =
        entry.min +
        (isNaN(entry.step) ? rnd * range : Math.floor(rnd * range) * entry.step)
      let absQuantity = Math.abs(quantity)
      if (absQuantity > 0) {
        if (count != 1) {
          absQuantity = Math.max(absQuantity, entry.weight)
          quantity = quantity < 0 ? -absQuantity : absQuantity
          entry.weight -= absQuantity
        }
        const id = entry.id
        if (id?.startsWith('@')) {
          const otherInfo = ParseLootID<V>(id.substring(1))
          if (!otherInfo.id) throw new Error(`Unable to parse ${id}`)
          if (!resolver) throw new Error(`No resolver for ${id}`)
          const otherTable = resolver(otherInfo.id)
          if (!otherTable) throw new Error(`${id} could not be resolved`)
          for (let i = 0; i < quantity; i++) {
            const loot = GetLoot(otherTable, otherInfo.count, resolver, ++depth)
            depth--
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
