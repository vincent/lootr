'use strict';

function Lootr (name) {

    this.name         = name || 'root';
    this.items        = [];
    this.branchs      = {};
    this.branchNames  = [];
}

Lootr.prototype.add = function(catalogPath, item) {

    if (item === undefined) {
        this.items.push(catalogPath);
    
    } else {
        var branch = this.branch(catalogPath);
        branch.items.push(item);
    }

    return this;
};

Lootr.prototype.branch = function(catalogPath) {

    return this.getBranch(catalogPath, true);
};

Lootr.prototype.getBranch = function(catalogPath, create) {

    var path = catalogPath.replace(/^\//g, '').replace(/\/$/g, '').split('/');

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

Lootr.prototype.randomPick = function(allowedNesting, threshold) {

    var picked = [];

    if (threshold === undefined) {
        threshold = 0.9;
    }

    if (this.items.length > 0) {
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

Lootr.prototype.roll = function(catalogPath, nesting, threshold) {

    var branch = this.getBranch(catalogPath);

    return branch.randomPick(nesting, threshold === undefined ? 1.0 : threshold);
};

module.exports = Lootr;

