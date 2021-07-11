import { Lootr } from './Lootr';

describe('Lootr', () => {
  const stuff = [{ name: 'Stuff', color: 'orange' }];
  const stuffNames = stuff.map((item) => item.name);
  const weapons = [{ name: 'Uzi' }, { name: 'Pistol' }];
  const weaponNames = weapons.map((item) => item.name);
  const simplarmors = [{ name: 'Plates' }, { name: 'Leather' }];
  const simplarmorNames = simplarmors.map((item) => item.name);
  const tougharmors = [{ name: 'Military_vest' }, { name: 'CSI_cap' }];
  const tougharmorNames = tougharmors.map((item) => item.name);
  const equipment = [...weapons, ...simplarmors, ...tougharmors];
  const equipmentNames = equipment.map((item) => item.name);
  const all = [...stuff, ...equipment];
  const allNames = all.map((item) => item.name);

  function GenerateStuff(loot: Lootr) {
    loot.add(stuff[0]);

    loot.branch('/equipment/weapons').add(weapons[0]).add(weapons[1]);

    loot.branch('/equipment/armor').add(simplarmors[0]).add(simplarmors[1]);

    loot
      .branch('/equipment/armor/tough')
      .add(tougharmors[0])
      .add(tougharmors[1]);

    return loot;
  }

  it('instantiates', () => {
    const instance = new Lootr();
    expect(instance).toBeDefined();
    expect(instance.name).toBe('root');
  });

  it('name guards', () => {
    // wont clean slashes inside
    expect(() => new Lootr('a/name')).toThrow();
    // will clean slashes end and start
    expect(() => new Lootr('/name')).not.toThrow();
    expect(() => new Lootr('name/')).not.toThrow();
  });

  it('contains items', () => {
    const loot = GenerateStuff(new Lootr());
    expect(loot.allItems()).toHaveLength(7);
  });

  it('rolls items', () => {
    const loot = GenerateStuff(new Lootr());

    expect(loot.roll('/')).toHaveProperty('name', stuffNames[0]);
    expect(loot.roll('/equipment')).toBeNull();
    const equipmentRoll = loot.roll('/equipment', 3, 100);
    expect(equipmentRoll.name).toBeOneOf(equipmentNames);
    expect(loot.roll('/equipment', Infinity, Infinity).name).toBeOneOf(
      allNames
    );
    expect(loot.roll('/equipment/weapons', 3).name).toBeOneOf(weaponNames);
    expect(loot.roll('/equipment/armor').name).toBeOneOf(simplarmorNames);
    expect(loot.roll('/equipment/armor', 3).name).toBeOneOf([
      ...simplarmorNames,
      ...tougharmorNames,
    ]);
  });

  it('luck/stack rolls', () => {
    const loot = GenerateStuff(new Lootr());
    const drops = [
      { from: '/equipment', luck: 1.0, stack: 1 },
      { from: '/equipment/armor', luck: 0.5, stack: 2 },
      { from: '/equipment/weapons', luck: 0.8, stack: 2 },
    ];
    expect(loot.loot(drops).length).toBeGreaterThan(0);
  });

  it('loot chance', () => {
    const loot = GenerateStuff(new Lootr());
    const all = loot.allItems();
    const drops = [
      { from: '/', luck: 1.0, stack: 3, depth: 1 },
      { from: '/equipment', luck: 1.0, stack: 1, depth: 1 },
      { from: '/equipment/weapons', luck: 0.8, stack: 1, depth: 1 },
      { from: '/equipment/armor', luck: 0.5, stack: '1-10', depth: 1 },
    ];

    const rolls = 1000;
    const overallRewards: Record<string, number> = {};
    for (let count = 0; count < rolls; count++) {
      const rewards = loot.loot(drops);
      rewards.forEach((reward) => {
        overallRewards[reward.name] = (overallRewards[reward.name] || 0) + 1;
      });
    }

    expect(
      all.reduce((result, item) => result && !!overallRewards[item.name], true)
    ).toBeTrue();
  });

  it('modifys loot', () => {
    const loot = GenerateStuff(new Lootr());
    loot.setModifiers([
      { name: 'from the shadows', agility: '+4' },
      { name: '$name of the sun', intel: '*10' },
      { name: 'Golden $unknown $name', force: '-1' },
      { name: 'An $color $name from the gods', mana: '/2' },
      { name: 'of agility', agility: '4-10' },
      { name: 'An $color $name from the gods', mana: '10' },
    ]);

    const drops = [
      {
        from: '/',
        luck: 10,
        stack: 10,
        depth: Infinity,
        modify: true,
      },
    ];
    const rewards = loot.loot(drops);
    expect(rewards.length).toBeGreaterThan(0);

    const modified = GenerateStuff(new Lootr())
      .setModifiers([{ name: 'of agility', agility: '4-10' }])
      .loot([{ from: '/', depth: 1, modify: true }]);

    expect(modified[0]).toHaveProperty('name');
    expect(modified[0]).toHaveProperty('color');
    expect(modified[0]).toHaveProperty('agility');
    expect(modified[0].name).toInclude('of agility');
    expect(modified[0].agility).toBeGreaterThanOrEqual(4);
    expect(modified[0].agility).toBeLessThanOrEqual(10);
  });
});
