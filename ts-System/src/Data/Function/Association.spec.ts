import { createAssociation } from "./Association";

export {};

interface Unit {
    readonly name: string;
    readonly spells: readonly Spell[];
}

declare const timmy: Unit;

interface Spell {
    readonly name: string;
    readonly cooldown: number;
}

const fireball: Spell = {
    name: "Fireball",
    cooldown: 4.5,
};

const sear: Spell = {
    name: "Sear",
    cooldown: 1.5,
}

const [getSpellList] = createAssociation(
    (unit: Unit) => new Array<Spell>
);

getSpellList(timmy).push(fireball, sear);

const [getCooldown, setCooldown] = createAssociation(
    (unit: Unit, spell: Spell) => 0
);


setCooldown(timmy, fireball, fireball.cooldown);
