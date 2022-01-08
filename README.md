# Loot Tables Advanced

Loot Tables are lists of items, quantities, and probabilities, used to create random outcomes for games. This Loot Table specification is both simple and expressive, able to power anything from random card packs to monster spawns to crate drops.

![alt text](https://imagizer.imageshack.com/img923/6782/iKF2sN.png)

## Loot Tables

Loot Tables have an ID, and a list of entries.

### Loot Table Item type

The various Loot Table interfaces and functions take an optional generic type T that defaults to string. In your project, if you have an enum that defines valid item ids, you should supply that enum as your T parameter to preserve the typing throughout.

## Loot Table Entry

- `ItemID` or `@TableID` : T extends string
- `Min` : number - minimum quantity to produce
- `Max` : number - maximum quantity to produce
- `Step` : int - quantity will be in increments of this amount, or NaN for non-integer decimal values
- `Group` : int - entries may be grouped (see crate_1 example below)
- `Weight` : int - the relative probability of for this entry
- `Transform` : function - optional transform

The optional transform function takes a number between 0.0 and 1.0 and should usually return a value between 0.0 and 1.0 as well. This can be used to do things like apply an [easing function](https://www.npmjs.com/package/bezier-easing) to the random number used to pick the value between Min and Max. The transformed value is not validated, so user beware. If you return a value below zero or above one, then you will get an output outside of your specified Min or Max.

# Stupid Simple Example

This simple, one-item Loot Table will always produce "1 coin". The default value for all of the numeric properties is 1.

| ID     | Weight | Min | Max | Step | Group |
| ------ | ------ | --- | --- | ---- | ----- |
| `coin` | 1      | 1   | 1   | 1    | 1     |

### JavaScript

```JavaScript
const simple = [ { id: 'coin' } ];
let loot = GetLoot(simple);
```

### TypeScript

```TypeScript
const simple: LootTable = [ { id: 'coin' } ]
let loot = GetLoot(simple)
```

# Groups, nulls, and Quantities Example

This more complex Loot Table has two Groups.
One entry will be chosen per Group to produce. Entries with a null ID produce nothing.
Group 1 has a total weight of 14, so Group 1 has a 10-in-14 chance of producing from the **coin** entry. If the coin entry is selected, it will produce 50, 75, or 100 units of coin, due to how Min, Max, and Step are specified.
Group 2 has a total weight of 10, and since **cloth** and null both have a weight of 5, there's a 50/50 chance that Group 2 will produce nothing. If the cloth entry is selected, it will produce 40, 45, or 50 units of cloth.
Overall, this Loot Table may produce nothing at all, some coin, some cloth, or some of both.

| ID      | Weight | Min | Max | Step | Group |
| ------- | ------ | --- | --- | ---- | ----- |
| `coin`  | 10     | 50  | 100 | 25   | 1     |
| `null`  | 4      | 0   | 0   | 1    | 1     |
| `cloth` | 5      | 40  | 50  | 5    | 2     |
| `null`  | 5      | 0   | 0   | 1    | 2     |

The code examples show the use of the `LootTableEntry` helper function, which performs error checking on the inputs and returns a valid object.

### JavaScript

```JavaScript
const crate_1 = [
    LootTableEntry('coin', 10, 50, 100, 25, 1),
    LootTableEntry(null, 4, 1, 1, 1, 1),
    LootTableEntry('wood', 5, 40, 50, 5, 2),
    LootTableEntry(null, 5, 1, 1, 1, 2),
];
let loot = GetLoot(crate_1);
```

### TypeScript

```TypeScript
const crate_1: LootTable = [
  LootTableEntry('coin', 10, 50, 100, 25, 1),
  LootTableEntry(null, 4, 1, 1, 1, 1),
  LootTableEntry('wood', 5, 40, 50, 5, 2),
  LootTableEntry(null, 5, 1, 1, 1, 2),
]
let loot = GetLoot(crate_1)
```

# Nested Loot Tables

A Loot Table Entry may specify an Item ID, as in the examples above, or an Entry may specify the ID of another Loot Table to generate items from. The only restriction is that Loot Table references may not create a circular reference.
To differentiate Item ID from Loot Table ID, an `@` character is used to prefix the Loot Table IDs.

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
| `@gems` | 1      | 0   | 2   | 1    | 1     |
| `gold`  | 1      | 15  | 20  | 1    | 2     |

The `treasure` Loot Table will always give you 15 to 20 gold, and zero, one, or two results from the `gems` table.

### JavaScript

```JavaScript
const gems = [
    LootTableEntry('pearl', 1, 5, 10, 1, 1),
    LootTableEntry('garnet', 1, 3, 12, 1, 1),
    LootTableEntry('ruby', 1, 4, 9, 1, 1),
    LootTableEntry('sapphire', 1, 1, 2, 1, 1),
];
const treasure = [
    LootTableEntry('@gems', 1, 0, 2, 1, 1),
    LootTableEntry('gold', 1, 15, 20, 1, 2),
];
function ResolveHelper(id) {
    switch (id) {
        case 'gems':
            return gems;
        case 'treasure':
            return treasure;
    }
    return null;
}
let loot = GetLoot(treasure, 1, ResolveHelper);
```

### TypeScript

```TypeScript
const gems: LootTable = [
  LootTableEntry('pearl', 1, 5, 10, 1, 1),
  LootTableEntry('garnet', 1, 3, 12, 1, 1),
  LootTableEntry('ruby', 1, 4, 9, 1, 1),
  LootTableEntry('sapphire', 1, 1, 2, 1, 1),
]

const treasure: LootTable = [
  LootTableEntry('@gems', 1, 0, 2, 1, 1),
  LootTableEntry('gold', 1, 15, 20, 1, 2),
]

function ResolveHelper(id: string): LootTable | null {
  switch (id) {
    case 'gems':
      return gems
    case 'treasure':
      return treasure
  }
  return null
}

let loot = GetLoot(treasure, 1, ResolveHelper)
```

# Multiple Items Without Replacement

To simulate something like, "draw two cards", where you can't get the same item twice, the Loot Table Advanced `GetLoot` allows the caller to specify a `count`. The count defaults to 1. Pass in a count of 2 or more, and the Loot Table will be processed multiple times, each time decrementing the Weight of the entry selected.

| ID    | Weight | Min | Max | Step | Group |
| ----- | ------ | --- | --- | ---- | ----- |
| ace   | 1      | 1   | 1   | 1    | 1     |
| king  | 1      | 1   | 1   | 1    | 1     |
| queen | 1      | 1   | 1   | 1    | 1     |
| jack  | 1      | 1   | 1   | 1    | 1     |

`GetLoot('cards',2)` will get two distinct cards, since the Weight of each card in the table is 1. Within the one call, each time a random entry is selected, it's Weight is decremented, preventing it from being selected again.
`GetLoot('cards_chips')` will yield between 10 and 50 chips, in multiples of 5, and 2 unique cards from the cards table.

### JavaScript

```JavaScript
const cards = [
    LootTableEntry('ace'),
    LootTableEntry('king'),
    LootTableEntry('queen'),
    LootTableEntry('jack'),
];
const cards_chips = [
    LootTableEntry('chips', 1, 10, 50, 5, 1),
    LootTableEntry('@cards(2)', 1, 1, 1, 1, 2),
];
let loot = GetLoot(cards_chips, 1, (id) => (id == 'cards' ? cards : null));
```

### TypeScript

```TypeScript
const cards: LootTable = [
  LootTableEntry('ace'),
  LootTableEntry('king'),
  LootTableEntry('queen'),
  LootTableEntry('jack'),
]
const cards_chips: LootTable = [
  LootTableEntry('chips', 1, 10, 50, 5, 1),
  LootTableEntry('@cards(2)', 1, 1, 1, 1, 2),
]
let loot = GetLoot(cards_chips, 1, (id) => (id == 'cards' ? cards : null))
```

To reference another Loot Table, and specify a **count**, follow the `@id` with the count in parenthesis `(n)`, for example:
`@cards(2)`

# Summarize a Loot Table

With nested loot tables, and data-driven design, it can be hard to tell what might this loot table yield. To get a flattened summary of a loot table, with just the `id`, `min`, and `max` properties, but no nested references, there is a helper function called `LootTableSummaryAsync`.

Call LootTableSummaryAsync to see what the possible yields are from a loot table. It does not evaluate groups, so the results don't tell you whether it's possible to get all items at once, but for any given item, it gives a theoretical range of what might be produced.
