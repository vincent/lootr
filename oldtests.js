/*!
 * lootr tests
 * https://github.com/vincent/lootr
 *
 * Copyright 2014 Vincent Lark
 * Released under the MIT license
 */
/*jshint onevar: false, indent:4 */
/*global exports: true, require: true */
'use strict';

var Lootr = require('./index.js');

function getStuffed () {

    var loot = new Lootr('equipment');

    loot.add({ name: 'Stuff', color: 'orange' });

    loot.branch('/equipment/weapons')
        .add({ name: 'Uzi' })
        .add({ name: 'Pistol' });

    loot.branch('/equipment/armor')
        .add({ name: 'Plates' })
        .add({ name: 'Leather' });

    loot.branch('/equipment/armor/tough')
        .add({ name: 'Military_vest' })
        .add({ name: 'CSI_cap' });

    return loot;
}

// Check our library is here
exports['lootr is present'] = function(test) {

    test.ok(Lootr, 'Lootr should be an object');
    test.done();
};

exports['looting setup assertions'] = function (test) {

    test.doesNotThrow(
      function() {
        new Lootr('/notfaultypath');
      },
      Error,
      'Does not fail if /-prefixed named branch'
    );

    test.doesNotThrow(
      function() {
        new Lootr('notfaultypath/');
      },
      Error,
      'Does not fail if /-suffixed named branch'
    );

    test.throws(
      function() {
        new Lootr('/faulty/path');
      },
      Error,
      'Show fail for faulty named branch'
    );

    var loot = getStuffed();
    test.strictEqual(loot.allItems().length, 7);

    test.done();
};

exports['rollin usage'] = function(test) {

    var loot = getStuffed();

    var weapons     = [ 'Uzi', 'Pistol' ];
    var simplarmors = [ 'Plates', 'Leather' ];
    var tougharmors = [ 'Military vest', 'CSI cap' ];
    var all         = [ 'Stuff' ].concat(weapons, simplarmors, tougharmors);

    test.ok(loot.roll('/equipment').name === 'Stuff', 'Should loot a useless equipment');

    test.ok(all.indexOf(loot.roll('/equipment', 3, 100).name) > -1, 'Should loot any equipment');

    test.ok(all.indexOf(loot.roll('/equipment', Infinity, Infinity).name) > -1, 'Should loot any equipment');

    test.ok(weapons.indexOf(loot.roll('/equipment/weapons', 3).name) > -1, 'Should loot a weapon');

    test.ok(simplarmors.indexOf(loot.roll('/equipment/armor').name) > -1, 'Should loot a simple armor');

    test.ok([].concat(simplarmors, tougharmors).indexOf(loot.roll('/equipment/armor', 1).name) > -1, 'Should loot an armor');

    test.done();
};

exports['rollin usage'] = function(test) {

    var loot = getStuffed();

    var drops = [
        {from: '/equipment',         luck:1.0, stack:1 },
        {from: '/equipment/armor',   luck:0.5, stack:2 },
        {from: '/equipment/weapons', luck:0.8, stack:2 }
    ];

    var reward = loot.loot(drops);

    test.ok(reward.length > 0, 'we got the reward we deserve');

    test.done();
};

exports['10000 rolls stats'] = function(test) {

    var loot  = getStuffed();
    var all   = loot.allItems();

    var drops = [
        {from: '/equipment',         luck:1.0, stack:1, depth:1 },
        {from: '/equipment/weapons', luck:0.8, stack:1, depth:1 },
        {from: '/equipment/armor',   luck:0.5, stack:'1-10', depth:1 }
    ];

    var rolls = 1000;
    var overallRewards   = {};
    overallRewards.count = 0;

    for (var i = 0; i < rolls; i++) {
        var reward = loot.loot(drops);

        for (var r = 0; r < reward.length; r++) {
            overallRewards[ reward[r].name ] = (overallRewards[ reward[r].name ] || 0) + 1;
            overallRewards.count++;
        }
    }


    var allPresent = true;
    for (var rw = 0; rw < all.length; rw++) {
        allPresent = allPresent && overallRewards[ all[rw].name ];
    }
    test.ok(allPresent, 'at least there is one of each');


    test.ok( overallRewards.Stuff >= rolls, 'everytime I get only grey stuff');

    var weaponsRatio = ((overallRewards.Uzi + overallRewards.Pistol) / rolls).toFixed(2);
    var armoryRatio  = ((overallRewards.Plates + overallRewards.Leather + overallRewards.Military_vest + overallRewards.CSI_cap) / rolls).toFixed(2);
    test.ok(weaponsRatio >= 0.6 && weaponsRatio <= 0.9, 'I got only ' + weaponsRatio*100 + '% weapons');
    test.ok(armoryRatio  >= 2   && armoryRatio  <= 7  , 'I got only ' + armoryRatio*100  + '% armory');


    test.done();
};

exports['modifiers usage'] = function(test) {

    var loot  = getStuffed();

    loot.setModifiers([

        { name:    'from the shadows',
          agility: '+4' },

        { name:    '$name of the sun',
          intel:   '*10' },

        { name:    'Golden $unknown $name',
          force:   '-1' },

        { name:    'An $color $name from the gods',
          mana:    '/2' },

        { name:    'of agility',
          agility: '4-10' },

        { name:    'An $color $name from the gods',
          mana:    '10' }
    ]);

    var drops = [{ from:'/equipment', luck:10, stack:10, depth:Infinity, modify:true }];

    var rewards = loot.loot(drops);

    test.ok(rewards.length > 0, 'Customized loots');

    // for (var i = 0; i < rewards.length; i++) {
    //     console.log(rewards[i]);
    // }

    test.done();
};