import { useState } from 'react';
import type { Character, SpellSlots } from '../types/character.js';
import {
  rollDice,
  rollMassiveDiceGo,
  type RollResult,
  type MassRollResult,
} from '../services/characterApi.js';
import { DND_SKILLS } from './CharacterForm.js';

interface CharacterCardProps {
  character: Character;
}

const DEFAULT_CLASS_THROWS: Record<string, string[]> = {
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

export function CharacterCard({ character }: CharacterCardProps) {
  const [lastRoll, setLastRoll] = useState<RollResult | null>(null);
  const [massResult, setMassResult] = useState<MassRollResult | null>(null);
  const [rollingStat, setRollingStat] = useState<string | null>(null);
  const [loadingMass, setLoadingMass] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Estados de inventario y hechizos interactivos
  const [inventory, setInventory] = useState<string[]>(character.equipment || []);
  const [newItem, setNewItem] = useState('');
  const [activeTab, setActiveTab] = useState<'skills' | 'inventory' | 'spells'>('skills');

  const [spellSlotsState, setSpellSlotsState] = useState<SpellSlots | undefined>(character.spellSlots);

  const formatMod = (mod: number) => (mod >= 0 ? `+${mod}` : `${mod}`);

  const activeProficiencies =
    character.proficiencies && character.proficiencies.length > 0
      ? character.proficiencies
      : DEFAULT_CLASS_THROWS[character.characterClass] || [];

  const activeSkillProficiencies = character.skillProficiencies || [];

  const handleRoll = async (statKey: string, totalModifier: number) => {
    setRollingStat(statKey);
    try {
      const result = await rollDice(statKey, totalModifier);
      setLastRoll(result);
    } catch (err) {
      console.error(err);
    } finally {
      setRollingStat(null);
    }
  };

  const handleMassiveRoll = async (statKey: string, totalModifier: number) => {
    setLoadingMass(true);
    try {
      const result = await rollMassiveDiceGo(statKey, totalModifier, 1000);
      setMassResult(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMass(false);
    }
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.trim()) return;
    setInventory((prev) => [...prev, newItem.trim()]);
    setNewItem('');
  };

  const handleRemoveItem = (index: number) => {
    setInventory((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUseSpellSlot = (slotKey: keyof SpellSlots) => {
    if (!spellSlotsState) return;
    const current = spellSlotsState[slotKey];
    if (current.used < current.total) {
      setSpellSlotsState({
        ...spellSlotsState,
        [slotKey]: { ...current, used: current.used + 1 },
      });
    }
  };

  const handleResetSpellSlots = () => {
    if (!spellSlotsState) return;
    const resetState: SpellSlots = {
      level1: { ...spellSlotsState.level1, used: 0 },
      level2: { ...spellSlotsState.level2, used: 0 },
      level3: { ...spellSlotsState.level3, used: 0 },
      level4: { ...spellSlotsState.level4, used: 0 },
      level5: { ...spellSlotsState.level5, used: 0 },
    };
    setSpellSlotsState(resetState);
  };

  return (
    <div
      style={{
        background: '#1a1b26',
        border: '1px solid #3b4261',
        borderRadius: '12px',
        padding: '1.25rem',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
        color: '#c0caf5',
        gridColumn: isExpanded ? '1 / -1' : 'span 1',
        transition: 'all 0.3s ease-in-out',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isExpanded ? '1fr 380px' : '1fr',
          gap: '1.25rem',
          alignItems: 'start',
        }}
      >
        {/* PANEL IZQUIERDO: Tarjeta Principal */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {/* Cabecera */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid #2ac3de33',
              paddingBottom: '0.6rem',
            }}
          >
            <div>
              <h2 style={{ margin: 0, color: '#7aa2f7', fontSize: '1.3rem' }}>
                {character.name}
              </h2>
              <span style={{ color: '#9ece6a', fontSize: '0.85rem', fontWeight: 600 }}>
                {character.race} • {character.characterClass}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              {/* Insignia AC */}
              <div
                style={{
                  background: '#7aa2f722',
                  border: '1px solid #7aa2f7',
                  borderRadius: '16px',
                  padding: '0.15rem 0.5rem',
                  textAlign: 'center',
                }}
              >
                <span style={{ fontSize: '0.6rem', display: 'block', color: '#7aa2f7' }}>
                  🛡️ AC
                </span>
                <strong style={{ fontSize: '0.95rem', color: '#fff' }}>
                  {character.armorClass || 10}
                </strong>
              </div>

              {/* Insignia Nivel */}
              <div
                style={{
                  background: '#7dcfff22',
                  border: '1px solid #7dcfff',
                  borderRadius: '16px',
                  padding: '0.15rem 0.5rem',
                  textAlign: 'center',
                }}
              >
                <span style={{ fontSize: '0.6rem', display: 'block', color: '#7dcfff' }}>
                  NIVEL
                </span>
                <strong style={{ fontSize: '0.95rem', color: '#fff' }}>{character.level}</strong>
              </div>

              {/* Botón Plegar/Desplegar */}
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                style={{
                  background: isExpanded ? '#bb9af722' : '#24283b',
                  border: `1px solid ${isExpanded ? '#bb9af7' : '#3b4261'}`,
                  color: isExpanded ? '#bb9af7' : '#7dcfff',
                  padding: '0.4rem 0.6rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                }}
              >
                {isExpanded ? '◀ Panel' : '▶ Panel'}
              </button>
            </div>
          </div>

          {/* Bono de Competencia & Competencias de Armas */}
          <div style={{ background: '#24283b', padding: '0.5rem 0.85rem', borderRadius: '6px', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#a9b1d6' }}>Bono de Competencia:</span>
              <strong style={{ color: '#bb9af7', fontSize: '1rem' }}>+{character.proficiencyBonus}</strong>
            </div>
            {character.weaponProficiencies && (
              <div style={{ fontSize: '0.7rem', color: '#7dcfff' }}>
                ⚔️ <strong>Armas:</strong> {character.weaponProficiencies.join(', ')}
              </div>
            )}
          </div>

          {/* Resultado de Tirada Individual (Node.js) */}
          {lastRoll && (
            <div
              style={{
                background: lastRoll.isCriticalSuccess
                  ? '#9ece6a33'
                  : lastRoll.isCriticalFailure
                  ? '#f7768e33'
                  : '#7aa2f722',
                border: `1px solid ${
                  lastRoll.isCriticalSuccess
                    ? '#9ece6a'
                    : lastRoll.isCriticalFailure
                    ? '#f7768e'
                    : '#7aa2f7'
                }`,
                padding: '0.4rem 0.6rem',
                borderRadius: '6px',
                textAlign: 'center',
                fontSize: '0.8rem',
              }}
            >
              🎲 <strong>{lastRoll.statName.toUpperCase()}:</strong> Dado ({lastRoll.d20Roll}) {formatMod(lastRoll.modifier)} ={' '}
              <strong style={{ fontSize: '1rem', color: '#fff' }}>{lastRoll.total}</strong>
              {lastRoll.isCriticalSuccess && <span style={{ display: 'block', color: '#9ece6a' }}>🔥 ¡ÉXITO CRÍTICO (20)!</span>}
              {lastRoll.isCriticalFailure && <span style={{ display: 'block', color: '#f7768e' }}>💀 ¡FALLO CRÍTICO (1)!</span>}
            </div>
          )}

          {/* Resultado de Simulación Masiva (Go) */}
          {massResult && (
            <div
              style={{
                background: '#1f2335',
                border: '1px solid #bb9af7',
                padding: '0.5rem 0.75rem',
                borderRadius: '6px',
                fontSize: '0.8rem',
              }}
            >
              <div style={{ color: '#bb9af7', fontWeight: 'bold', marginBottom: '0.2rem' }}>
                ⚡ Simulación Go: {massResult.totalRolls} tiradas ({massResult.statName.toUpperCase()})
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#c0caf5' }}>
                <span>Promedio: <strong style={{ color: '#e0af68' }}>{massResult.averageTotal.toFixed(2)}</strong></span>
                <span>Críticos: <strong style={{ color: '#9ece6a' }}>{massResult.criticalSuccesses}</strong></span>
                <span>Fallos: <strong style={{ color: '#f7768e' }}>{massResult.criticalFailures}</strong></span>
              </div>
            </div>
          )}

          {/* Rejilla de Atributos Base */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.4rem' }}>
            {(Object.keys(character.stats) as Array<keyof typeof character.stats>).map((statKey) => {
              const score = character.stats[statKey];
              const baseMod = character.modifiers[statKey];
              const isProficient = activeProficiencies.some((p) => p.toLowerCase() === statKey.toLowerCase());
              const totalMod = isProficient ? baseMod + character.proficiencyBonus : baseMod;

              const avgNormal = (10.5 + totalMod).toFixed(1);
              const avgAdvantage = (13.83 + totalMod).toFixed(1);
              const avgDisadvantage = (7.18 + totalMod).toFixed(1);
              const isRolling = rollingStat === statKey;

              return (
                <div
                  key={statKey}
                  style={{
                    background: '#16161e',
                    border: isProficient ? '1px solid #7aa2f7' : '1px solid #292e42',
                    borderRadius: '8px',
                    padding: '0.4rem',
                    textAlign: 'center',
                    color: '#c0caf5',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div onClick={() => handleRoll(statKey, totalMod)} style={{ cursor: 'pointer' }}>
                    <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: isProficient ? '#7aa2f7' : '#565f89', fontWeight: 'bold' }}>
                      {statKey.slice(0, 3)} {isProficient && '⭐'}
                    </div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#fff' }}>
                      {formatMod(totalMod)}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#7a88cf', marginBottom: '0.2rem' }}>
                      {isRolling ? '🎲 ...' : `(${score})`}
                    </div>

                    <div style={{ fontSize: '0.62rem', lineHeight: '1.25', textAlign: 'left', background: '#1a1b26', padding: '0.25rem', borderRadius: '4px', border: '1px solid #24283b' }}>
                      <div style={{ color: '#e0af68', fontWeight: 'bold' }}>Promedio</div>
                      <div style={{ color: '#c0caf5' }}>Normal: {avgNormal}</div>
                      <div style={{ color: '#9ece6a' }}>Ventaja: {avgAdvantage}</div>
                      <div style={{ color: '#f7768e' }}>Desventaja: {avgDisadvantage}</div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleMassiveRoll(statKey, totalMod)}
                    disabled={loadingMass}
                    style={{
                      marginTop: '0.35rem',
                      fontSize: '0.6rem',
                      background: '#bb9af722',
                      border: '1px solid #bb9af7',
                      color: '#bb9af7',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      padding: '0.12rem 0.25rem',
                    }}
                  >
                    {loadingMass ? '...' : '⚡ 1k Go'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* PANEL DERECHO: Pestañas de Habilidades, Inventario y Hechizos */}
        {isExpanded && (
          <div style={{ background: '#16161e', border: '1px solid #3b4261', borderRadius: '8px', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '460px', overflowY: 'auto' }}>
            {/* Pestañas Superiores */}
            <div style={{ display: 'flex', gap: '0.3rem', borderBottom: '1px solid #24283b', paddingBottom: '0.4rem' }}>
              <button
                onClick={() => setActiveTab('skills')}
                style={{ flex: 1, padding: '0.25rem', fontSize: '0.7rem', borderRadius: '4px', border: 'none', background: activeTab === 'skills' ? '#7aa2f7' : '#24283b', color: activeTab === 'skills' ? '#1a1b26' : '#c0caf5', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Habilidades
              </button>
              <button
                onClick={() => setActiveTab('inventory')}
                style={{ flex: 1, padding: '0.25rem', fontSize: '0.7rem', borderRadius: '4px', border: 'none', background: activeTab === 'inventory' ? '#7aa2f7' : '#24283b', color: activeTab === 'inventory' ? '#1a1b26' : '#c0caf5', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Inventario ({inventory.length})
              </button>
              {character.isSpellcaster && (
                <button
                  onClick={() => setActiveTab('spells')}
                  style={{ flex: 1, padding: '0.25rem', fontSize: '0.7rem', borderRadius: '4px', border: 'none', background: activeTab === 'spells' ? '#bb9af7' : '#24283b', color: activeTab === 'spells' ? '#1a1b26' : '#c0caf5', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  ✨ Hechizos
                </button>
              )}
            </div>

            {/* VISTA 1: HABILIDADES */}
            {activeTab === 'skills' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {DND_SKILLS.map((skill) => {
                  const baseStatKey = skill.stat as keyof typeof character.stats;
                  const baseMod = character.modifiers[baseStatKey] || 0;
                  const isSkillProficient = activeSkillProficiencies.includes(skill.key);
                  const totalMod = isSkillProficient ? baseMod + character.proficiencyBonus : baseMod;

                  const avgNormal = (10.5 + totalMod).toFixed(1);
                  const avgAdvantage = (13.83 + totalMod).toFixed(1);
                  const avgDisadvantage = (7.18 + totalMod).toFixed(1);

                  return (
                    <div
                      key={skill.key}
                      onClick={() => handleRoll(skill.name, totalMod)}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: '#1a1b26',
                        padding: '0.35rem 0.5rem',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        border: isSkillProficient ? '1px solid #7aa2f7' : '1px solid #24283b',
                      }}
                    >
                      <div>
                        <span style={{ fontSize: '0.75rem', color: isSkillProficient ? '#7aa2f7' : '#c0caf5', fontWeight: isSkillProficient ? 'bold' : 'normal' }}>
                          {skill.name} {isSkillProficient && '⭐'}
                        </span>
                        <div style={{ fontSize: '0.6rem', display: 'flex', gap: '0.4rem', marginTop: '0.1rem' }}>
                          <span style={{ color: '#e0af68', fontWeight: 'bold' }}>Promedio</span>
                          <span style={{ color: '#c0caf5' }}>Normal: {avgNormal}</span>
                          <span style={{ color: '#9ece6a' }}>Ventaja: {avgAdvantage}</span>
                          <span style={{ color: '#f7768e' }}>Desventaja: {avgDisadvantage}</span>
                        </div>
                      </div>
                      <strong style={{ fontSize: '0.9rem', color: '#fff' }}>{formatMod(totalMod)}</strong>
                    </div>
                  );
                })}
              </div>
            )}

            {/* VISTA 2: INVENTARIO DINÁMICO */}
            {activeTab === 'inventory' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <form onSubmit={handleAddItem} style={{ display: 'flex', gap: '0.4rem' }}>
                  <input
                    type="text"
                    placeholder="Añadir ítem (ej. Poción)"
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    style={{ flex: 1, padding: '0.35rem', fontSize: '0.75rem', borderRadius: '4px', border: '1px solid #2ac3de33', background: '#1a1b26', color: '#fff' }}
                  />
                  <button type="submit" style={{ padding: '0.35rem 0.6rem', background: '#7aa2f7', color: '#1a1b26', fontWeight: 'bold', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}>
                    + Agregar
                  </button>
                </form>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  {inventory.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#1a1b26', padding: '0.3rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem' }}>
                      <span>📦 {item}</span>
                      <button
                        onClick={() => handleRemoveItem(idx)}
                        style={{ background: 'transparent', border: 'none', color: '#f7768e', cursor: 'pointer', fontSize: '0.8rem' }}
                      >
                        ❌
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* VISTA 3: ESPACIOS DE HECHIZOS (SPELL SLOTS) */}
            {activeTab === 'spells' && character.isSpellcaster && spellSlotsState && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: '#bb9af7' }}>
                  <span>Atributo Clave: <strong>{character.spellcastingAbility?.toUpperCase()}</strong></span>
                  <button
                    onClick={handleResetSpellSlots}
                    style={{ background: '#bb9af722', border: '1px solid #bb9af7', color: '#bb9af7', padding: '0.2rem 0.4rem', borderRadius: '4px', fontSize: '0.65rem', cursor: 'pointer' }}
                  >
                    🌙 Descanso Largo (Reset)
                  </button>
                </div>

                {(Object.keys(spellSlotsState) as Array<keyof SpellSlots>).map((slotKey, idx) => {
                  const slot = spellSlotsState[slotKey];
                  if (slot.total === 0) return null;

                  return (
                    <div key={slotKey} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#1a1b26', padding: '0.4rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem' }}>
                      <div>
                        <strong>Nivel {idx + 1}:</strong> {slot.total - slot.used} / {slot.total} Disponibles
                      </div>
                      <button
                        onClick={() => handleUseSpellSlot(slotKey)}
                        disabled={slot.used >= slot.total}
                        style={{
                          background: slot.used < slot.total ? '#7aa2f7' : '#24283b',
                          color: slot.used < slot.total ? '#1a1b26' : '#565f89',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '0.2rem 0.5rem',
                          cursor: slot.used < slot.total ? 'pointer' : 'not-allowed',
                          fontSize: '0.7rem',
                          fontWeight: 'bold',
                        }}
                      >
                        {slot.used < slot.total ? 'Gastar ✨' : 'Agotado'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}