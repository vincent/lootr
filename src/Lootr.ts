import { Clean } from './Clean';
import { IsFunction } from './IsFunction';
import { IsString } from './IsString';
import { ILootr, Item, LootTable, Modifier, Nesting, Threshold } from './types';

export class Lootr {
  name: string;
  items: Item[];
  branches: Record<string, InstanceType<typeof Lootr>>;
  branchNames: string[];
  modifiers: Modifier[];

  constructor(name: string = 'root') {
    this.name = Clean(name);
    if (this.name.indexOf('/') > -1) {
      throw new Error('specified name should not contain a / separator');
    }

    this.items = [];
    this.branches = {};
    this.branchNames = [];
    this.modifiers = [];
  }

  /**
   * Return a random number in the specified range.
   * This method is meant to be use internaly.
   *
   * @param  {string} range x-y
   *
   * @return {number} Random number in range
   */
  randomInRange(range) {
    let bounds = range.split('-');

    switch (bounds.length) {
      case 0:
        bounds = [0, 5];
        break;
      case 1:
        bounds = [bounds[0], parseInt(bounds[0], 0) + 5];
        break;
      default:
        bounds = [bounds[0], bounds[bounds.length - 1]];
    }

    bounds[0] = parseInt(bounds[0], 0);
    bounds[1] = parseInt(bounds[1], 0);

    return Math.floor(Math.random() * (bounds[1] - bounds[0] + 1)) + bounds[0];
  }

  /**
   * Add an item in that branch, or the nested branch specified
   *
   * @param {object} item    Item to add
   * @param {string} catalog Path to branch (or top level if null)
   *
   * @return {Lootr} The current branch
   */
  add(item: Item, path?: string) {
    if (path === undefined) {
      this.items.push(item);
    } else {
      const branch = this.branch(path);
      branch.items.push(item);
    }

    return this;
  }

  /**
   * Return or create a new branch under the current one
   *
   * @param  {string} name Branch name
   *
   * @return {Lootr}       The branch
   */
  branch(name: string) {
    return this.getBranch(name, true);
  }

  /**
   * Return or create a new branch under the current one
   *
   * @param  {string}  name   Branch name
   * @param  {boolean} create If true, and the specified branch does not exist, create one
   *
   * @return {Lootr}       The branch
   */
  getBranch(name: string, create?: boolean): InstanceType<typeof Lootr> {
    const path = Clean(name).split('/').filter(Boolean);

    if (!path.length) return this;

    // if the asked branch does not begin with the current branch
    // neither a first-level branch
    // and we've been asked to create
    // => create the asked branch
    if (!this.branches[path[0]] && path[0] != this.name && create) {
      this.branchNames.push(path[0]);
      this.branches[path[0]] = new Lootr(path[0]);
    }

    // get a branch at current level
    if (path.length === 1) {
      return path[0] === this.name ? this : this.branches[path[0]];

      // or nested
    } else if (path.length > 1) {
      const head = path.shift();
      const newPath = path.join('/');

      if (this.branches[head]) {
        return this.branches[head].getBranch(newPath, create);
      }

      if (create) {
        this.branchNames.push(head);
        this.branches[head] = new Lootr(head);
        return this.branches[head].getBranch(newPath, create);
      }
    }
  }

  /**
   * Return all items in the current and nested branchs
   *
   * @return {array} Array of items
   */
  allItems() {
    return this.branchNames.reduce((results, branchName) => {
      return [...results, ...this.branches[branchName].allItems()];
    }, this.items.slice());
  }

  /**
   * Randomly pick an item.
   *
   * @param  {int}   allowedNesting Depth limit
   * @param  {float} threshold      Chances (0-1) we go deeper
   *
   * @return {object}               Picked item
   */
  randomPick(allowedNesting: number, threshold: number = 1): Item {
    const chance = Math.random() < threshold;
    const shouldPickFromHere = chance && this.items.length > 0;
    const fromHere =
      shouldPickFromHere && this.items[~~(Math.random() * this.items.length)];

    const fromBelow =
      (allowedNesting > 0 &&
        this.branchNames
          .reduce((results: Item[], branchName) => {
            return [
              ...results,
              Math.random() <= threshold &&
                this.branches[branchName].randomPick(
                  allowedNesting - 1,
                  threshold - Math.random() / allowedNesting
                ),
            ];
          }, [])
          .filter(Boolean)) ||
      [];

    const picked = [fromHere, ...fromBelow].filter(Boolean);

    return (picked.length && picked[~~(Math.random() * picked.length)]) || null;
  }

  /**
   * Randomly pick an item from the specified branch
   *
   * @param  {string} catalogPath    Branch to get an item from
   * @param  {int}    allowedNesting Depth limit
   * @param  {float}  threshold      Chances (0-1) we go deeper
   *
   * @return {object}                Picked item
   */
  roll(catalogPath: string, nesting?: Nesting, threshold?: Threshold) {
    const branch = this.getBranch(catalogPath);

    return branch.randomPick(
      nesting,
      threshold === undefined ? 1.0 : threshold
    );
  }

  /**
   * Roll against a looting table
   *
   * @param  {array} drops Loot table
   * ```[ {from: '/equipment',         depth:Infinity, luck:1.0, stack:1 },
   *      {from: '/equipment/armor',   depth:Infinity, luck:0.5, stack:2 },
   *      {from: '/equipment/weapons', depth:Infinity, luck:0.8, stack:'2-10' } ]
   * ```
   *
   * @return {array}       Array of items
   */
  loot(drops: LootTable) {
    return drops.reduce((results, drop) => {
      const item = this.roll(drop.from, drop.depth || Infinity, drop.luck);
      if (!item) return results;

      const stack = !drop.stack
        ? 1
        : drop.stack.toString().indexOf('-') > -1
        ? this.randomInRange(drop.stack)
        : drop.stack;

      return [
        ...results,
        ...Array.from(Array(stack)).map(() => {
          const cloned = Object.assign({}, item);
          // handle modifiers
          if (drop.modify) {
            const modifier =
              this.modifiers[~~(Math.random() * this.modifiers.length)];

            if (modifier) {
              this.modify(cloned, modifier);
            }
          }

          return cloned;
        }),
      ];
    }, []);
  }

  /**
   * Add modifiers.
   *
   * @param {array} modifiers List of strings like [ 'from the shadows', '$name of the sun', 'Golden $name' ]
   */
  setModifiers(modifiers: Modifier[]) {
    this.modifiers = modifiers;
  }

  /**
   * Add modifiers.
   *
   * @param {array} modifiers List of strings like [ 'from the shadows', '$name of the sun', 'Golden $name' ]
   */
  addModifier(...modifiers: Modifier[]) {
    this.modifiers = [...(this.modifiers || []), ...modifiers];
  }

  /**
   * Returns a new name from the given item.
   *
   * @param  {object} item An item
   *
   * @return {string}      A modified name, assuming there are modifiers available
   */
  modify(item, modifier: Modifier) {
    const cloned = Object.assign({}, modifier);

    // we have a name modifier
    if (cloned.name) {
      // modifier is a regexp
      if (cloned.name.indexOf('$') > -1) {
        item.name = cloned.name
          // replace property names
          .replace(/(\$\w+)/g, this.modifyNameReplace.bind(item))
          // in case we don't have the replacement name
          .replace('  ', ' ')
          // clean
          .trim();

        // modifier is a simple suffix
      } else {
        item.name += ' ' + cloned.name;
      }

      delete cloned.name;
    }

    // all other modifiers
    for (const key in cloned) {
      const propModifier = cloned[key];

      // function giver
      if (IsFunction(propModifier)) {
        item[key] = propModifier(item);

        // math expression given
      } else if (
        IsString(propModifier) &&
        propModifier.match(/^[\*\+\-\/]\d+$/)
      ) {
        try {
          item[key] = Math.max(
            0,
            eval((propModifier || 0) + ' ' + propModifier)
          );
        } catch (e) {}

        // range given
      } else {
        item[key] = this.randomInRange(propModifier);
      }
    }
  }

  modifyProps(item, modifier: Modifier) {
    return {};
  }

  /**
   * Return the replacement for the given match.
   *
   * @param  {string} match Matched token
   *
   * @return {return}       A replacement string
   */
  modifyNameReplace(match) {
    // `this` is the current item to modify
    return (this[match.substr(1)] || '').toLowerCase();
  }
}
