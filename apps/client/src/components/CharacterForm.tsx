import { useState } from 'react';
import type { CreateCharacterPayload } from '../types/character.js';

interface CharacterFormProps {
  onCharacterCreated: () => void;
  createCharacterFn: (payload: CreateCharacterPayload) => Promise<unknown>;
}

export function CharacterForm({ onCharacterCreated, createCharacterFn }: CharacterFormProps) {
  const [name, setName] = useState('');
  const [race, setRace] = useState('Human');
  const [characterClass, setCharacterClass] = useState('Fighter');
  const [level, setLevel] = useState(1);

  const [stats, setStats] = useState({
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10,
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStatChange = (statName: keyof typeof stats, value: number) => {
    setStats((prev) => ({ ...prev, [statName]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await createCharacterFn({
        name,
        race,
        characterClass,
        level,
        stats,
      });
      setName('');
      onCharacterCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ background: '#1e1e2e', padding: '1.5rem', borderRadius: '8px', color: '#fff', marginBottom: '2rem' }}>
      <h2>Crear Nuevo Personaje</h2>
      {error && <p style={{ color: '#ff6b6b' }}>{error}</p>}

      <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <div>
          <label>Nombre:</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', marginTop: '0.2rem' }}
          />
        </div>

        <div>
          <label>Raza:</label>
          <input
            type="text"
            required
            value={race}
            onChange={(e) => setRace(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', marginTop: '0.2rem' }}
          />
        </div>

        <div>
          <label>Clase:</label>
          <input
            type="text"
            required
            value={characterClass}
            onChange={(e) => setCharacterClass(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', marginTop: '0.2rem' }}
          />
        </div>

        <div>
          <label>Nivel (1-20):</label>
          <input
            type="number"
            min={1}
            max={20}
            value={level}
            onChange={(e) => setLevel(Number(e.target.value))}
            style={{ width: '100%', padding: '0.5rem', marginTop: '0.2rem' }}
          />
        </div>
      </div>

      <h3>Atributos (1 - 30)</h3>
      <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))' }}>
        {(Object.keys(stats) as Array<keyof typeof stats>).map((statKey) => (
          <div key={statKey}>
            <label style={{ textTransform: 'capitalize' }}>{statKey}:</label>
            <input
              type="number"
              min={1}
              max={30}
              value={stats[statKey]}
              onChange={(e) => handleStatChange(statKey, Number(e.target.value))}
              style={{ width: '100%', padding: '0.5rem', marginTop: '0.2rem' }}
            />
          </div>
        ))}
      </div>

      <button
        type="submit"
        disabled={submitting}
        style={{ marginTop: '1.5rem', padding: '0.75rem 1.5rem', background: '#6c5ce7', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
      >
        {submitting ? 'Guardando...' : 'Guardar Personaje'}
      </button>
    </form>
  );
}