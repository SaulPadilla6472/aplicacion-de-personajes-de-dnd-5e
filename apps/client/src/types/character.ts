export interface AbilityScores {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}

export interface SpellSlots {
  level1: { total: number; used: number };
  level2: { total: number; used: number };
  level3: { total: number; used: number };
  level4: { total: number; used: number };
  level5: { total: number; used: number };
}

export interface Character {
  id: string;
  name: string;
  race: string;
  characterClass: string;
  level: number;
  armorClass: number;
  equipment: string[]; // Inventario dinámico/modificable
  weaponProficiencies: string[]; // e.g. ["Simple Weapons", "Martial Weapons"]
  isSpellcaster: boolean;
  spellcastingAbility?: 'intelligence' | 'wisdom' | 'charisma';
  spellSlots?: SpellSlots;
  stats: AbilityScores;
  modifiers: AbilityScores;
  proficiencyBonus: number;
  proficiencies?: string[];
  skillProficiencies?: string[];
}

export interface CreateCharacterPayload {
  name: string;
  race: string;
  characterClass: string;
  level: number;
  armorClass?: number;
  equipment?: string[];
  stats: AbilityScores;
  proficiencies?: string[];
  skillProficiencies?: string[];
}