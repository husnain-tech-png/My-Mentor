import React, { useState } from 'react';
import { BIOGRAPHIES } from '../data/biographies';

interface BiographyLibraryProps {
  onSelectBiography: (bioId: string) => void;
  onAskMentorAboutBio: (name: string) => void;
}

export const BiographyLibrary: React.FC<BiographyLibraryProps> = ({
  onSelectBiography,
  onAskMentorAboutBio
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');

  const allTags = ['all', 'ethics', 'trade', 'resilience', 'leadership', 'investor-literacy', 'product-skills', 'education'];

  const filteredBiographies = BIOGRAPHIES.filter(bio => {
    const matchesSearch =
      bio.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bio.context.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bio.shortBio.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bio.topicTags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesTag = selectedTag === 'all' || bio.topicTags.includes(selectedTag);

    return matchesSearch && matchesTag;
  });

  return (
    <div style={{ padding: 'var(--space-8) var(--space-4)', maxWidth: '1140px', margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div style={{ marginBottom: 'var(--space-8)', textAlign: 'left' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <span className="badge badge-amber">🏛️ Audited Historical Knowledge</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
            Primary Source Citations & Lessons
          </span>
        </div>
        <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.6rem)', fontWeight: 800, marginBottom: '8px', color: '#ffffff', letterSpacing: '-0.025em' }}>
          Historical Biographies & Practical Wisdom
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', maxWidth: '820px', lineHeight: 1.65, fontSize: '1rem' }}>
          We discard mythologized folklore. Every figure in this library is audited with primary source citations, strictly separating verifiable historical facts from modern interpretations and institutional caveats.
        </p>
      </div>

      {/* Search & Tag Filter Bar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            placeholder="Search by name, era, principle (e.g. Abdur Rahman, Buffett, trade, focus)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input"
            style={{
              paddingLeft: '44px',
              height: '48px',
              fontSize: '0.95rem',
              borderRadius: 'var(--radius-xl)'
            }}
          />
          <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', opacity: 0.6, fontSize: '1.1rem' }}>
            🔍
          </span>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}
            >
              ✕ Clear
            </button>
          )}
        </div>

        {/* Filter Tags */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Filter Topic:
          </span>
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className="badge"
              style={{
                cursor: 'pointer',
                textTransform: 'capitalize',
                padding: '6px 12px',
                fontSize: '0.75rem',
                fontWeight: 600,
                background: selectedTag === tag ? 'rgba(99, 102, 241, 0.22)' : 'rgba(255, 255, 255, 0.04)',
                border: selectedTag === tag ? '1px solid var(--color-accent-primary)' : '1px solid var(--color-border)',
                color: selectedTag === tag ? '#ffffff' : 'var(--color-text-secondary)',
                transition: 'all 0.15s ease'
              }}
            >
              {tag.replace('-', ' ')}
            </button>
          ))}
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginLeft: 'auto' }}>
            Showing {filteredBiographies.length} figure{filteredBiographies.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Grid of Biographies */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 'var(--space-6)' }}>
        {filteredBiographies.map(bio => (
          <div
            key={bio.id}
            className="card card-interactive"
            onClick={() => onSelectBiography(bio.id)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: 'var(--space-6)'
            }}
          >
            <div>
              {/* Card Top Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: 'var(--space-3)' }}>
                <div>
                  <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
                    {bio.name}
                  </h2>
                  <div style={{ fontSize: '0.78rem', color: 'var(--color-accent-secondary)', fontWeight: 600, marginTop: '2px' }}>
                    {bio.context}
                  </div>
                </div>
                <span className="badge badge-green" style={{ fontSize: '0.68rem', padding: '3px 8px' }}>
                  ✓ {bio.reviewStatus}
                </span>
              </div>

              {/* Bio Summary */}
              <p style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: 'var(--space-4)' }}>
                {bio.shortBio}
              </p>

              {/* Core Principle Excerpt Box */}
              {bio.lessons.length > 0 && (
                <div style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-lg)',
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  marginBottom: 'var(--space-4)'
                }}>
                  <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--color-accent-primary)', fontWeight: 700, letterSpacing: '0.04em' }}>
                    Key Principle:
                  </div>
                  <div style={{ fontSize: '0.825rem', fontWeight: 700, color: '#f8fafc', marginTop: '2px' }}>
                    {bio.lessons[0].title}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '4px', lineHeight: 1.45 }}>
                    {bio.lessons[0].suggestedLesson.slice(0, 115)}...
                  </div>
                </div>
              )}

              {/* Topic tags */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: 'var(--space-4)' }}>
                {bio.topicTags.map(t => (
                  <span key={t} className="badge badge-indigo" style={{ fontSize: '0.68rem' }}>
                    #{t}
                  </span>
                ))}
              </div>
            </div>

            {/* Card Footer */}
            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-4)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                📖 {bio.sources.length} Sources · {bio.lessons.length} Lessons
              </span>

              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAskMentorAboutBio(bio.name);
                  }}
                  title="Ask Mentor about this person"
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.75rem', padding: '5px 10px' }}
                >
                  💬 Ask Mentor
                </button>
                <button
                  className="btn btn-primary btn-sm"
                  style={{ fontSize: '0.75rem', padding: '5px 12px' }}
                >
                  Deep Dive →
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
