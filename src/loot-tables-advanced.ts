import { Optional, Required } from 'utility-types'

type AtLeast<T, K extends keyof T> = Partial<T> & Pick<T, K>

type LootTableEntryId<T = string> =
  | T
  | LootTable<T>
  | ReferencedLootTable<T>
  | null

export interface ILootTableEntry<T = string> {
  id: LootTableEntryId<T>
  weight: number
  supply: number | null
  min: number
  max: number
  step: number | null
  group: number
}

export type IPartialLootTableEntry<T> = AtLeast<ILootTableEntry<T>, 'id'>

export type GetLootOptions<T> = MergeOptions<T> & CountOptions

export type MergeOptions<T> = {
  equals?: (a: T | null, b: T | null) => boolean
  assign?: (a: T | null, b: T | null) => T | null
}

export type CountOptions = {
  count?: number
}

export type ReferencedLootTable<T> = {
  lootTable: LootTable<T>
} & Required<CountOptions, 'count'>

function isReference<T>(id: LootTableEntryId<T>): id is ReferencedLootTable<T> {
  return !!id && (id as ReferencedLootTable<T>).lootTable !== undefined
}

function isEmbedded<T>(id: LootTableEntryId<T>): id is LootTable<T> {
  return Array.isArray(id)
}

function isNested<T>(id: LootTableEntryId<T> | undefined): boolean {
  return !!id && (isReference(id) || isEmbedded(id))
}

function getNested<T>(
  id: LootTableEntryId<T> | undefined
): ReferencedLootTable<T> | undefined {
  if (id === undefined) return undefined
  if (isReference(id)) {
    return id
  } else if (isEmbedded(id)) {
    return {
      lootTable: id,
      count: 1,
    }
  } else return undefined
}

export declare type LootTable<T = string> = Array<IPartialLootTableEntry<T>>

export interface ILootItem<T = string> {
  id: T | null
  quantity: number
}

export type Loot<T = string> = Array<ILootItem<T>>

export function AddLoot<T>(
  loot: Loot<T>,
  item: ILootItem<T>,
  options?: MergeOptions<T>
): Loot<T> {
  const equalsFn = options?.equals ?? defaultEqualsFn
  const assignFn = options?.assign ?? defaultAssignFn
  const i = loot.findIndex((e) => equalsFn(e.id, item.id))
  if (i >= 0) {
    loot[i].id = assignFn(loot[i].id, item.id)
    loot[i].quantity += item.quantity
  } else loot.push({ id: item.id, quantity: item.quantity })
  return loot
}

function MergeLoot<T>(
  a: Loot<T>,
  b: Loot<T>,
  options?: MergeOptions<T>
): Loot<T> {
  b.forEach((e) => AddLoot(a, e, options))
  return a
}

function CloneEntry<T>(
  entry: IPartialLootTableEntry<T>
): IPartialLootTableEntry<T> {
  const newEntry: IPartialLootTableEntry<T> = {
    id: isReference(entry.id)
      ? {
          lootTable: CloneLootTable(entry.id.lootTable),
          count: entry.id.count,
        }
      : isEmbedded(entry.id)
      ? CloneLootTable(entry.id)
      : entry.id,
  }
  if (entry.weight !== undefined) newEntry.weight = entry.weight
  if (entry.min !== undefined) newEntry.min = entry.min
  if (entry.max !== undefined) newEntry.max = entry.max
  if (entry.step !== undefined) newEntry.step = entry.step
  if (entry.group !== undefined) newEntry.group = entry.group
  if (entry.supply !== undefined) newEntry.supply = entry.supply
  return newEntry
}

function CloneLootTable<T>(table: LootTable<T>): LootTable<T> {
  return table.map((e) => CloneEntry(e))
}

function isPositiveInt(value: number): boolean {
  return value >= 0 && value === Math.floor(value)
}

export function LootTableEntry<T>(
  id: T | null,
  weight: number = 1,
  min: number = 1,
  max: number = 1,
  step: number | null = 1,
  group: number = 1,
  supply: number | null = null
): ILootTableEntry<T> {
  if (min > max)
    throw Error(`LootTableEntry ${id} min must be less than or equal to max.`)
  if (
    step !== null &&
    (!isPositiveInt(step) || step == 0) &&
    !Number.isNaN(step)
  )
    throw Error(
      `LootTableEntry ${id} step must be a positive integer, NaN, or null.`
    )
  if (!isPositiveInt(group))
    throw Error(`LootTableEntry ${id} group must be a non-negative integer.`)
  if (!isPositiveInt(weight))
    throw Error(`LootTableEntry ${id} weight must be a non-negative integer.`)
  return { id, min, max, step, group, weight, supply }
}

export function CheckLootTableEntry<T>(
  entry: IPartialLootTableEntry<T>
): IPartialLootTableEntry<T> {
  if (
    typeof entry.min === 'number' &&
    typeof entry.max === 'number' &&
    entry.min > entry.max
  )
    throw Error(
      `LootTableEntry ${entry.id} min must be less than or equal to max.`
    )
  if (
    typeof entry.step === 'number' &&
    (!isPositiveInt(entry.step) || entry.step == 0) &&
    !Number.isNaN(entry.step) &&
    entry.step !== null
  )
    throw Error(
      `LootTableEntry ${entry.id} step must be a positive integer, NaN, or null.`
    )
  if (typeof entry.group === 'number' && !isPositiveInt(entry.group))
    throw Error(
      `LootTableEntry ${entry.id} group must be a non-negative integer.`
    )
  if (typeof entry.weight === 'number' && !isPositiveInt(entry.weight))
    throw Error(
      `LootTableEntry ${entry.id} weight must be a non-negative integer.`
    )
  return entry
}

const loot_defaults: ILootTableEntry = {
  id: null,
  weight: 1,
  supply: null,
  min: 1,
  max: 1,
  step: 1,
  group: 1,
}

function FillInLootEntryDefaults<T>(
  entry: IPartialLootTableEntry<T>
): ILootTableEntry<T> {
  if (entry.id === undefined) entry.id = null
  if (entry.weight === undefined) entry.weight = loot_defaults.weight
  if (entry.min === undefined) entry.min = loot_defaults.min
  if (entry.max === undefined)
    entry.max = Math.max(loot_defaults.max, loot_defaults.min)
  if (entry.step === undefined) entry.step = loot_defaults.step
  if (entry.group === undefined) entry.group = loot_defaults.group
  if (entry.supply === undefined) entry.supply = loot_defaults.supply
  return entry as ILootTableEntry<T>
}

const MAX_NESTED = 100

export function LootTableSummary<T>(
  table: LootTable<T>,
  options?: MergeOptions<T>
): LootTable<T> {
  return _LootTableSummary(table, options)
}

function _LootTableSummary<T>(
  table: LootTable<T>,
  options?: MergeOptions<T>,
  depth: number = 0,
  multiple: number = 1, // Not supported yet
  min: number = 1,
  max: number = 1
): LootTable<T> {
  if (!Array.isArray(table)) throw new Error('Not a loot table')
  if (depth > MAX_NESTED) throw new Error(`Too many nested loot tables`)
  let result = sum(condense(table))
  const length = result.length
  for (let i = 0; i < length; i++) {
    const entry = result[i] as Optional<
      ILootTableEntry<T>,
      'weight' | 'step' | 'group'
    >
    const group = entry.group
    delete entry.weight
    delete entry.step
    const nested = getNested<T>(entry.id)
    if (nested) {
      const otherSummarized = _LootTableSummary<T>(
        nested.lootTable,
        options,
        depth + 1,
        nested.count,
        entry.min,
        entry.max
      )
      otherSummarized.map((e) => (e.group = group))
      result.push(...otherSummarized)
    }
  }
  result = result.filter((e) => !isNested(e.id))
  result = condense(result)
  result.map((e) => delete e.group)
  result = sum(result)
  const scaled = scale(
    result.filter((e) => e.id !== null && !isNested(e.id)),
    min,
    max
  )
  return scaled
}

function equal<T>(
  a: IPartialLootTableEntry<T>,
  b: IPartialLootTableEntry<T>,
  options?: Pick<MergeOptions<T>, 'equals'>
) {
  if (a.group !== b.group) return false
  const equalsFn = options?.equals ?? defaultEqualsFn
  if (a.id) {
    if (!b.id) return false
    if (isNested(a.id) || isNested(b.id)) return false
    const aid = a.id as T
    const bid = b.id as T
    return equalsFn(aid, bid) || JSON.stringify(a.id) == JSON.stringify(b.id)
  } else return !b.id
}

function defaultEqualsFn<T>(a: T | null, b: T | null) {
  return a === b
}

function defaultAssignFn<T>(a: T | null, _: T | null) {
  return a
}

/**
 * Combine all entries with the same id and group, making min be the smallest min, and max be the largest max
 * @param input Loot Table
 * @returns
 */
function condense<T>(
  input: LootTable<T>,
  options?: MergeOptions<T>
): LootTable<T> {
  const assignFn = options?.assign ?? defaultAssignFn
  const result = new Array<IPartialLootTableEntry<T>>()
  for (const entry of input) {
    FillInLootEntryDefaults(entry)
    const existing = result.find((x) => equal(x, entry, options))
    if (existing) {
      existing.id = assignFn(existing.id as T | null, entry.id as T | null)
      existing.min = Math.min(existing.min!, entry.min!)
      existing.max = Math.max(existing.max!, entry.max!)
    } else {
      result.push(CloneEntry<T>(entry))
    }
  }
  return result
}

/**
 * Combine all entries with the same id and group, summing the mins and maxes
 * @param input Loot Table
 * @returns
 */
function sum<T>(
  input: LootTable<T>,
  into?: LootTable<T>,
  options?: MergeOptions<T>
): LootTable<T> {
  const assignFn = options?.assign ?? defaultAssignFn
  const result = into ?? new Array<IPartialLootTableEntry<T>>()
  for (const entry of input) {
    FillInLootEntryDefaults(entry)
    const existing = result.find((x) => equal(x, entry, options))
    if (existing) {
      existing.id = assignFn(existing.id as T | null, entry.id as T | null)
      existing.min! += entry.min!
      existing.max! += entry.max!
    } else {
      result.push(CloneEntry<T>(entry))
    }
  }
  return result
}

function scale<T>(input: LootTable<T>, min: number, max: number): LootTable<T> {
  for (const entry of input) {
    entry.min! *= min
    entry.max! *= max
  }
  return input
}

function isLimitedSupply(table: LootTable<any>) {
  if (
    table.some(
      (e) =>
        e.supply !== undefined && e.supply !== null && !Number.isNaN(e.supply)
    )
  ) {
    return true
  }
  for (const entry of table) {
    if (isEmbedded(entry.id)) {
      if (isLimitedSupply(entry.id)) {
        return true
      }
    } else if (isReference(entry.id)) {
      if (isLimitedSupply(entry.id.lootTable)) {
        return true
      }
    }
  }
}

export function GetLoot<T>(
  table: LootTable<T>,
  options?: GetLootOptions<T>
): Loot<T> {
  return _GetLoot(table, options)
}

function _GetLoot<T>(
  table: LootTable<T>,
  options?: GetLootOptions<T>,
  depth: number = 0
): Loot<T> {
  if (!Array.isArray(table)) throw new Error('Not a loot table')
  if (depth > MAX_NESTED) throw new Error(`Too many nested loot tables`)
  const count = options?.count ?? 1
  if (isLimitedSupply(table)) {
    table = CloneLootTable(table)
  }
  const result = new Array<ILootItem<T>>()
  const groups = new Set()
  table.map((e) => {
    FillInLootEntryDefaults(e)
    groups.add(e.group)
  })
  const allEntries = table as Array<ILootTableEntry<T>>
  for (let pull = 0; pull < count; ++pull) {
    for (const groupID of groups) {
      const entries = allEntries.filter(
        (e) =>
          e.group === groupID &&
          (e.supply === undefined ||
            e.supply === null ||
            Number.isNaN(e.supply) ||
            e.supply > 0)
      )
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
      const range =
        entry.step === null || Number.isNaN(entry.step)
          ? entry.max - entry.min
          : Math.floor((entry.max - entry.min + entry.step) / entry.step)
      const rnd = Math.random()
      let quantity =
        entry.min +
        (entry.step === null || Number.isNaN(entry.step)
          ? rnd * range
          : Math.floor(rnd * range) * entry.step)
      if (quantity !== 0) {
        if (
          entry.supply !== undefined &&
          entry.supply !== null &&
          !Number.isNaN(entry.supply)
        ) {
          if (quantity > 0)
            quantity = quantity > entry.supply ? entry.supply : quantity
          entry.supply -= quantity
        }
        const nested = getNested(entry.id)
        if (nested) {
          for (let i = 0; i < quantity; i++) {
            const loot = _GetLoot(nested.lootTable, nested, ++depth)
            depth--
            MergeLoot(result, loot, options)
          }
        } else {
          if (entry.id !== null) {
            AddLoot(result, { id: entry.id as T, quantity }, options)
          }
        }
      }
    }
  }
  return result
}
