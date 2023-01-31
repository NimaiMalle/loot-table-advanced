# Loot Tables Advanced 2

Loot Tables are lists of items, quantities, and probabilities, used to create random outcomes for games. This Loot Table specification is both simple and expressive, able to power anything from random card packs to monster spawns to crate drops.

![alt text](https://imagizer.imageshack.com/img923/6782/iKF2sN.png)

## Loot Tables

Loot Tables are arrays of Loot Table Entries, described below.  Loot Table Entries may be nested, containing other loot tables.

## Loot Table Entry

- `id` : T - your item type, or another loot table array (more info below)
- `min` : number - minimum quantity to produce
- `max` : number - maximum quantity to produce
- `step` : int - quantity will be in increments of this amount, or NaN or null for non-integer values
- `group` : int - entries may be grouped (see crate_1 example below)
- `weight` : int - the relative probability of for this entry
- `supply` : int - optional limited supply of this item, when doing multiple draws

The `id` may be a string that you use to look up an object in your game or application, and that's the default type for id: string.  However you may specify other types in TypeScript such as enums, branded types, complex objects, or even classes.

# The GetLoot Function

The main function of this library is the `GetLoot` function.  You pass it a Loot Table (array of entries) and it will drop some random loot!

GetLoot function declaration

### TypeScript
```TypeScript
function GetLoot<T>(table: LootTable<T>, options?: GetLootOptions<T>): Loot<T>
```

## GetLoot options

The options object may contain the following fields:
 * `count` - how many times to draw from this loot table (results will be combined)
 * `equals` - (advanced) when your id uses a non-primitive type, you can supply your own equality function, with the default being the JavaScript === operator
 * `assign` - (advanced) when your id uses a non-primitive type, this function is used to combine two ids into one, when consolidating output, with the default being just to use "a" when combining "a" and "b"

### TypeScript options definition
```TypeScript
type GetLootOptions<T> = {
    count?: number;
    equals?: (a: T | null, b: T | null) => boolean;
    assign?: (a: T | null, b: T | null) => T | null;
}
```

# Stupid Simple Example

This simple, one-item Loot Table will always produce one "coin". The default value for all of the numeric properties is 1.

| ID     | Weight | Min | Max | Step | Group |
| ------ | ------ | --- | --- | ---- | ----- |
| `coin` | 1      | 1   | 1   | 1    | 1     |


### TypeScript
```TypeScript
const simple: LootTable = [ { id: 'coin' } ]
let loot = GetLoot(simple) // loot = [{ id: 'coin', quantity: 1 }]
```

# Groups, nulls, and Quantities Example

This more complex Loot Table has two Groups.
One entry will be chosen per Group. Entries with a `null` id drop nothing.

In this exampole, Group 1 has a total weight of 14, so Group 1 has a 10-in-14 chance of dropping **coin**. If the coin entry is selected, it will drop 50, 75, or 100 units of coin, due to how Min, Max, and Step are specified.

Group 2 has a total weight of 10, and since **cloth** and `null` both have a weight of 5, there's a 50/50 chance that Group 2 will drop nothing. If the cloth entry is selected, it will drop 40, 45, or 50 units of cloth.

Overall, this Loot Table may drop:
 * nothing at all
 * some coin
 * some cloth
 * or some of both

| ID      | Weight | Min | Max | Step | Group |
| ------- | ------ | --- | --- | ---- | ----- |
| `coin`  | 10     | 50  | 100 | 25   | 1     |
| `null`  | 4      | 0   | 0   | 1    | 1     |
| `cloth` | 5      | 40  | 50  | 5    | 2     |
| `null`  | 5      | 0   | 0   | 1    | 2     |

The code examples show the use of the `LootTableEntry` helper function, which performs error checking on the inputs and returns a valid object.

### TypeScript
```TypeScript
const crate_1: LootTable = [
  {group:1, id:'coin', weight:10, min:50, max:100, step:25},
  {group:1, id: null,  weight:4 },
  {group:2, id:'wood', weight:5,  min:40, max:50,  step:5 },
  {group:2, id: null,  weight:5 },
]
let loot = GetLoot(crate_1)
```

# Nested Loot Tables

A Loot Table Entry `id` may specify your Item Type or be another Loot Table (array of Entries). The only restriction is that such nested Loot Tables may not create a circular reference!

There are three valid values for `id`:
* Your type `T`, which defaults to a string
* A loot table of type `T`
* An `object` with a `lootTable` field, a `count` field

## gems and treasure example

### `gems`

| ID         | Weight | Min | Max | Step | Group |
| ---------- | ------ | --- | --- | ---- | ----- |
| `pearl`    | 1      | 5   | 10  | 1    | 1     |
| `garnet`   | 1      | 3   | 12  | 1    | 1     |
| `ruby`     | 1      | 4   | 9   | 1    | 1     |
| `sapphire` | 1      | 1   | 2   | 1    | 1     |

### `treasure`

| ID      | Weight | Min | Max | Step | Group |
| ------- | ------ | --- | --- | ---- | ----- |
| -> gems | 1      | 0   | 2   | 1    | 1     |
| `gold`  | 1      | 15  | 20  | 1    | 2     |

The `treasure` Loot Table will always drop 15 to 20 gold, plus zero, one, or two drops from the `gems` table.

### TypeScript
```TypeScript
const gems: LootTable = [
  {id:'pearl', min:5, max:10, group:1},
  {id:'garnet', min:3, max:12, group:1},
  {id:'ruby', min:4, max:9, group:1},
  {id:'sapphire', max:2, group:1},
]

const treasure: LootTable = [
  {id: gems, min:0, max:2, group:1},
  {id:'gold', min:15, max:20, group:2},
]

let loot = GetLoot(treasure, 1, ResolveHelper)
```

# Multiple Items Without Replacement

To simulate something like, "draw two cards", where you can't get the same item twice, the Loot Table Advanced 2 item definition may optionaly specify a `supply`.  When there is a specific, limited supply, and requesting more than one pull from a single call to `GetLoot`, the supply is reduced by the number of the item produced each time.  Note that the original definition of the loot table is not modified.  If you want two unque cards, for example, you must call `GetLoot` once with a count of 2.

| ID    | Weight | Min | Max | Step | Group | Supply |
| ----- | ------ | --- | --- | ---- | ----- | ------ |
| ace   | 1      | 1   | 1   | 1    | 1     | 1      |
| king  | 1      | 1   | 1   | 1    | 1     | 1      |
| queen | 1      | 1   | 1   | 1    | 1     | 1      |
| jack  | 1      | 1   | 1   | 1    | 1     | 1      |

`GetLoot('cards', {count: 2})` will get two distinct cards, since the supply of each card in the table is 1. Within the one call, each time a random entry is selected, it's Supply is decremented, preventing it from being selected again.
`GetLoot('cards_chips')` will yield between 10 and 50 chips, in multiples of 5, and 2 unique cards from the cards table.

### TypeScript
```TypeScript
const cards: LootTable = [
  {id:('ace'},
  {id:('king'},
  {id:('queen'},
  {id:('jack'},
]
const cards_chips: LootTable = [
  {id:'chips', min:10, max:50, step:5, group:1},
  {id: cards, group:2},
]
let loot = GetLoot(cards_chips, 1, (id) => (id == 'cards' ? cards : null))
```

To reference another Loot Table, and specify a **count**, follow the `@id` with the count in parenthesis `(n)`, for example:
`@cards(2)`

### Loot Table Entry Type
The various Loot Table interfaces and functions take an optional generic type `T` that defaults to string. In your project, if you have a type that defines valid item ids, you should supply that to preserve the typing throughout.
Advanced Usage: You may also supply custom comparison and assignment functions for your custom type.

# Serializing and Storing Loot Table Data
Since a Loot Table id might contain a nested data structure, if your game or application is storing a collection of Loot Tables, you may want to store nested references by id, instead of embedding them.

For example, V1 of this library supported nested Loot Tables using an at-symbol `@` prefix convention.  If your stored data uses a convention like this, that works well for storage.  For processing, you'll need to convert the Loot Table name references with the Loot Table object before calling `GetLoot`, etc.

# Summarize a Loot Table
With nested loot tables, and data-driven design, it can be hard to tell what a loot table might drop. To get a flattened summary of a loot table, with just the `id`, `min`, and `max` properties, but no nested references, there is a helper function called `LootTableSummary`.

Call LootTableSummary to see what the possible yields are from a loot table. Entry "supply" is not taken into account. The summarization process basically combines groups by taking the smallest min and largest max of the group, then sums mins and maxes across groups.
