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
    { id: 'work', label: '🛠️ Work & Itqan' },
    { id: 'intention', label: '🎯 Intention (Niyyah)' },
    { id: 'balance', label: '⚖️ Balance & Assets' },
    { id: 'patience', label: '🐪 Effort & Tawakkul' },
    { id: 'generosity', label: '💎 Trade & Honesty' }
  ];

  const filteredReflections = ISLAMIC_REFLECTIONS.filter(r =>
    selectedTheme === 'all' || r.theme === selectedTheme
  );

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: 'var(--space-8) var(--space-4)', width: '100%' }}>
      {/* Top Banner */}
      <div className="card card-glass" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-8)', border: '1px solid rgba(167, 139, 250, 0.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span className="badge" style={{ background: 'rgba(167, 139, 250, 0.15)', color: '#c4b5fd', border: '1px solid rgba(167, 139, 250, 0.3)' }}>
                3-Layer Architecture
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                Classical Verification Standard
              </span>
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '6px' }}>
              Islamic Ethical Reflections
            </h1>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', maxWidth: '650px', lineHeight: 1.5 }}>
              Strict separation between primary sacred text (Quran & Sahih Hadith), cautious scholarly commentary, and our suggested practical application.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', background: 'rgba(0,0,0,0.3)', padding: '10px 16px', borderRadius: 'var(--radius-lg)' }}>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#c4b5fd' }}>Active in Chat Mentor</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                {islamicModeActive ? 'Enabled in all chats' : 'Disabled for general chats'}
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
        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Filter Theme:</span>
        {themes.map(t => (
          <button
            key={t.id}
            onClick={() => setSelectedTheme(t.id)}
            className="badge"
            style={{
              padding: '6px 12px',
              cursor: 'pointer',
              background: selectedTheme === t.id ? 'rgba(167, 139, 250, 0.25)' : 'rgba(255, 255, 255, 0.04)',
              color: selectedTheme === t.id ? '#c4b5fd' : 'var(--color-text-secondary)',
              border: selectedTheme === t.id ? '1px solid rgba(167, 139, 250, 0.4)' : '1px solid var(--color-border)'
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
                border: '1px solid rgba(167, 139, 250, 0.25)',
                background: 'linear-gradient(135deg, rgba(26, 34, 53, 0.95) 0%, rgba(30, 22, 50, 0.85) 100%)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span className="badge" style={{ background: 'rgba(167, 139, 250, 0.2)', color: '#c4b5fd' }}>
                      {ref.theme.toUpperCase()}
                    </span>
                    <span className="badge badge-green" style={{ fontSize: '0.65rem' }}>
                      ✓ {ref.reviewStatus}
                    </span>
                  </div>
                  <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'white' }}>
                    {ref.title}
                  </h2>
                </div>

                <button
                  onClick={() => onDiscussReflection(ref)}
                  className="btn btn-primary btn-sm"
                  style={{
                    background: 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)',
                    fontSize: '0.8rem',
                    flexShrink: 0
                  }}
                >
                  💬 Discuss in Chat
                </button>
              </div>

              {/* Layer 1: Exact Sacred Text */}
              <div style={{
                padding: 'var(--space-4)',
                borderRadius: 'var(--radius-lg)',
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                marginBottom: 'var(--space-4)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#c4b5fd' }}>
                    Layer 1: Exact Source Text & Verified Citation
                  </span>
                  {quranRef ? (
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-accent-secondary)' }}>
                      Surah {quranRef.surahName} ({quranRef.surah}:{quranRef.ayah})
                    </span>
                  ) : hadithRef ? (
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-accent-secondary)' }}>
                      {hadithRef.collection} (#{hadithRef.number}) · {hadithRef.grading}
                    </span>
                  ) : null}
                </div>

                <div style={{
                  fontSize: '1.25rem',
                  lineHeight: 1.8,
                  textAlign: 'right',
                  fontFamily: 'serif',
                  color: '#f8fafc',
                  marginBottom: '10px',
                  direction: 'rtl'
                }}>
                  {ref.sourceText.split('\n')[0]}
                </div>

                <div style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', fontStyle: 'italic', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '8px' }}>
                  {ref.sourceText.split('\n')[1] || ref.sourceRef.translationText}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                  <span>
                    {quranRef
                      ? `Translator: ${quranRef.translator} (${quranRef.translationName})`
                      : hadithRef
                      ? `Grading Source: ${hadithRef.gradingSource}`
                      : ''}
                  </span>
                  <a
                    href={ref.sourceRef.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="citation-tag"
                    style={{ fontSize: '0.7rem' }}
                  >
                    Sunnah / Quran Verification Link ↗
                  </a>
                </div>
              </div>

              {/* Layer 2: Cautious Classical Summary */}
              <div style={{
                padding: 'var(--space-4)',
                borderRadius: 'var(--radius-lg)',
                background: 'rgba(129, 140, 248, 0.06)',
                border: '1px solid rgba(129, 140, 248, 0.2)',
                marginBottom: 'var(--space-4)'
              }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-accent-primary)', marginBottom: '4px' }}>
                  Layer 2: Cautious Scholarly Commentary & Linguistic Context
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                  {ref.cautionSummary}
                </div>
              </div>

              {/* Layer 3: Practical Modern Reflection */}
              <div style={{
                padding: 'var(--space-4)',
                borderRadius: 'var(--radius-lg)',
                background: 'rgba(52, 211, 153, 0.08)',
                border: '1px solid rgba(52, 211, 153, 0.25)'
              }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-accent-green)', marginBottom: '4px' }}>
                  Layer 3: App’s Suggested Practical Reflection (Clearly Labeled)
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--color-text-primary)', lineHeight: 1.5, fontWeight: 500 }}>
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
