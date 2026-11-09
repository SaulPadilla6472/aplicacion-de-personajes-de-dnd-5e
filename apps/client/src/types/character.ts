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
  stats: AbilityScores;
  modifiers: AbilityScores;
  proficiencyBonus: number;
  proficiencies: string[];
  createdAt: string;
}

export interface CreateCharacterPayload {
  name: string;
  race: string;
  characterClass: string;
  level: number;
  stats: AbilityScores;
}