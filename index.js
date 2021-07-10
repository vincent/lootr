/*!
 * lootr
 * https://github.com/vincent/lootr
 *
 * Copyright 2014 Vincent Lark
 * Released under the MIT license
 */
/*jshint onevar: false, indent:4, strict: false */
/*global module, define */
(function () {

     // global on the server, window in the browser
    var root = this;

    /**
     * Get a new branch
     *
     * @param {string} name Name of that branch
     */
    function Lootr(name) {

        name = name || 'root';
        name = this.clean(name);

        if (name.indexOf('/') > -1) {
            throw new Error('specified name should not contain a / separator');
        }

        this.name        = name;
        this.items       = [];
        this.branchs     = {};
        this.branchNames = [];
        this.modifiers   = [];
    }

    /**
     * Clean a path, trim left and right / characters.
     * This method is meant to be use internaly.
     *
     * @param  {string} path Path to cleanup
     *
     * @return {string}      A cleaned path
     */
    Lootr.prototype.clean = function(path) {
        return path.replace(/^\//g, '').replace(/\/$/g, '');
    };

    /**
     * Return a random number in the specified range.
     * This method is meant to be use internaly.
     *
     * @param  {string} range x-y
     *
     * @return {number} Random number in range
     */
    Lootr.prototype.randomInRange = function(range) {
        var bounds = range.split('-');

        switch (bounds.length) {
            case 0:
                bounds = [ 0, 5 ];
                break;
            case 1:
                bounds = [ bounds[0], parseInt(bounds[0],0) + 5 ];
                break;
            default:
                bounds = [ bounds[0], bounds[bounds.length - 1] ];
        }

        bounds[0] = parseInt(bounds[0], 0);
        bounds[1] = parseInt(bounds[1], 0);

        return Math.floor(Math.random() * (bounds[1] - bounds[0] + 1)) + bounds[0];
    };

    /**
     * Add an item in that branch, or the nested branch specified
     *
     * @param {object} item    Item to add
     * @param {string} catalog Path to branch (or top level if null)
     *
     * @return {Lootr} The current branch
     */
    Lootr.prototype.add = function(item, path) {

        if (path === undefined) {
            this.items.push(item);

        } else {
            var branch = this.branch(path);
            branch.items.push(item);
        }

        return this;
    };

    /**
     * Return or create a new branch under the current one
     *
     * @param  {string} name Branch name
     *
     * @return {Lootr}       The branch
     */
    Lootr.prototype.branch = function(name) {

        return this.getBranch(name, true);
    };

    /**
     * Return or create a new branch under the current one
     *
     * @param  {string}  name   Branch name
     * @param  {boolean} create If true, and the specified branch does not exist, create one
     *
     * @return {Lootr}       The branch
     */
    Lootr.prototype.getBranch = function(name, create) {

        var path = this.clean(name).split('/');

        // if the asked branch does not begin with the current branch
        // neither a first-level branch
        // and we've been asked to create
        // => create the asked branch
        if (! this.branchs[path[0]] && path[0] != this.name && create) {
            this.branchNames.push(path[0]);
            this.branchs[path[0]] = new Lootr(path[0]);
        }

        // get a branch at current level
        if (path.length === 1) {

            return path[0] === this.name ? this : this.branchs[path[0]];

        // or nested
        } else if (path.length > 1) {
            var head    = path.shift();
            var newPath = path.join('/');

            if (this.branchs[head]) {
                return this.branchs[head].getBranch(newPath, create);
            }

            if (create) {
                this.branchNames.push(head);
                this.branchs[head] = new Lootr(head);
                return this.branchs[head].getBranch(newPath, create);
            }
        }
    };

    /**
     * Return all items in the current and nested branchs
     *
     * @return {array} Array of items
     */
    Lootr.prototype.allItems = function() {

        var items = this.items.slice();

        for (var i = 0; i < this.branchNames.length; i++) {
            items = items.concat(this.branchs[ this.branchNames[i] ].allItems());
        }

        return items;
    };

    /**
     * Randomly pick an item.
     *
     * @param  {int}   allowedNesting Depth limit
     * @param  {float} threshold      Chances (0-1) we go deeper
     *
     * @return {object}               Picked item
     */
    Lootr.prototype.randomPick = function(allowedNesting, threshold) {

        var picked = [];

        if (threshold === undefined) {
            threshold = 1;
        }

        if (Math.random() < threshold && this.items.length > 0) {
            picked.push(this.items[~~(Math.random() * this.items.length)]);
        }

        if (allowedNesting > 0) {
            for (var i = 0; i < this.branchNames.length; i++) {
                var nestedChance = Math.random();
                if (nestedChance <= threshold) {
                    var others = this.branchs[ this.branchNames[i] ].randomPick(allowedNesting - 1, threshold - Math.random() / allowedNesting);
                    if (others) {
                        picked = picked.concat(others);
                    }
                } else {
                    // console.log('nope', nestedChance, '>', threshold);
                }
            }
        }

        return this.items.length > 0 ? picked[~~(Math.random() * picked.length)] : null;
    };

    /**
     * Randomly pick an item from the specified branch
     *
     * @param  {string} catalogPath    Branch to get an item from
     * @param  {int}    allowedNesting Depth limit
     * @param  {float}  threshold      Chances (0-1) we go deeper
     *
     * @return {object}                Picked item
     */
    Lootr.prototype.roll = function(catalogPath, nesting, threshold) {

        var branch = this.getBranch(catalogPath);

        return branch.randomPick(nesting, threshold === undefined ? 1.0 : threshold);
    };

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
    Lootr.prototype.loot = function(drops) {

        var rewards = [];

        for (var i = 0; i < drops.length; i++) {
            var item  = this.roll(drops[i].from, drops[i].depth || Infinity, drops[i].luck);

            if (! item) {
                continue;
            }

            var json   = JSON.stringify(item);
            var stack  = !drops[i].stack
                ? 1
                : `${drops[i].stack}`.indexOf('-') > -1
                    ? this.randomInRange(drops[i].stack)
                    : drops[i].stack
                ;
            var modify = drops[i].modify;

            for (var c = 0; c < stack; c++) {
                // clone the item from json
                var cloned = JSON.parse(json);

                // handle modifiers
                if (modify) {
                    var modifier = this.modifiers[~~(Math.random() * this.modifiers.length)];

                    if (modifier) {
                        this.modify(cloned, modifier);
                    }
                }

                rewards.push(cloned);
            }
        }

        return rewards;
    };

    /**
     * Add modifiers.
     *
     * @param {array} modifiers List of strings like [ 'from the shadows', '$name of the sun', 'Golden $name' ]
     */
    Lootr.prototype.setModifiers = function(modifiers) {

        this.modifiers = modifiers;
    };

    /**
     * Add modifiers.
     *
     * @param {array} modifiers List of strings like [ 'from the shadows', '$name of the sun', 'Golden $name' ]
     */
    Lootr.prototype.addModifier = function(modifier) {

        this.modifiers = modifiers || [];
        this.modifiers.push(modifier);
    };

    /**
     * Returns a new name from the given item.
     *
     * @param  {object} item An item
     *
     * @return {string}      A modified name, assuming there are modifiers available
     */
    Lootr.prototype.modify = function(item, modifier) {

        var modifierValues = {},
            modifier       = JSON.parse(JSON.stringify(modifier));

        // we have a name modifier
        if (modifier.name) {

            // modifier is a regexp
            if (modifier.name.indexOf('$') > -1) {

                item.name = modifier.name
                                // replace property names
                                .replace(/(\$\w+)/g, this.modifyNameReplace.bind(item))
                                // in case we don't have the replacement name
                                .replace('  ', ' ')
                                // clean
                                .trim();

            // modifier is a simple suffix
            } else {

                item.name += ' ' + modifier.name;
            }

            delete modifier.name;
        }

        // all other modifiers
        for (key in modifier) {

            var propModifier = modifier[key];

            // function giver
            if (typeof propModifier === 'Function') {

                item[key] = propModifier(item);

            // math expression given
            } else if (propModifier.match(/^[\*\+\-\/]\d+$/)) {

                try {
                    item[key] = Math.max(0, eval((item[key]||0) + ' ' + propModifier));
                } catch (e) {

                }

            // range given
            } else {

                item[key] = this.randomInRange(propModifier);

            }
        }

    };

    Lootr.prototype.modifyProps = function(item, modifier) {

        return {};
    };

    /**
     * Return the replacement for the given match.
     *
     * @param  {string} match Matched token
     *
     * @return {return}       A replacement string
     */
    Lootr.prototype.modifyNameReplace = function(match) {
        // `this` is the current item to modify
        return (this[match.substr(1)] || '').toLowerCase();
    };


    ////////////////////////////////////////////////////////


    // Node.js
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = Lootr;
    }
    // AMD / RequireJS
    else if (typeof define !== 'undefined' && define.amd) {
        define([], function () {
            return Lootr;
        });
    }
    // included directly via <script> tag
    else {
        root.Lootr = Lootr;
    }
}());
