# Loot Tables Advanced

Loot Tables are lists of items, quantities, and probabilities, used to create random outcomes for games. This Loot Table specification is both simple and expressive, able to power anything from random card packs to monster spawns to crate drops.

![alt text](https://imagizer.imageshack.com/img923/6782/iKF2sN.png)

## Loot Tables

Loot Tables have an ID, and a list of entries.

## Loot Table Entry

- `ItemID` or `@TableID` : string
- `Min` : int - minimum quantity to produce
- `Max` : int - maximum quantity to produce
- `Step` : int - quantity will be in increments of this amount
- `Group` : int - entries may be grouped (see crate_1 example below)
- `Weight` : int.- the relative probability of for this entry

# Examples:

## simplest_loot example

This simple, one-item Loot Table will always produce "50 coin".

| ID     | Min | Max | Step | Group | Weight |
| ------ | --- | --- | ---- | ----- | ------ |
| `coin` | 50  | 50  | 1    | 1     | 100    |

## crate_1 example

This more complex Loot Table has two Groups.
One row will be chosen per Group to produce. Rows with a null ID produce nothing.
Group 1 has a total weight of 14, so Group 1 has a 10-in-14 chance of producing from the **coin** row. If the coin row is selected, it will produce 50, 75, or 100 units of coin, due to how Min, Max, and Step are specified.
Group 2 has a total weight of 10, and since **cloth** and null both have a weight of 5, there's a 50/50 chance that Group 2 will produce nothing. If the cloth row is selected, it will produce 40, 45, or 50 units of cloth.
Overall, this Loot Table may produce nothing at all, some coin, some cloth, or some of both.

| ID      | Min | Max | Step | Group | Weight |
| ------- | --- | --- | ---- | ----- | ------ |
| `coin`  | 50  | 100 | 25   | 1     | 10     |
| `null`  | 0   | 0   | 1    | 1     | 4      |
| `cloth` | 40  | 50  | 5    | 2     | 5      |
| `null`  | 0   | 0   | 1    | 2     | 5      |

# Nested Loot Tables

A Loot Table Entry may specify an Item ID, as in the examples above, or an Entry may specify the ID of another Loot Table to generate items from. The only restriction is that Loot Table references may not create a circular reference.
To differentiate Item ID from Loot Table ID, an `@` character is used to prefix the Loot Table IDs.

## gems and treasure example

### `gems`

| ID         | Min | Max | Step | Group | Weight |
| ---------- | --- | --- | ---- | ----- | ------ |
| `pearl`    | 5   | 10  | 1    | 1     | 1      |
| `garnet`   | 3   | 12  | 1    | 1     | 1      |
| `ruby`     | 4   | 9   | 1    | 1     | 1      |
| `sapphire` | 1   | 2   | 1    | 1     | 1      |

### `treasure`

| ID      | Min | Max | Step | Group | Weight |
| ------- | --- | --- | ---- | ----- | ------ |
| `@gems` | 0   | 2   | 1    | 1     | 1      |
| `gold`  | 15  | 20  | 1    | 2     | 1      |

The `treasure` Loot Table will always give you 15 to 20 gold, and zero, one, or two results from the `gems` table.

# Multiple Items Without Replacement

To simulate something like, "draw two cards", where you can't get the same item twice, the Loot Table Advanced `GetLoot` allows the caller to specify a `count`. The count defaults to 1. Pass in a count of 2 or more, and the Loot Table will be processed multiple times, each time decrementing the Weight of the row selected.

| ID    | Min | Max | Step | Group | Weight |
| ----- | --- | --- | ---- | ----- | ------ |
| ace   | 1   | 1   | 1    | 1     | 1      |
| king  | 1   | 1   | 1    | 1     | 1      |
| queen | 1   | 1   | 1    | 1     | 1      |
| jack  | 1   | 1   | 1    | 1     | 1      |

`GetLoot('cards',2)` will get two distinct cards, since the Weight of each card in the table is 1. Within the one call, each time a random row is selected, it's Weight is decremented, preventing it from being selected again.

## Nesting Without Replacement

To reference another Loot Table, and specify a **count**, follow the `@id` with the count in parenthesis `(n)`, for example:
`@cards(2)`
