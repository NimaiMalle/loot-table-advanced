import { mockRandomForEach } from 'jest-mock-random'
import {
  GetLoot,
  Loot,
  LootTable,
  LootTableEntry,
} from '../loot-tables-advanced'
import { rnd } from './random-table'

mockRandomForEach(rnd)

interface MyLoot {
  name: string;
  uniqueIds: Array<string>;
}

test('Complex Type Test', () => {
  const coin1: MyLoot = {name: 'coin', uniqueIds: ['d58sv0xb2p']};
  const coin2: MyLoot = {name: 'coin', uniqueIds: ['c69q1mb1qa']};
  const wood: MyLoot = {name: 'wood', uniqueIds: ['oyw25kpk3u']};
  const crate_1: LootTable<MyLoot> = [
    {group:1, id:coin1, weight:5, min:25, max:100, step:25},
    {group:1, id:null},
    {group:2, id:coin2, weight:5, min:25, max:100, step:25},
    {group:2, id:null},
    {group:3, id:wood, weight:5, min:40, max:50, step:5},
    {group:3, id:null, weight:5},
  ]
  const results: Array<Loot<MyLoot>> = [
    [{ id: { name: 'wood', uniqueIds: ['oyw25kpk3u'] }, quantity: 40 }],
    [
      { id: { name: 'coin', uniqueIds: ['d58sv0xb2p'] }, quantity: 75 },
      { id: { name: 'wood', uniqueIds: ['oyw25kpk3u'] }, quantity: 50 },
    ],
    [{ id: { name: 'coin', uniqueIds: ['d58sv0xb2p'] }, quantity: 50 }],
    [
      {
        id: { name: 'coin', uniqueIds: ['d58sv0xb2p', 'c69q1mb1qa'] },
        quantity: 50,
      },
      { id: { name: 'wood', uniqueIds: ['oyw25kpk3u'] }, quantity: 50 },
    ],
    [
      {
        id: { name: 'coin', uniqueIds: ['d58sv0xb2p', 'c69q1mb1qa'] },
        quantity: 25,
      },
    ],
  ]
  for (const result of results) {
      const loot = GetLoot(crate_1,{
        equals: (a,b) => {
          return a?.name === b?.name
        },
        assign: (a,b) => {
          if (a?.uniqueIds && b?.uniqueIds) {
            for(const id of b.uniqueIds) {
              if (!a.uniqueIds.includes(id)) {
                a.uniqueIds.push(id)
              }
            }
          }
          return a
        }
      })
    // console.log('[')
    // for (const entry of loot) {
    //   console.log(`  {id: { name: '${entry.id?.name}', uniqueIds: ['${entry.id ? Array.from(entry.id.uniqueIds).join("','") : ''}']}, quantity: ${entry.quantity} },`)
    // }
    // console.log('],')
    expect(loot.length).toBe(result.length)
    for (let i = 0; i < loot.length; i++) {
      expect(loot[i].id?.name).toBe(result[i].id?.name)
      expect(loot[i].id?.uniqueIds?.toString()).toBe(result[i].id?.uniqueIds?.toString())
      expect(loot[i].quantity).toBe(result[i].quantity)
    }
  }
})
