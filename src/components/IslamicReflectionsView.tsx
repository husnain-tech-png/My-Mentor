import React, { useState } from 'react';
import { IslamicReflection } from '../types';
import { ISLAMIC_REFLECTIONS } from '../data/reflections';

interface IslamicReflectionsViewProps {
  onDiscussReflection: (reflection: IslamicReflection) => void;
  islamicModeActive: boolean;
  onToggleIslamicMode: () => void;
}

export const IslamicReflectionsView: React.FC<IslamicReflectionsViewProps> = ({
  onDiscussReflection,
  islamicModeActive,
  onToggleIslamicMode
}) => {
  const [selectedTheme, setSelectedTheme] = useState<string>('all');

  const themes = [
    { id: 'all', label: 'All Themes' },
    { id: 'work', label: '🛠️ Work & Itqān (Excellence)' },
    { id: 'intention', label: '🎯 Intention (Niyyah)' },
    { id: 'balance', label: '⚖️ Wealth & Stewardship' },
    { id: 'patience', label: '🐪 Effort & Tawakkul' },
    { id: 'generosity', label: '💎 Honest Commerce' }
  ];

  const filteredReflections = ISLAMIC_REFLECTIONS.filter(r =>
    selectedTheme === 'all' || r.theme === selectedTheme
  );

  return (
    <div style={{ maxWidth: '1040px', margin: '0 auto', padding: 'var(--space-8) var(--space-4)', width: '100%' }}>
      {/* Top Banner */}
      <div className="card card-glass" style={{ padding: 'var(--space-8)', marginBottom: 'var(--space-8)', border: '1px solid rgba(167, 139, 250, 0.35)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-5)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className="badge badge-violet">
                🌙 3-Layer Verification Architecture
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                Classical Primary Standard
              </span>
            </div>
            <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.6rem)', fontWeight: 800, color: '#ffffff', marginBottom: '8px', letterSpacing: '-0.025em' }}>
              Islamic Ethical Reflections
            </h1>
            <p style={{ fontSize: '0.95rem', color: 'var(--color-text-secondary)', maxWidth: '680px', lineHeight: 1.65 }}>
              Strict separation between primary sacred text (Quran & Sahih Hadith), classical linguistic commentary, and clearly labeled modern practical application.
            </p>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)',
            background: 'rgba(0, 0, 0, 0.35)',
            padding: '12px 18px',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid rgba(167, 139, 250, 0.25)'
          }}>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#c4b5fd' }}>Active in Chat Mentor</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                {islamicModeActive ? 'Enabled for all chats' : 'Disabled for general chats'}
              </div>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={islamicModeActive}
                onChange={onToggleIslamicMode}
              />
              <span className="slider islamic-slider"></span>
            </label>
          </div>
        </div>
      </div>

      {/* Theme Filters */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: 'var(--space-8)' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Theme:
        </span>
        {themes.map(t => (
          <button
            key={t.id}
            onClick={() => setSelectedTheme(t.id)}
            className="badge"
            style={{
              padding: '6px 14px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.78rem',
              background: selectedTheme === t.id ? 'rgba(167, 139, 250, 0.25)' : 'rgba(255, 255, 255, 0.04)',
              color: selectedTheme === t.id ? '#ffffff' : 'var(--color-text-secondary)',
              border: selectedTheme === t.id ? '1px solid rgba(167, 139, 250, 0.5)' : '1px solid var(--color-border)',
              transition: 'all 0.15s ease'
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Reflections Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
        {filteredReflections.map((ref) => {
          const isQuran = 'surah' in ref.sourceRef;
          const quranRef = isQuran ? (ref.sourceRef as import('../types').QuranReference) : null;
          const hadithRef = !isQuran ? (ref.sourceRef as import('../types').HadithReference) : null;
          return (
            <div
              key={ref.id}
              className="card"
              style={{
                padding: 'var(--space-6)',
                border: '1px solid rgba(167, 139, 250, 0.28)',
                background: 'linear-gradient(145deg, rgba(20, 26, 44, 0.95) 0%, rgba(32, 22, 52, 0.85) 100%)',
                boxShadow: 'var(--shadow-md)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--space-4)', marginBottom: 'var(--space-4)', flexWrap: 'wrap' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span className="badge badge-violet" style={{ fontSize: '0.7rem' }}>
                      {ref.theme.toUpperCase()}
                    </span>
                    <span className="badge badge-green" style={{ fontSize: '0.68rem' }}>
                      ✓ {ref.reviewStatus}
                    </span>
                  </div>
                  <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff' }}>
                    {ref.title}
                  </h2>
                </div>

                <button
                  onClick={() => onDiscussReflection(ref)}
                  className="btn btn-islamic btn-sm"
                  style={{
                    fontSize: '0.8rem',
                    flexShrink: 0
                  }}
                >
                  💬 Discuss in Chat
                </button>
              </div>

              {/* Layer 1: Exact Sacred Text */}
              <div style={{
                padding: 'var(--space-5)',
                borderRadius: 'var(--radius-lg)',
                background: 'rgba(0, 0, 0, 0.35)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                marginBottom: 'var(--space-4)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '6px' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#c4b5fd' }}>
                    Layer 1: Exact Source Text & Verified Citation
                  </span>
                  {quranRef ? (
                    <span style={{ fontSize: '0.78rem', color: 'var(--color-accent-secondary)', fontWeight: 600 }}>
                      Surah {quranRef.surahName} ({quranRef.surah}:{quranRef.ayah})
                    </span>
                  ) : hadithRef ? (
                    <span style={{ fontSize: '0.78rem', color: 'var(--color-accent-secondary)', fontWeight: 600 }}>
                      {hadithRef.collection} (#{hadithRef.number}) · {hadithRef.grading}
                    </span>
                  ) : null}
                </div>

                <div style={{
                  fontSize: '1.35rem',
                  lineHeight: 1.85,
                  textAlign: 'right',
                  fontFamily: 'serif',
                  color: '#ffffff',
                  marginBottom: '12px',
                  direction: 'rtl'
                }}>
                  {ref.sourceText.split('\n')[0]}
                </div>

                <div style={{ fontSize: '0.925rem', color: '#cbd5e1', fontStyle: 'italic', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '10px', lineHeight: 1.6 }}>
                  {ref.sourceText.split('\n')[1] || ref.sourceRef.translationText}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px', fontSize: '0.75rem', color: 'var(--color-text-muted)', flexWrap: 'wrap', gap: '6px' }}>
                  <span>
                    {quranRef
                      ? `Translator: ${quranRef.translator} (${quranRef.translationName})`
                      : hadithRef
                      ? `Grading: ${hadithRef.gradingSource}`
                      : ''}
                  </span>
                  <a
                    href={ref.sourceRef.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="citation-tag"
                    style={{ fontSize: '0.72rem' }}
                  >
                    Sunnah / Quran Verification Link ↗
                  </a>
                </div>
              </div>

              {/* Layer 2: Cautious Classical Summary */}
              <div style={{
                padding: 'var(--space-4)',
                borderRadius: 'var(--radius-lg)',
                background: 'rgba(129, 140, 248, 0.07)',
                border: '1px solid rgba(129, 140, 248, 0.22)',
                marginBottom: 'var(--space-4)'
              }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-accent-primary)', marginBottom: '4px' }}>
                  Layer 2: Cautious Scholarly Commentary & Linguistic Context
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                  {ref.cautionSummary}
                </div>
              </div>

              {/* Layer 3: Practical Modern Reflection */}
              <div style={{
                padding: 'var(--space-4)',
                borderRadius: 'var(--radius-lg)',
                background: 'rgba(52, 211, 153, 0.08)',
                border: '1px solid rgba(52, 211, 153, 0.28)'
              }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-accent-green)', marginBottom: '4px' }}>
                  Layer 3: App's Suggested Practical Reflection (Clearly Labeled)
                </div>
                <div style={{ fontSize: '0.925rem', color: '#ffffff', lineHeight: 1.6, fontWeight: 500 }}>
                  {ref.practicalReflection}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
