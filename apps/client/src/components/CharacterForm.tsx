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

export const DND_SKILLS: Array<{ name: string; key: string; stat: string }> = [
  { name: 'Acrobacia (Acrobatics)', key: 'acrobatics', stat: 'dexterity' },
  { name: 'Trato con Animales (Animal Handling)', key: 'animalHandling', stat: 'wisdom' },
  { name: 'Arcana (Arcana)', key: 'arcana', stat: 'intelligence' },
  { name: 'Atletismo (Athletics)', key: 'athletics', stat: 'strength' },
  { name: 'Engaño (Deception)', key: 'deception', stat: 'charisma' },
  { name: 'Historia (History)', key: 'history', stat: 'intelligence' },
  { name: 'Perspicacia (Insight)', key: 'insight', stat: 'wisdom' },
  { name: 'Intimidación (Intimidation)', key: 'intimidation', stat: 'charisma' },
  { name: 'Investigación (Investigation)', key: 'investigation', stat: 'intelligence' },
  { name: 'Medicina (Medicine)', key: 'medicine', stat: 'wisdom' },
  { name: 'Naturaleza (Nature)', key: 'nature', stat: 'intelligence' },
  { name: 'Percepción (Perception)', key: 'perception', stat: 'wisdom' },
  { name: 'Interpretación (Performance)', key: 'performance', stat: 'charisma' },
  { name: 'Persuasión (Persuasion)', key: 'persuasion', stat: 'charisma' },
  { name: 'Religión (Religion)', key: 'religion', stat: 'intelligence' },
  { name: 'Juego de Manos (Sleight of Hand)', key: 'sleightOfHand', stat: 'dexterity' },
  { name: 'Sigilo (Stealth)', key: 'stealth', stat: 'dexterity' },
  { name: 'Supervivencia (Survival)', key: 'survival', stat: 'wisdom' },
];

export function CharacterForm({ onCharacterCreated, createCharacterFn }: CharacterFormProps) {
  const [name, setName] = useState('');
  const [race, setRace] = useState('');
  const [characterClass, setCharacterClass] = useState('');
  const [level, setLevel] = useState(1);
  const [proficiencies, setProficiencies] = useState<string[]>([]);
  const [skillProficiencies, setSkillProficiencies] = useState<string[]>([]);

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
      prev.includes(statName) ? prev.filter((s) => s !== statName) : [...prev, statName]
    );
  };

  const handleSkillToggle = (skillKey: string) => {
    setSkillProficiencies((prev) =>
      prev.includes(skillKey) ? prev.filter((s) => s !== skillKey) : [...prev, skillKey]
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
        skillProficiencies,
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
    <form
      onSubmit={handleSubmit}
      style={{
        background: '#1a1b26',
        border: '1px solid #3b4261',
        padding: '1.5rem',
        borderRadius: '12px',
        color: '#c0caf5',
        marginBottom: '2rem',
      }}
    >
      <h2 style={{ margin: '0 0 1.25rem 0', color: '#7aa2f7', textAlign: 'center' }}>
        Crear Nuevo Personaje
      </h2>
      {error && <p style={{ color: '#f7768e', textAlign: 'center' }}>{error}</p>}

      {/* Grid Principal de 2 Columnas */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 340px',
          gap: '1.5rem',
          alignItems: 'start',
        }}
      >
        {/* COLUMNA IZQUIERDA: Datos Generales y Atributos */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Fila Datos Personaje */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '0.75rem',
            }}
          >
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.25rem', color: '#7dcfff' }}>
                Nombre:
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.45rem',
                  borderRadius: '6px',
                  border: '1px solid #2ac3de33',
                  background: '#24283b',
                  color: '#fff',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.25rem', color: '#7dcfff' }}>
                Raza (API):
              </label>
              <select
                value={race}
                onChange={(e) => setRace(e.target.value)}
                disabled={loadingApi}
                style={{
                  width: '100%',
                  padding: '0.45rem',
                  borderRadius: '6px',
                  border: '1px solid #2ac3de33',
                  background: '#24283b',
                  color: '#fff',
                  boxSizing: 'border-box',
                }}
              >
                {loadingApi ? (
                  <option>Cargando...</option>
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
              <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.25rem', color: '#7dcfff' }}>
                Clase (API):
              </label>
              <select
                value={characterClass}
                onChange={(e) => handleClassChange(e.target.value)}
                disabled={loadingApi}
                style={{
                  width: '100%',
                  padding: '0.45rem',
                  borderRadius: '6px',
                  border: '1px solid #2ac3de33',
                  background: '#24283b',
                  color: '#fff',
                  boxSizing: 'border-box',
                }}
              >
                {loadingApi ? (
                  <option>Cargando...</option>
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
              <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.25rem', color: '#7dcfff' }}>
                Nivel (1-20):
              </label>
              <input
                type="number"
                min={1}
                max={20}
                value={level}
                onChange={(e) => setLevel(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '0.45rem',
                  borderRadius: '6px',
                  border: '1px solid #2ac3de33',
                  background: '#24283b',
                  color: '#fff',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          {/* Fila Atributos Base en 1 Sola Línea (6 columnas) */}
          <div>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#bb9af7', fontSize: '0.95rem' }}>
              Atributos Base y Salvaciones
            </h3>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(6, 1fr)',
                gap: '0.4rem',
              }}
            >
              {(Object.keys(stats) as Array<keyof typeof stats>).map((statKey) => (
                <div
                  key={statKey}
                  style={{
                    background: '#24283b',
                    padding: '0.4rem',
                    borderRadius: '6px',
                    textAlign: 'center',
                  }}
                >
                  <label
                    style={{
                      textTransform: 'uppercase',
                      fontSize: '0.65rem',
                      color: '#7dcfff',
                      fontWeight: 'bold',
                      display: 'block',
                      marginBottom: '0.2rem',
                    }}
                  >
                    {statKey.slice(0, 3)}
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={stats[statKey]}
                    onChange={(e) => handleStatChange(statKey, Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '0.25rem',
                      borderRadius: '4px',
                      border: '1px solid #2ac3de33',
                      background: '#1a1b26',
                      color: '#fff',
                      textAlign: 'center',
                      fontSize: '0.85rem',
                      boxSizing: 'border-box',
                      marginBottom: '0.3rem',
                    }}
                  />
                  <label
                    style={{
                      fontSize: '0.6rem',
                      color: '#a9b1d6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.15rem',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={proficiencies.includes(statKey)}
                      onChange={() => handleProficiencyToggle(statKey)}
                      style={{ margin: 0, width: '12px', height: '12px' }}
                    />
                    ⭐
                  </label>
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || loadingApi}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#7aa2f7',
              color: '#1a1b26',
              fontWeight: 'bold',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              marginTop: '0.5rem',
            }}
          >
            {submitting ? 'Guardando...' : 'Guardar Personaje'}
          </button>
        </div>

        {/* COLUMNA DERECHA: Apartado de Checkboxes de Habilidades (Skills) */}
        <div
          style={{
            background: '#24283b',
            padding: '1rem',
            borderRadius: '8px',
            border: '1px solid #3b4261',
          }}
        >
          <h3
            style={{
              margin: '0 0 0.75rem 0',
              color: '#bb9af7',
              fontSize: '0.9rem',
              borderBottom: '1px solid #3b4261',
              paddingBottom: '0.4rem',
            }}
          >
            Competencias en Habilidades (Skills)
          </h3>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.35rem',
              maxHeight: '260px',
              overflowY: 'auto',
              paddingRight: '0.25rem',
            }}
          >
            {DND_SKILLS.map((skill) => (
              <label
                key={skill.key}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.3rem 0.5rem',
                  background: '#1a1b26',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  color: '#c0caf5',
                }}
              >
                <span>
                  {skill.name}{' '}
                  <small style={{ color: '#565f89' }}>
                    ({skill.stat.slice(0, 3).toUpperCase()})
                  </small>
                </span>
                <input
                  type="checkbox"
                  checked={skillProficiencies.includes(skill.key)}
                  onChange={() => handleSkillToggle(skill.key)}
                  style={{ cursor: 'pointer' }}
                />
              </label>
            ))}
          </div>
        </div>
      </div>
    </form>
  );
}