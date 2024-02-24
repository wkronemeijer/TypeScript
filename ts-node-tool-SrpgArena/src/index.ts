import "@wkronemeijer/system";
import "@wkronemeijer/system-node";

import { Weapon, Armor, Unit, Arena_complete, WeaponAttribute, ArmorAttribute, UnitAttribute } from "./Domain/Model";
import { Table } from "./Domain/Table";
import { readLine } from "@wkronemeijer/system-node";

const Bow: Weapon = {
    kind: "weapon",
    name: "Iron Bow",
    type: "physical",
    weight: 8,
    
    attributes: {
        ...Table(WeaponAttribute),
        physicalMightBase: 10,
        physicalMightSpread: 5,
        physicalPenetration: 10,
        hit: 0.8,
    },
};

const ChestplateOfFending: Armor = {
    kind: "armor",
    name: "Chestplate of Fending",
    weight: 15,
    attributes: {
        ...Table(ArmorAttribute),
    },
};

const Johnny = Unit({
    name: "Johnny",
    level: 25,
    equipment: {
        weapon: Bow,
        armor: ChestplateOfFending,
    },
    growth: {
        ...Table(UnitAttribute),
        constitution: 1.25,
        strength: 0.6,
        magic: 0.1,
        skill: 0.3,
        speed: 0.4,
        luck: 0.8,
        defense: 0.4,
        resistance: 0.3,
    },
});

const Timmy = Unit({
    name: "Timmy",
    level: 25,
    equipment: {
        weapon: Bow,
        armor: ChestplateOfFending,
    },
    growth: {
        ...Table(UnitAttribute),
        constitution: 1.25,
        strength: 0.6,
        magic: 0.1,
        skill: 0.3,
        speed: 0.4,
        luck: 0.8,
        defense: 0.4,
        resistance: 0.3,
    },
});

// Might be interesting to include those body part multipliers, since range and movement are gone

export async function main(args: string[]): Promise<void> {
    while (true) {
        const line = await readLine("> ");
        const { victor } = Arena_complete({
            units: [Johnny, Timmy],
        });
        
        console.log(`The victor is ${victor}`);
    }
}
