// 1. Tipos de Atributos Principales de D&D 5e
export type AbilityScoreName = 
  | 'strength' 
  | 'dexterity' 
  | 'constitution' 
  | 'intelligence' 
  | 'wisdom' 
  | 'charisma';

export type AbilityScores = Record<AbilityScoreName, number>;

// 2. Interfaz de Datos de Entrada (DTO) para la creación de un personaje
export interface CharacterProps {
  id: string;
  name: string;
  race: string;
  characterClass: string;
  level: number;
  stats: AbilityScores;
  createdAt?: Date;
}

// 3. Entidad de Dominio con Lógica Integrada
export class CharacterDomain {
  public readonly id: string;
  public name: string;
  public race: string;
  public characterClass: string;
  public level: number;
  public stats: AbilityScores;
  public readonly createdAt: Date;

  constructor(props: CharacterProps) {
    this.id = props.id;
    this.name = props.name;
    this.race = props.race;
    this.characterClass = props.characterClass;
    this.level = props.level;
    this.stats = props.stats;
    this.createdAt = props.createdAt ?? new Date();
  }

  // Regla 5e: Modificador = floor((Score - 10) / 2)
  public getModifier(ability: AbilityScoreName): number {
    return Math.floor((this.stats[ability] - 10) / 2);
  }

  // Regla 5e: Bono de Competencia = ceil(1 + Nivel / 4)
  public get proficiencyBonus(): number {
    return Math.ceil(1 + this.level / 4);
  }

  // Convierte la entidad a un objeto plano JSON para enviar en las respuestas HTTP
  public toJSON() {
    return {
      id: this.id,
      name: this.name,
      race: this.race,
      characterClass: this.characterClass,
      level: this.level,
      stats: this.stats,
      modifiers: {
        strength: this.getModifier('strength'),
        dexterity: this.getModifier('dexterity'),
        constitution: this.getModifier('constitution'),
        intelligence: this.getModifier('intelligence'),
        wisdom: this.getModifier('wisdom'),
        charisma: this.getModifier('charisma'),
      },
      proficiencyBonus: this.proficiencyBonus,
      createdAt: this.createdAt.toISOString(),
    };
  }
}