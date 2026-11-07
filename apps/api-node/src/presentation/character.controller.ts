import type { Request, Response } from 'express';
import { CharacterDomain } from '../domain/character.js';
import { createCharacterSchema } from '../application/character.schema.js';

// Almacenamiento temporal en memoria
const charactersStore: CharacterDomain[] = [];

export const createCharacterHandler = (req: Request, res: Response) => {
  // Validar el cuerpo de la petición con Zod
  const validationResult = createCharacterSchema.safeParse(req.body);

  if (!validationResult.success) {
    return res.status(400).json({
      error: 'Datos de personaje inválidos',
      details: validationResult.error.format(),
    });
  }

  const data = validationResult.data;

  // Instanciar la entidad de dominio con un ID generado
  const newCharacter = new CharacterDomain({
    id: crypto.randomUUID(),
    name: data.name,
    race: data.race,
    characterClass: data.characterClass,
    level: data.level,
    stats: data.stats,
  });

  charactersStore.push(newCharacter);

  return res.status(201).json({
    message: 'Personaje creado con éxito',
    data: newCharacter.toJSON(),
  });
};

export const getAllCharactersHandler = (_req: Request, res: Response) => {
  const charactersJson = charactersStore.map((char) => char.toJSON());
  return res.status(200).json({ data: charactersJson });
};