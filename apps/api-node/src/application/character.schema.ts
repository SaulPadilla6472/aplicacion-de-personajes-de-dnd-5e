import { z } from 'zod';

// Validador individual para los 6 atributos base (rango 1 a 30 en D&D 5e)
const abilityScoreSchema = z
  .number({ message: 'El atributo debe ser un número' })
  .int('El valor del atributo debe ser un número entero')
  .min(1, 'El valor mínimo de un atributo es 1')
  .max(30, 'El valor máximo de un atributo es 30');

// Esquema de las 6 puntuaciones de características
export const abilityScoresSchema = z.object({
  strength: abilityScoreSchema,
  dexterity: abilityScoreSchema,
  constitution: abilityScoreSchema,
  intelligence: abilityScoreSchema,
  wisdom: abilityScoreSchema,
  charisma: abilityScoreSchema,
});

// Esquema principal para la creación de un personaje (DTO)
export const createCharacterSchema = z.object({
  name: z
    .string({ message: 'El nombre es obligatorio' })
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .trim(),
  race: z
    .string({ message: 'La raza es obligatoria' })
    .min(2, 'La raza debe tener al menos 2 caracteres')
    .trim(),
  characterClass: z
    .string({ message: 'La clase es obligatoria' })
    .min(2, 'La clase debe tener al menos 2 caracteres')
    .trim(),
  level: z
    .number({ message: 'El nivel debe ser un número' })
    .int('El nivel debe ser un número entero')
    .min(1, 'El nivel mínimo es 1')
    .max(20, 'El nivel máximo es 20'),
  stats: abilityScoresSchema,
});

// Extraer el tipo TypeScript inferido automáticamente por Zod
export type CreateCharacterInput = z.infer<typeof createCharacterSchema>;