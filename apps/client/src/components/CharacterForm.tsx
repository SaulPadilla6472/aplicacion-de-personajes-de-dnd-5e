import { useEffect, useState } from 'react';
import type { CreateCharacterPayload, SpellSlots } from '../types/character.js';
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

const CLASS_ARMOR_PROFICIENCIES: Record<string, { light: boolean; medium: boolean; heavy: boolean; shield: boolean }> = {
  Barbarian: { light: true, medium: true, heavy: false, shield: true },
  Bard: { light: true, medium: false, heavy: false, shield: false },
  Cleric: { light: true, medium: true, heavy: true, shield: true },
  Druid: { light: true, medium: true, heavy: false, shield: true },
  Fighter: { light: true, medium: true, heavy: true, shield: true },
  Monk: { light: false, medium: false, heavy: false, shield: false },
  Paladin: { light: true, medium: true, heavy: true, shield: true },
  Ranger: { light: true, medium: true, heavy: false, shield: true },
  Rogue: { light: true, medium: false, heavy: false, shield: false },
  Sorcerer: { light: false, medium: false, heavy: false, shield: false },
  Warlock: { light: true, medium: false, heavy: false, shield: false },
  Wizard: { light: false, medium: false, heavy: false, shield: false },
};

// Competencias de Armas según la clase
const CLASS_WEAPON_PROFICIENCIES: Record<string, string[]> = {
  Barbarian: ['Armas Sencillas', 'Armas Marciales'],
  Bard: ['Armas Sencillas', 'Ballesta Ligera', 'Espada Corta', 'Estoque', 'Espada Larga'],
  Cleric: ['Armas Sencillas'],
  Druid: ['Bastón', 'Daga', 'Garrote', 'Hoz', 'Jabalina', 'Lanza', 'Maza', 'Orbe', 'Honda'],
  Fighter: ['Armas Sencillas', 'Armas Marciales'],
  Monk: ['Armas Sencillas', 'Espadas Cortas'],
  Paladin: ['Armas Sencillas', 'Armas Marciales'],
  Ranger: ['Armas Sencillas', 'Armas Marciales'],
  Rogue: ['Armas Sencillas', 'Ballesta Ligera', 'Espada Corta', 'Estoque', 'Espada Larga'],
  Sorcerer: ['Ballesta Ligera', 'Daga', 'Dardo', 'Bastón', 'Honda'],
  Warlock: ['Armas Sencillas'],
  Wizard: ['Daga', 'Dardo', 'Bastón', 'Honda', 'Ballesta Ligera'],
};

// Paquetes de Inicio de Inventario por Clase
const STARTER_PACKS: Record<string, string[]> = {
  Barbarian: ["Gran Hacha (Greataxe)", "2x Hacha de Mano", "Paquete de Explorador", "4x Jabalinas"],
  Bard: ["Estoque (Rapier)", "Paquete de Artista", "Lúdico / Instrumento Musical", "Armadura de Cuero", "Daga"],
  Cleric: ["Maza (Mace)", "Cota de Escamas", "Ballesta Ligera + 20 Virotes", "Paquete de Sacerdote", "Símbolo Sagrado"],
  Druid: ["Escudo de Madera", "Cimitarra", "Armadura de Cuero", "Paquete de Explorador", "Foco Druídico"],
  Fighter: ["Cota de Mallas", "Arma Marcial & Escudo", "Ballesta Ligera + 20 Virotes", "Paquete de Calabozo"],
  Monk: ["Espada Corta", "Paquete de Explorador", "10x Dardos"],
  Paladin: ["Arma Marcial & Escudo", "5x Jabalinas", "Paquete de Sacerdote", "Símbolo Sagrado", "Cota de Mallas"],
  Ranger: ["Cuero Tachonado", "2x Espadas Cortas", "Paquete de Explorador", "Arco Largo + 20 Flechas"],
  Rogue: ["Estoque", "Arco Corto + 20 Flechas", "Paquete de Ladrón", "Armadura de Cuero", "2x Dagas", "Herramientas de Ladrón"],
  Sorcerer: ["Ballesta Ligera + 20 Virotes", "Foco Arcano", "Paquete de Explorador", "2x Dagas"],
  Warlock: ["Ballesta Ligera + 20 Virotes", "Foco Arcano", "Paquete de Erudito", "Armadura de Cuero", "Daga"],
  Wizard: ["Bastón Mágico", "Foco Arcano", "Libro de Hechizos", "Paquete de Erudito", "Daga"],
};

// Cálculo básico de ranuras de hechizos según nivel y clase
const getInitialSpellSlots = (characterClass: string, level: number): { isSpellcaster: boolean; ability?: 'intelligence' | 'wisdom' | 'charisma'; slots?: SpellSlots } => {
  const fullCasters: Record<string, 'intelligence' | 'wisdom' | 'charisma'> = {
    Bard: 'charisma',
    Cleric: 'wisdom',
    Druid: 'wisdom',
    Sorcerer: 'charisma',
    Wizard: 'intelligence',
  };
  const warlockCaster = characterClass === 'Warlock';
  const halfCasters: Record<string, 'wisdom' | 'charisma'> = { Paladin: 'charisma', Ranger: 'wisdom' };

  if (fullCasters[characterClass]) {
    const l1 = level >= 1 ? (level === 1 ? 2 : level === 2 ? 3 : 4) : 0;
    const l2 = level >= 3 ? (level === 3 ? 2 : 3) : 0;
    return {
      isSpellcaster: true,
      ability: fullCasters[characterClass],
      slots: {
        level1: { total: l1, used: 0 },
        level2: { total: l2, used: 0 },
        level3: { total: level >= 5 ? 2 : 0, used: 0 },
        level4: { total: level >= 7 ? 1 : 0, used: 0 },
        level5: { total: level >= 9 ? 1 : 0, used: 0 },
      },
    };
  }

  if (warlockCaster) {
    const pactSlots = level >= 2 ? 2 : 1;
    return {
      isSpellcaster: true,
      ability: 'charisma',
      slots: {
        level1: { total: pactSlots, used: 0 },
        level2: { total: 0, used: 0 },
        level3: { total: 0, used: 0 },
        level4: { total: 0, used: 0 },
        level5: { total: 0, used: 0 },
      },
    };
  }

  if (halfCasters[characterClass] && level >= 2) {
    return {
      isSpellcaster: true,
      ability: halfCasters[characterClass],
      slots: {
        level1: { total: 2, used: 0 },
        level2: { total: level >= 5 ? 2 : 0, used: 0 },
        level3: { total: 0, used: 0 },
        level4: { total: 0, used: 0 },
        level5: { total: 0, used: 0 },
      },
    };
  }

  return { isSpellcaster: false };
};

export interface ArmorOption {
  name: string;
  type: 'none' | 'light' | 'medium' | 'heavy';
  baseAc: number;
  maxDexBonus: number | null;
}

const ARMOR_LIST: ArmorOption[] = [
  { name: 'Sin Armadura (Ropa Común)', type: 'none', baseAc: 10, maxDexBonus: null },
  { name: 'Armadura de Cuero (Light)', type: 'light', baseAc: 11, maxDexBonus: null },
  { name: 'Cuero Tachonado (Light)', type: 'light', baseAc: 12, maxDexBonus: null },
  { name: 'Camisote de Mallas (Medium)', type: 'medium', baseAc: 13, maxDexBonus: 2 },
  { name: 'Coraza (Medium)', type: 'medium', baseAc: 14, maxDexBonus: 2 },
  { name: 'Cota de Mallas (Heavy)', type: 'heavy', baseAc: 16, maxDexBonus: 0 },
  { name: 'Armadura de Placas (Heavy)', type: 'heavy', baseAc: 18, maxDexBonus: 0 },
];

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

  const [selectedArmor, setSelectedArmor] = useState<ArmorOption>(ARMOR_LIST[0]);
  const [hasShield, setHasShield] = useState(false);

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

  const dexMod = Math.floor((stats.dexterity - 10) / 2);

  const classArmorProf = CLASS_ARMOR_PROFICIENCIES[characterClass] || {
    light: false,
    medium: false,
    heavy: false,
    shield: false,
  };

  const calculateAC = (): number => {
    let dexBonusApplied = dexMod;
    if (selectedArmor.maxDexBonus !== null) {
      dexBonusApplied = Math.min(dexMod, selectedArmor.maxDexBonus);
    }
    const shieldBonus = hasShield && classArmorProf.shield ? 2 : 0;
    return selectedArmor.baseAc + dexBonusApplied + shieldBonus;
  };

  const calculatedAC = calculateAC();

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
    setSelectedArmor(ARMOR_LIST[0]);
    setHasShield(false);
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

    // Generar inventario inicial uniendo la armadura + escudo + paquete de inicio
    const starterItems = STARTER_PACKS[characterClass] || ["Paquete de Aventurero"];
    const equipmentList: string[] = [selectedArmor.name, ...starterItems];
    if (hasShield && classArmorProf.shield) equipmentList.push('Escudo (+2 AC)');

    const spellInfo = getInitialSpellSlots(characterClass, level);

    try {
      await createCharacterFn({
        name,
        race,
        characterClass,
        level,
        armorClass: calculatedAC,
        equipment: equipmentList,
        weaponProficiencies: CLASS_WEAPON_PROFICIENCIES[characterClass] || ['Armas Sencillas'],
        isSpellcaster: spellInfo.isSpellcaster,
        spellcastingAbility: spellInfo.ability,
        spellSlots: spellInfo.slots,
        stats,
        proficiencies,
        skillProficiencies,
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

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 340px',
          gap: '1.5rem',
          alignItems: 'start',
        }}
      >
        {/* COLUMNA IZQUIERDA */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
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

          {/* Sección Equipamiento, Armadura & Paquete de Inicio */}
          <div style={{ background: '#24283b', padding: '0.85rem', borderRadius: '8px', border: '1px solid #3b4261' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <h3 style={{ margin: 0, color: '#bb9af7', fontSize: '0.9rem' }}>
                Equipamiento Inicial & Clase de Armadura (AC)
              </h3>
              <div style={{ background: '#7aa2f722', border: '1px solid #7aa2f7', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.85rem' }}>
                🛡️ AC Calculada: <strong style={{ color: '#fff' }}>{calculatedAC}</strong>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '0.75rem', alignItems: 'center', marginBottom: '0.6rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#a9b1d6', marginBottom: '0.2rem' }}>
                  Armadura Equipable ({characterClass}):
                </label>
                <select
                  value={selectedArmor.name}
                  onChange={(e) => {
                    const armor = ARMOR_LIST.find((a) => a.name === e.target.value);
                    if (armor) setSelectedArmor(armor);
                  }}
                  style={{ width: '100%', padding: '0.4rem', borderRadius: '6px', border: '1px solid #2ac3de33', background: '#1a1b26', color: '#fff', fontSize: '0.8rem' }}
                >
                  {ARMOR_LIST.map((armor) => {
                    const isProficient =
                      armor.type === 'none' ||
                      (armor.type === 'light' && classArmorProf.light) ||
                      (armor.type === 'medium' && classArmorProf.medium) ||
                      (armor.type === 'heavy' && classArmorProf.heavy);

                    return (
                      <option key={armor.name} value={armor.name} disabled={!isProficient}>
                        {armor.name} {!isProficient ? '⛔ (Sin Competencia)' : ''}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '1rem' }}>
                <input
                  type="checkbox"
                  id="shieldCheck"
                  checked={hasShield}
                  disabled={!classArmorProf.shield}
                  onChange={(e) => setHasShield(e.target.checked)}
                  style={{ cursor: classArmorProf.shield ? 'pointer' : 'not-allowed' }}
                />
                <label htmlFor="shieldCheck" style={{ fontSize: '0.75rem', color: classArmorProf.shield ? '#c0caf5' : '#565f89', cursor: classArmorProf.shield ? 'pointer' : 'not-allowed' }}>
                  Escudo (+2 AC) {!classArmorProf.shield && '⛔'}
                </label>
              </div>
            </div>

            {/* Vista Previa de Paquete de Inicio */}
            <div style={{ fontSize: '0.72rem', color: '#7dcfff', background: '#1a1b26', padding: '0.4rem', borderRadius: '4px' }}>
              📦 <strong>Paquete de Inicio de {characterClass}:</strong>{' '}
              {STARTER_PACKS[characterClass]?.join(', ') || 'Equipo estándar'}
            </div>
          </div>

          {/* Atributos Base */}
          <div>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#bb9af7', fontSize: '0.95rem' }}>
              Atributos Base y Salvaciones
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.4rem' }}>
              {(Object.keys(stats) as Array<keyof typeof stats>).map((statKey) => (
                <div key={statKey} style={{ background: '#24283b', padding: '0.4rem', borderRadius: '6px', textAlign: 'center' }}>
                  <label style={{ textTransform: 'uppercase', fontSize: '0.65rem', color: '#7dcfff', fontWeight: 'bold', display: 'block', marginBottom: '0.2rem' }}>
                    {statKey.slice(0, 3)}
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={stats[statKey]}
                    onChange={(e) => handleStatChange(statKey, Number(e.target.value))}
                    style={{ width: '100%', padding: '0.25rem', borderRadius: '4px', border: '1px solid #2ac3de33', background: '#1a1b26', color: '#fff', textAlign: 'center', fontSize: '0.85rem', boxSizing: 'border-box', marginBottom: '0.3rem' }}
                  />
                  <label style={{ fontSize: '0.6rem', color: '#a9b1d6', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.15rem', cursor: 'pointer' }}>
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

        {/* COLUMNA DERECHA */}
        <div style={{ background: '#24283b', padding: '1rem', borderRadius: '8px', border: '1px solid #3b4261' }}>
          <h3 style={{ margin: '0 0 0.75rem 0', color: '#bb9af7', fontSize: '0.9rem', borderBottom: '1px solid #3b4261', paddingBottom: '0.4rem' }}>
            Competencias en Habilidades (Skills)
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', maxHeight: '380px', overflowY: 'auto', paddingRight: '0.25rem' }}>
            {DND_SKILLS.map((skill) => (
              <label key={skill.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.3rem 0.5rem', background: '#1a1b26', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', color: '#c0caf5' }}>
                <span>
                  {skill.name} <small style={{ color: '#565f89' }}>({skill.stat.slice(0, 3).toUpperCase()})</small>
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