export interface AbilityScores {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}

export interface Character {
  id: string;
  name: string;
  race: string;
  characterClass: string;
  level: number;
  armorClass: number; // <-- Clase de Armadura (AC)
  equipment: string[]; // <-- Inventario / Equipamiento
  stats: AbilityScores;
  modifiers: AbilityScores;
  proficiencyBonus: number;
  proficiencies?: string[]; // Competencias en tiradas de salvación
  skillProficiencies?: string[]; // Competencias en habilidades (Acrobacia, Sigilo, etc.)
}

export interface CreateCharacterPayload {
  name: string;
  race: string;
  characterClass: string;
  level: number;
  stats: AbilityScores;
  proficiencies?: string[];
  skillProficiencies?: string[];
}