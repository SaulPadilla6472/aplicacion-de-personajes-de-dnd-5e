import { useState } from 'react';
import type { Character } from '../types/character.js';
import { rollDice, type RollResult } from '../services/characterApi.js';

interface CharacterCardProps {
  character: Character;
}

export function CharacterCard({ character }: CharacterCardProps) {
  const [lastRoll, setLastRoll] = useState<RollResult | null>(null);
  const [rollingStat, setRollingStat] = useState<string | null>(null);

  const formatMod = (mod: number) => (mod >= 0 ? `+${mod}` : `${mod}`);

  const handleRoll = async (statKey: string, modifier: number) => {
    setRollingStat(statKey);
    try {
      const result = await rollDice(statKey, modifier);
      setLastRoll(result);
    } catch (err) {
      console.error(err);
    } finally {
      setRollingStat(null);
    }
  };

  return (
    <div
      style={{
        background: '#1a1b26',
        border: '1px solid #3b4261',
        borderRadius: '12px',
        padding: '1.5rem',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
        color: '#c0caf5',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}
    >
      {/* Cabecera */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #2ac3de33',
          paddingBottom: '0.75rem',
        }}
      >
        <div>
          <h2 style={{ margin: 0, color: '#7aa2f7', fontSize: '1.4rem' }}>
            {character.name}
          </h2>
          <span style={{ color: '#9ece6a', fontSize: '0.9rem', fontWeight: 600 }}>
            {character.race} • {character.characterClass}
          </span>
        </div>
        <div
          style={{
            background: '#7dcfff22',
            border: '1px solid #7dcfff',
            borderRadius: '20px',
            padding: '0.25rem 0.75rem',
            textAlign: 'center',
          }}
        >
          <span style={{ fontSize: '0.75rem', display: 'block', color: '#7dcfff' }}>
            NIVEL
          </span>
          <strong style={{ fontSize: '1.1rem', color: '#fff' }}>{character.level}</strong>
        </div>
      </div>

      {/* Bono de Competencia */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#24283b',
          padding: '0.5rem 1rem',
          borderRadius: '8px',
        }}
      >
        <span style={{ fontSize: '0.9rem', color: '#a9b1d6' }}>
          Bono de Competencia:
        </span>
        <strong style={{ color: '#bb9af7', fontSize: '1.1rem' }}>
          +{character.proficiencyBonus}
        </strong>
      </div>

      {/* Resultado visual del dado */}
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
            padding: '0.5rem 0.75rem',
            borderRadius: '8px',
            textAlign: 'center',
            fontSize: '0.85rem',
          }}
        >
          🎲 <strong>{lastRoll.statName.toUpperCase()}:</strong> Dado ({lastRoll.d20Roll}) {formatMod(lastRoll.modifier)} ={' '}
          <strong style={{ fontSize: '1.1rem', color: '#fff' }}>{lastRoll.total}</strong>
          {lastRoll.isCriticalSuccess && <span style={{ display: 'block', color: '#9ece6a' }}>🔥 ¡ÉXITO CRÍTICO (20)!</span>}
          {lastRoll.isCriticalFailure && <span style={{ display: 'block', color: '#f7768e' }}>💀 ¡FALLO CRÍTICO (1)!</span>}
        </div>
      )}

      {/* Botones de Atributos */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '0.5rem',
        }}
      >
        {(
          Object.keys(character.stats) as Array<keyof typeof character.stats>
        ).map((statKey) => {
          const score = character.stats[statKey];
          const mod = character.modifiers[statKey];
          const isRolling = rollingStat === statKey;

          return (
            <button
              key={statKey}
              onClick={() => handleRoll(statKey, mod)}
              disabled={isRolling}
              style={{
                background: '#16161e',
                border: '1px solid #292e42',
                borderRadius: '8px',
                padding: '0.5rem',
                textAlign: 'center',
                cursor: 'pointer',
                color: '#c0caf5',
              }}
            >
              <div
                style={{
                  fontSize: '0.7rem',
                  textTransform: 'uppercase',
                  color: '#565f89',
                  fontWeight: 'bold',
                }}
              >
                {statKey.slice(0, 3)}
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#fff' }}>
                {formatMod(mod)}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#7a88cf' }}>
                {isRolling ? '🎲 ...' : `(${score})`}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}