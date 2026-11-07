import { useEffect, useState } from 'react';
import { fetchCharacters } from './services/characterApi.js';
import type { Character } from './types/character.js';

export function App() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCharacters()
      .then((data) => {
        setCharacters(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1>DnD 5e Character Creator</h1>
      {loading && <p>Cargando personajes desde la API...</p>}
      {error && <p style={{ color: 'red' }}>Error de conexión: {error}</p>}

      {!loading && !error && (
        <div>
          <h2>Personajes Creados ({characters.length})</h2>
          {characters.length === 0 ? (
            <p>No hay personajes registrados en la base de datos local.</p>
          ) : (
            <ul>
              {characters.map((char) => (
                <li key={char.id}>
                  <strong>{char.name}</strong> - {char.race} {char.characterClass} (Nivel {char.level}) | Mod. Fuerza: +{char.modifiers.strength}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default App;