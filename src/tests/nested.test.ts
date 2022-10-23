import { mockRandomForEach } from "jest-mock-random"
import {
  GetLoot,
  Loot,
  LootTable,
  LootTableEntry,
  LootTableSummaryAsync,
} from "../loot-tables-advanced"
import { rnd } from "./random-table"

mockRandomForEach(rnd)

test("Nested Loot Tables", () => {
  const gems: LootTable = [
    LootTableEntry("pearl", 1, 5, 10, 1, 1),
    LootTableEntry("garnet", 1, 3, 12, 1, 1),
    LootTableEntry("ruby", 1, 4, 9, 1, 1),
    LootTableEntry("sapphire", 1, 1, 2, 1, 1),
  ]

  const treasure: LootTable = [
    LootTableEntry("@gems", 1, 0, 2, 1, 1),
    LootTableEntry("gold", 1, 15, 20, 1, 2),
  ]

  function ResolveHelper(id: string): LootTable | undefined {
    switch (id) {
      case "gems":
        return gems
      case "treasure":
        return treasure
    }
    return
  }

  const results: Array<Loot> = [
    [
      { id: "sapphire", quantity: 1 },
      { id: "garnet", quantity: 3 },
      { id: "gold", quantity: 19 },
    ],
    [{ id: "gold", quantity: 19 }],
    [
      { id: "sapphire", quantity: 1 },
      { id: "gold", quantity: 20 },
    ],
    [{ id: "gold", quantity: 15 }],
    [
      { id: "ruby", quantity: 4 },
      { id: "sapphire", quantity: 1 },
      { id: "gold", quantity: 19 },
    ],
    [
      { id: "pearl", quantity: 10 },
      { id: "gold", quantity: 16 },
    ],
  ]

  for (const result of results) {
    const loot = GetLoot(treasure, 1, ResolveHelper)
    // console.log('[')
    // for (let entry of loot) {
    //   console.log(`  {id: '${entry.id}', quantity: ${entry.quantity} },`)
    // }
    // console.log('],')
    expect(loot.length).toBe(result.length)
    for (let i = 0; i < loot.length; i++) {
      expect(loot[i].id).toBe(result[i].id)
      expect(loot[i].quantity).toBe(result[i].quantity)
    }
  }
})

test("Nested Loot Tables 2", () => {
  const gems: LootTable = [
    LootTableEntry("pearl", 1, 5, 10, 1, 1),
    LootTableEntry("garnet", 1, 3, 12, 1, 1),
    LootTableEntry("ruby", 1, 4, 9, 1, 1),
    LootTableEntry("sapphire", 1, 1, 2, 1, 1),
  ]

  const treasure: LootTable = [
    LootTableEntry("@gems", 1, 0, 2, 1, 1),
    LootTableEntry("gold", 1, 15, 20, 1, 2),
  ]

  // Test nested without resolver path
  treasure[0]._nested = gems;

  const results: Array<Loot> = [
    [
      { id: "sapphire", quantity: 1 },
      { id: "garnet", quantity: 3 },
      { id: "gold", quantity: 19 },
    ],
    [{ id: "gold", quantity: 19 }],
    [
      { id: "sapphire", quantity: 1 },
      { id: "gold", quantity: 20 },
    ],
    [{ id: "gold", quantity: 15 }],
    [
      { id: "ruby", quantity: 4 },
      { id: "sapphire", quantity: 1 },
      { id: "gold", quantity: 19 },
    ],
    [
      { id: "pearl", quantity: 10 },
      { id: "gold", quantity: 16 },
    ],
  ]

  for (const result of results) {
    const loot = GetLoot(treasure)
    // console.log('[')
    // for (let entry of loot) {
    //   console.log(`  {id: '${entry.id}', quantity: ${entry.quantity} },`)
    // }
    // console.log('],')
    expect(loot.length).toBe(result.length)
    for (let i = 0; i < loot.length; i++) {
      expect(loot[i].id).toBe(result[i].id)
      expect(loot[i].quantity).toBe(result[i].quantity)
    }
  }
})
test("Summarize Loot Tables", async () => {
  const gems: LootTable = [
    LootTableEntry("pearl", 1, 5, 10, 1, 1),
    LootTableEntry("garnet", 1, 3, 12, 1, 1),
    LootTableEntry("ruby", 1, 4, 9, 1, 1),
    LootTableEntry("sapphire", 1, 1, 2, 1, 1),
    LootTableEntry("gold", 1, 0, 1, 1, 1),
  ]

  const treasure: LootTable = [
    LootTableEntry(null, 1, 1, 1, 1, 1),
    LootTableEntry("@gems", 1, 0, 2, 1, 1),
    LootTableEntry("gold", 1, 15, 20, 1, 2),
  ]

  async function ResolveHelperAsync(
    id: string
  ): Promise<LootTable | undefined> {
    switch (id) {
      case "gems":
        return gems
      case "treasure":
        return treasure
    }
    return
  }

  // const summary = await LootTableSummaryAsync(treasure, ResolveHelperAsync)
  // for (const entry of summary) {
  //   console.log(`${entry.id}\t${entry.min}\t${entry.max}`)
  // }
})
