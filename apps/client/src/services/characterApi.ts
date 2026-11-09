import type { Character, CreateCharacterPayload } from '../types/character.js';

const API_URL = 'http://localhost:3000/api';

export const fetchCharacters = async (): Promise<Character[]> => {
  const response = await fetch(`${API_URL}/characters`);
  if (!response.ok) {
    throw new Error('Error al obtener la lista de personajes');
  }
  const result = await response.json();
  return result.data;
};

export const createCharacter = async (
  payload: CreateCharacterPayload
): Promise<Character> => {
  const response = await fetch(`${API_URL}/characters`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Error al crear el personaje');
  }

  const result = await response.json();
  return result.data;
};
export interface RollResult {
  statName: string;
  d20Roll: number;
  modifier: number;
  total: number;
  isCriticalSuccess: boolean;
  isCriticalFailure: boolean;
}

export const rollDice = async (statName: string, modifier: number): Promise<RollResult> => {
  const response = await fetch(`${API_URL}/roll`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ statName, modifier }),
  });

  if (!response.ok) {
    throw new Error('Error al realizar la tirada de dado');
  }

  const result = await response.json();
  return result.data;
};