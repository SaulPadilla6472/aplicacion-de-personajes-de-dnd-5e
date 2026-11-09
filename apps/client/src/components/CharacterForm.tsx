import { useEffect, useState } from 'react';
import type { CreateCharacterPayload } from '../types/character.js';
import { fetchDndRaces, fetchDndClasses, type ApiNamedResource } from '../services/dnd5eApi.js';

interface CharacterFormProps {
  onCharacterCreated: () => void;
  createCharacterFn: (payload: CreateCharacterPayload) => Promise<unknown>;
}

const CLASS_SAVING_THROWS: Record<string, string[]> = {
  Barbarian: ['strength', 'constitution'],
  Bard: ['dexterity', 'charisma'],
  Cleric: ['wisdom', 'charisma'],
  Druid: ['intelligence', 'wisdom'],
  Fighter: ['strength', 'constitution'],
  Monk: ['strength', 'dexterity'],
  Paladin: ['wisdom', 'charisma'],
  Ranger: ['strength', 'dexterity'],
  Rogue: ['dexterity', 'intelligence'],
  Sorcerer: ['constitution', 'charisma'],
  Warlock: ['wisdom', 'charisma'],
  Wizard: ['intelligence', 'wisdom'],
};

export function CharacterForm({ onCharacterCreated, createCharacterFn }: CharacterFormProps) {
  const [name, setName] = useState('');
  const [race, setRace] = useState('');
  const [characterClass, setCharacterClass] = useState('');
  const [level, setLevel] = useState(1);
  const [proficiencies, setProficiencies] = useState<string[]>([]);

  const [racesOptions, setRacesOptions] = useState<ApiNamedResource[]>([]);
  const [classesOptions, setClassesOptions] = useState<ApiNamedResource[]>([]);
  const [loadingApi, setLoadingApi] = useState<boolean>(true);

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

  useEffect(() => {
    Promise.all([fetchDndRaces(), fetchDndClasses()])
      .then(([racesData, classesData]) => {
        setRacesOptions(racesData);
        setClassesOptions(classesData);
        if (racesData.length > 0) setRace(racesData[0].name);
        if (classesData.length > 0) {
          const initialClass = classesData[0].name;
          setCharacterClass(initialClass);
          setProficiencies(CLASS_SAVING_THROWS[initialClass] || []);
        }
        setLoadingApi(false);
      })
      .catch((err) => {
        console.error('Error cargando datos de dnd5eapi:', err);
        setLoadingApi(false);
      });
  }, []);

  const handleClassChange = (selectedClass: string) => {
    setCharacterClass(selectedClass);
    if (CLASS_SAVING_THROWS[selectedClass]) {
      setProficiencies(CLASS_SAVING_THROWS[selectedClass]);
    }
  };

  const handleProficiencyToggle = (statName: string) => {
    setProficiencies((prev) =>
      prev.includes(statName)
        ? prev.filter((s) => s !== statName)
        : [...prev, statName]
    );
  };

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
        proficiencies,
      } as CreateCharacterPayload);
      setName('');
      onCharacterCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ background: '#1a1b26', border: '1px solid #3b4261', padding: '1.5rem', borderRadius: '12px', color: '#c0caf5', marginBottom: '2rem' }}>
      <h2 style={{ margin: '0 0 1rem 0', color: '#7aa2f7' }}>Crear Nuevo Personaje</h2>
      {error && <p style={{ color: '#f7768e' }}>{error}</p>}

      <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.3rem' }}>Nombre:</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #2ac3de33', background: '#24283b', color: '#fff' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.3rem' }}>Raza (D&D 5e API):</label>
          <select
            value={race}
            onChange={(e) => setRace(e.target.value)}
            disabled={loadingApi}
            style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #2ac3de33', background: '#24283b', color: '#fff' }}
          >
            {loadingApi ? (
              <option>Cargando razas...</option>
            ) : (
              racesOptions.map((item) => (
                <option key={item.index} value={item.name}>
                  {item.name}
                </option>
              ))
            )}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.3rem' }}>Clase (D&D 5e API):</label>
          <select
            value={characterClass}
            onChange={(e) => handleClassChange(e.target.value)}
            disabled={loadingApi}
            style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #2ac3de33', background: '#24283b', color: '#fff' }}
          >
            {loadingApi ? (
              <option>Cargando clases...</option>
            ) : (
              classesOptions.map((item) => (
                <option key={item.index} value={item.name}>
                  {item.name}
                </option>
              ))
            )}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.3rem' }}>Nivel (1-20):</label>
          <input
            type="number"
            min={1}
            max={20}
            value={level}
            onChange={(e) => setLevel(Number(e.target.value))}
            style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #2ac3de33', background: '#24283b', color: '#fff' }}
          />
        </div>
      </div>

      <h3 style={{ marginTop: '1.5rem', color: '#bb9af7' }}>Atributos Base y Competencias de Salvación</h3>
      <div style={{ display: 'grid', gap: '0.75rem', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))' }}>
        {(Object.keys(stats) as Array<keyof typeof stats>).map((statKey) => (
          <div key={statKey} style={{ background: '#24283b', padding: '0.5rem', borderRadius: '6px' }}>
            <label style={{ textTransform: 'capitalize', fontSize: '0.8rem', color: '#7dcfff', display: 'block' }}>{statKey}:</label>
            <input
              type="number"
              min={1}
              max={30}
              value={stats[statKey]}
              onChange={(e) => handleStatChange(statKey, Number(e.target.value))}
              style={{ width: '100%', padding: '0.4rem', borderRadius: '6px', border: '1px solid #2ac3de33', background: '#1a1b26', color: '#fff', marginBottom: '0.4rem' }}
            />
            <label style={{ fontSize: '0.7rem', color: '#a9b1d6', display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={proficiencies.includes(statKey)}
                onChange={() => handleProficiencyToggle(statKey)}
              />
              Competente ⭐
            </label>
          </div>
        ))}
      </div>

      <button
        type="submit"
        disabled={submitting || loadingApi}
        style={{ marginTop: '1.5rem', padding: '0.75rem 1.5rem', background: '#7aa2f7', color: '#1a1b26', fontWeight: 'bold', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
      >
        {submitting ? 'Guardando...' : 'Guardar Personaje'}
      </button>
    </form>
  );
}