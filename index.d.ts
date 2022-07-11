export default class Lootr {
    constructor(name: string);

    clean(path?: string): string;
    randomInRange(range: Range): number;
    add(item: Item, path?: string): Lootr;
    branch(name: string): Lootr;
    getBranch(name: string, create?: boolean): Lootr;
    allItems(): Item[];
    randomPick(allowedNesting: number, threshold?: number): Item;
    roll(catalogPath: string, nesting?: number, threshold?: number): Item;
    loot(drops: Drop[]): Item[];
    setModifiers(modifiers: Modifier[]): void;
    addModifiers(modifiers: Modifier[]): void;
    modify(item: Item, modifier: Modifier): void;
    modifyNameReplace(match: string): string;
}

interface Item {
    [key: string]: any;
    name: string;
}

interface Drop {
    from: string,
    depth: number,
    luck: number,
    stack: number | Range,
    modify: true
}

interface Modifier {
    [key: string]: string | number | Range | ModifierExpression;
    name: string;
}

type Range = `${number}-${number}`;
type ModifierExpression = `+${number}` | `-${number}` | `*${number}` | `/${number}`;

