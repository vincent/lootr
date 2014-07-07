Lootr
=====

A simple rpg-like looting system.
Heavily inspired from http://journal.stuffwithstuff.com/2014/07/05/dropping-loot

![Lootr !](./vendor/loutre.jpg)

Adding items
=====

Lootr is organized as a tree. Get a new instance with

```javascript
var loot = new Lootr('/equipment')
```

Each level is composed by a list of items in `loot.items` and nested branchs in `loot.branchs`.

Organize the loot repository by adding branchs

```javascript
loot.branch('weapons')
loot.branch('armor')
```

The `branch` method return itself, on which you can `add` items or add nested branchs.

```javascript
loot.add({ name: 'Stuff' })

loot.branch('/equipment/weapons')
    .add({ name: 'Pistol' })
    .branch('automatic')
        .add({ name: 'Uzi' })

loot.branch('/equipment/armor')
    .add({ name: 'Plates' })
    .add({ name: 'Leather' })
```

Looting items
=====

Loot something at top level with `Lootr.roll( path, depth = 0, chance = 1 )`

It will yield an item in the `path` branch or, if `depth` is given, in an up to `depth` deep branchs, if the depth-decreasing `chance` is greater than a `Math.random()`

```javascript
// Loot something from top level
loot.roll('/equipment')                        // only 'Stuff'

// Loot something from anywhere
loot.roll('/equipment', Infinity, Infinity)    // any item

// Loot an armor
loot.roll('/equipment/armor')                  // one of [ 'Plates', 'Leather' ]

// Loot a weapon
loot.roll('/equipment/weapons', 3)             // one of [ 'Pistol', 'Uzi' ]

```


Tests
=====

A simple test suite is available [here](./test.html)

It also works with `npm test`
