import { Array_randomElement, Member, Random_intRangeInclusive, ReadonlyRecord, Record_toFunction, StringEnum, ceil, clamp, defineProperty, floor, max, random, swear } from "@wkronemeijer/system";

import { Table } from "./Table";

export type  UnitResource = Member<typeof UnitResource>;
export const UnitResource = StringEnum([
    "life",
    "mana",
    "ward",
    "experience",
    "energy",
]);

export type  UnitAttribute = Member<typeof UnitAttribute>;
export const UnitAttribute = StringEnum([
    "constitution",
    "strength",
    "magic",
    "skill",
    "speed",
    "luck",
    "defense",
    "resistance",
    // "movement", // Irrelevant for the arena
]);

const UnitAttribute_getRange = Record_toFunction<UnitAttribute, readonly [min: number, max: number]>({
    "constitution": [0, 80],
    "strength": [0, 40],
    "magic": [0, 40],
    "skill": [0, 40],
    "speed": [0, 40],
    "luck": [0, 40],
    "defense": [0, 40],
    "resistance": [0, 40],
});

type  DamageType = Member<typeof DamageType>;
const DamageType = StringEnum([
    "physical",
    "magical",
]);

export type  WeaponAttribute = Member<typeof WeaponAttribute>;
export const WeaponAttribute = StringEnum([
    "physicalMightBase",
    "physicalMightSpread",
    "magicalMightBase",
    "magicalMightSpread",
    "physicalPenetration",
    "magicalPenetration",
    "hit",
    "criticalHit",
    "criticalDamageMultiplier",
    "avoid",
]);

export type  ArmorAttribute = Member<typeof ArmorAttribute>;
export const ArmorAttribute = StringEnum([
    "defense",
    "resistance",
    "regeneration",
]);

export type  BonusAttribute = Member<typeof BonusAttribute>;
export const BonusAttribute = StringEnum([
    "physicalMightBase",
    "physicalMightSpread",
    "magicalMightBase",
    "magicalMightSpread",
    "physicalPenetration",
    "magicalPenetration",
    "hit",
    "criticalHit",
    "criticalDamageMultiplier",
    "avoid",
]);

interface EquipmentBase {
    readonly weight: number;
}

export interface Weapon extends EquipmentBase {
    readonly kind: "weapon";
    readonly slot: "hand";
    readonly name: string;
    readonly type: DamageType;
    readonly attributes: Table<WeaponAttribute>;
}

export interface Armor extends EquipmentBase {
    readonly kind: "armor";
    readonly slot: "chest";
    readonly name: string;
    readonly attributes: Table<ArmorAttribute>;
}

export interface Accessory extends EquipmentBase {
    readonly kind: "accessory";
    readonly slot: "finger";
    readonly name: string;
    readonly attribues: Table<UnitAttribute>;
}

type Equipment = (
    | Weapon
    | Armor
    | Accessory
);

type EquipmentSlot = Equipment["slot"];

interface Aura {
    readonly duration: number;
    readonly modifier: Table<UnitAttribute>;
}

interface UnitEquipment {
    readonly weapon: Weapon;
    readonly armor: Armor;
    readonly accessory?: EquipmentBase;
}

const ENERGY_THRESHOLD = 100;
const ENERGY_STEP = 10;


export interface Unit {
    readonly name: string;
    alive: boolean;
    level: number;
    readonly resources: Table<UnitResource>;
    readonly growth: Table<UnitAttribute>;
    readonly attributes: Table<UnitAttribute>;
    readonly equipment: UnitEquipment;
    
    readonly modifiers: Aura[];
}

function Unit_isAlive(unit: Unit): boolean {
    return unit.alive;
}

function effective(unit: Unit, stat: UnitAttribute): number {
    let result = 0;
    result += unit.attributes[stat];
    for (const { modifier } of unit.modifiers) {
        result += modifier[stat];
    }
    return result;
}








interface GameEventDelegate {
    levelUp(unit: Unit, stat: UnitAttribute, amount: number): void;
    changeLife(unit: Unit, life: number): void;
    hit(source: Unit, target: Unit, amount: number, type: DamageType, crit?: "crit"): void;
    miss(source: Unit, target: Unit): void;
    ded(unit: Unit): void;
}

const GameLog: GameEventDelegate = new Proxy({
    levelUp(unit, stat, amount) {
        // console.log(`${unit} gains ${amount} ${stat}!`);
    },
    
    hit(source, target, amount, type, crit) {
        console.log(`${source} hits ${target} for ${amount} ${type} damage`);
        if (crit && amount > 0) {
            console.log("It's super effective!");
        }
    },
    
    changeLife(unit, life) {
        console.log(`${unit}'s life is now ${life}/${unit.attributes.constitution}`);
    },
    
    ded(unit) {
        console.log(`${unit} has \x1b[31mdied\x1b[0m!`);
    },
} satisfies Partial<GameEventDelegate>, {
    get(target, key, receiver) {
        if (key in target) {
            return (target as any)[key];
        } else {
            return (...args: any[]) => {
                console.log(`${String(key)}(${args.join(", ")})`);
            };
        }
    },
}) as GameEventDelegate;



















function Stat_getRandomIncrease<K extends string>(growth: Table<K>, stat: K): number {
    const rate       = growth[stat];
    const guaranteed = floor(rate);
    const chance     = clamp(0, rate - guaranteed, 1);
    return guaranteed + (random() < chance ? 1 : 0);
}

function Unit_updateEachAttribute(unit: Unit, delta: (stat: UnitAttribute, value: number) => number): void {
    const attributes = unit.attributes;
    for (const stat of UnitAttribute) {
        attributes[stat] = delta(stat, attributes[stat]);
    }
}

function Unit_levelUp(unit: Unit): void {
    Unit_updateEachAttribute(unit, (stat, value) => {
        const increase = Stat_getRandomIncrease(unit.growth, stat);
        if (increase >= 1) {
            GameLog.levelUp(unit, stat, increase);
        }
        return value + increase;
    });
    unit.level += 1;
}

const MAGIC_NUMBER_RATIO = 0.25;

function Unit_clampStats(unit: Unit): void {
    Unit_updateEachAttribute(unit, (stat, value) => {
        const statGrowth = unit.growth[stat];
        // Always remember: Lv1 -> Lv20 means 19 level-ups
        const levelUps = unit.level - 1;
        const [absoluteMinimum, absoluteMaximum] = UnitAttribute_getRange(stat);
        const trueMaximum  = ceil(statGrowth) * levelUps;
        const expected     = statGrowth * levelUps;
        const trueMinimum  = floor(statGrowth) * levelUps; 
        
        const maximum = trueMaximum;
        const minimum = floor(max(expected * MAGIC_NUMBER_RATIO, trueMinimum));
        
        return clamp(minimum, value, maximum);
    });
}

export function Unit(options: { 
    readonly name: string, 
    readonly level: number, 
    readonly equipment: UnitEquipment;
    readonly growth: Table<UnitAttribute>;
}): Unit {
    const { name, level, equipment, growth } = options;
    const result: Unit = {
        name,
        alive: true,
        level: 1,
        equipment, 
        growth,
        modifiers: [],
        attributes: Table(UnitAttribute),
        resources: Table(UnitResource),
    };
    
    defineProperty(result, "toString", {
        configurable: true,
        enumerable: false, 
        writable: true,
        value() {
            return `\x1b[1m${name}\x1b[0m`;
        },
    })
    
    while (result.level < level) {
        Unit_levelUp(result);
    }
    Unit_clampStats(result);
    result.resources.life = result.attributes.constitution;
    return result;
}



function truehit(chance: number): boolean {
    const first   = random();
    const second  = random();
    const average = (first + second) / 2;
    return Boolean(average < chance);
}

interface Arena {
    readonly units: Unit[];
}

function Arena_getAlive(self: Arena): Unit[] {
    return self.units.filter(Unit_isAlive);
}

function Arena_isUnsettled(self: Arena): boolean {
    return Arena_getAlive(self).length > 1;
}

// Seperate because this is called very often
function Unit_getEnergyStep(self: Unit): number {
    // SPD in 0...40
    // But unit with delta of 20 should act 10+ times as often
    const speed = effective(self, "speed");
    return 20 + 10 * (speed / 10);
}

/** 
 * Ups energy and returns true when the unit is ready to act. 
 * The needed energy will already have been subtracted. 
 */
function Unit_energize(self: Unit): boolean {
    const newEnergy = self.resources.energy = (self.resources.energy ?? 0) + Unit_getEnergyStep(self);
    const isReady  = newEnergy >= ENERGY_THRESHOLD
    if (isReady) {
        self.resources.energy -= ENERGY_THRESHOLD;
    }
    return isReady;
}

interface DamageSpecificCombatStats {
    readonly attackMin: number;
    readonly attackMax: number;
    readonly penetration: number;
    readonly defense: number;
}

interface DerivedCombatStats {
    readonly preferredType: DamageType;
    
    readonly for: ReadonlyRecord<DamageType, DamageSpecificCombatStats>;
    
    readonly physicalAttackMin: number;
    readonly physicalAttackMax: number;
    readonly magicalAttackMin: number;
    readonly magicalAttackMax: number;
    readonly physicalPenetration: number;
    readonly magicalPenetration: number;
    readonly hit: number;
    readonly criticalHit: number;
    readonly criticalDamageMultiplier: number;
    readonly avoid: number;
    readonly criticalAvoid: number;
    readonly quickness: number;
    readonly protection: number;
    readonly resilience: number;
    /** Chance to resist flinch and stun. */
    readonly fortitude: number;
    readonly resolve: number;
    readonly regeneration: number;
}

function Unit_deriveCombatStats(unit: Unit): DerivedCombatStats {
    const { weapon, armor } = unit.equipment;
    
    // effective() is missing
    
    const physicalAttackBase = unit.attributes.strength + weapon.attributes.physicalMightBase;
    const physicalAttackMin = physicalAttackBase - weapon.attributes.physicalMightSpread;
    const physicalAttackMax = physicalAttackBase + weapon.attributes.physicalMightSpread;
    
    const magicalAttackBase = unit.attributes.magic + weapon.attributes.magicalMightBase;
    const magicalAttackMin = magicalAttackBase - weapon.attributes.magicalMightSpread;
    const magicalAttackMax = magicalAttackBase + weapon.attributes.magicalMightSpread;
    
    const preferredType = physicalAttackBase >= magicalAttackBase ? "physical" : "magical";
    
    // for now
    const physicalPenetration = 0; 
    const magicalPenetration = 0;
    
    const hit = weapon.attributes.hit + (3 * unit.attributes.skill + unit.attributes.luck) / 200;
    const criticalHit = weapon.attributes.hit + (3 * unit.attributes.skill + unit.attributes.luck) / 200;
    const criticalDamageMultiplier = max(1,weapon.attributes.criticalDamageMultiplier + unit.level * (0.05 / 40));
    const avoid = weapon.attributes.avoid + (3 * unit.attributes.speed + unit.attributes.luck) / 200;
    const criticalAvoid = unit.attributes.luck / 100;
    const quickness = unit.attributes.speed / 20 + max(0, unit.attributes.strength - weapon.weight - armor.weight);
    const protection = unit.attributes.defense    + armor.attributes.defense;
    const resilience = unit.attributes.resistance + armor.attributes.resistance;
    const fortitude = 0;
    const resolve = 0;
    const regeneration = 0;
    
    return {
        for: {
            physical: {
                attackMin: physicalAttackMin,
                attackMax: physicalAttackMax,
                defense: protection,
                penetration: physicalPenetration,
            },
            magical: {
                attackMin: magicalAttackMin,
                attackMax: magicalAttackMax,
                defense: resilience,
                penetration: magicalPenetration,
            },
        },
        preferredType,
        physicalAttackMin, physicalAttackMax,
        magicalAttackMin, magicalAttackMax,
        physicalPenetration,
        magicalPenetration,
        hit,
        criticalHit, criticalDamageMultiplier,
        avoid,
        criticalAvoid,
        quickness,
        protection,
        resilience,
        fortitude,
        resolve,
        regeneration,
    };
}

function Unit_changeLife(self: Unit, amount: number): void {
    const oldLife = self.resources.life;
    const newLife = self.resources.life = clamp(0, oldLife + amount, 99);
    const isAlive = self.alive = newLife > 0;
    if (oldLife !== newLife) {
        GameLog.changeLife(self, newLife);
    }
    if (!isAlive && oldLife > 0) {
        GameLog.ded(self);
    }
}

function Unit_attack(attacker: Unit, defender: Unit): void {
    const alice = Unit_deriveCombatStats(attacker);
    const bob = Unit_deriveCombatStats(defender);
    
    const hitChance  = clamp(0, alice.hit - bob.avoid, 1);
    const critChance = clamp(0, alice.criticalHit - bob.criticalAvoid, 1);
    
    const didHit  = truehit(hitChance);
    const didCrit = truehit(critChance);
    if (didHit || didCrit) { // ← this is where the magic happens
        const damageType = alice.preferredType;
        let damageAmount: number = 0;
        switch (damageType) {
            case "physical": {
                const physicalAttack  = Random_intRangeInclusive(alice.physicalAttackMin, alice.physicalAttackMax);
                const physicalDefense = max(0, bob.protection - alice.physicalPenetration); // ← insert overpenetration
                damageAmount = max(0, physicalAttack - physicalDefense);
                break;
            }
            case "magical": {
                const magicalAttack   = Random_intRangeInclusive(alice.magicalAttackMin, alice.magicalAttackMax);
                const magicalDefense  = max(0, bob.resilience - alice.magicalPenetration);  // ← insert overpenetration
                damageAmount = max(0, magicalAttack - magicalDefense);
                break;
            }
        }
        
        if (didCrit) {
            damageAmount *= alice.criticalDamageMultiplier;
        }
        
        damageAmount = floor(clamp(0, damageAmount, 999));
        
        GameLog.hit(attacker, defender, damageAmount, damageType, didCrit ? "crit" : undefined);
        Unit_changeLife(defender, -damageAmount);
    } else {
        GameLog.miss(attacker, defender);
    }
}

function Arena_doTick(self: Arena): void {
    let target: Unit | undefined;
    for (const unit of self.units) {
        if (Unit_energize(unit)) {
            if (unit.alive && (target = Array_randomElement(Arena_getAlive(self))) && target !== unit) {
                    Unit_attack(unit, target);
            }
        }
    }
}

interface Arena_Result {
    readonly victor: Unit;
}

const TICK_LIMIT = 100_000;

export function Arena_complete(self: Arena): Arena_Result {
    let tick = 0;
    while (Arena_isUnsettled(self) && tick < TICK_LIMIT) {
        tick++;
        Arena_doTick(self);
    }
    const [victor] = Arena_getAlive(self);
    swear(victor, "everybody is ded");
    return { victor };
}
