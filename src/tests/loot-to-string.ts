import { Loot } from '../loot-tables-advanced'

export function LootToString(loot: Loot): string {
  let lootMessage = ''
  loot.forEach(
    (e) =>
      (lootMessage +=
        e.id == null
          ? ''
          : `${lootMessage ? ', ' : ''}${
              e.quantity > 1 ? e.quantity + ' ' : ''
            }${e.id}`)
  )
  return lootMessage
}
