import { useEffect, useState } from 'react';
import { fetchCharacters, createCharacter } from './services/characterApi.js';
import { CharacterForm } from './components/CharacterForm.js';
import { CharacterCard } from './components/CharacterCard.js';
import type { Character } from './types/character.js';

export function App() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadCharacters = () => {
    setLoading(true);
    fetchCharacters()
      .then((data) => {
        setCharacters(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadCharacters();
  }, []);

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif', maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '2rem', color: '#7aa2f7' }}>
        ⚔️ DnD 5e Character Creator ⚔️
      </h1>

      <CharacterForm onCharacterCreated={loadCharacters} createCharacterFn={createCharacter} />

      {loading && <p style={{ textAlign: 'center' }}>Cargando personajes...</p>}
      {error && <p style={{ color: '#f7768e', textAlign: 'center' }}>Error: {error}</p>}

      {!loading && !error && (
        <div>
          <h2 style={{ borderBottom: '1px solid #3b4261', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
            Personajes Registrados ({characters.length})
          </h2>
          
          {characters.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#565f89' }}>No hay personajes creados aún.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {characters.map((char) => (
                <CharacterCard key={char.id} character={char} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;