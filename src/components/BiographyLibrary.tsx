import React, { useState } from 'react';
import { Biography } from '../types';
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
    <div style={{ padding: 'var(--space-8) var(--space-4)', maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-2)' }}>
          <span className="badge badge-amber">Rigorously Verified Knowledge</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
            Updated Sept 2026
          </span>
        </div>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: 'var(--space-2)' }}>
          Historical Biographies & Practical Lessons
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', maxWidth: '780px', lineHeight: 1.6 }}>
          We discard mythologized folklore. Every figure in this library is audited with primary source citations, separating verifiable historical facts from modern interpretations and institutional caveats.
        </p>
      </div>

      {/* Search & Tag Filter Bar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <input
              type="text"
              placeholder="Search by name, era, principle (e.g. Abdur Rahman, Buffett, trade, focus)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '40px' }}
            />
            <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>
              🔍
            </span>
          </div>
        </div>

        {/* Tags */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Filter Tag:</span>
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`badge ${selectedTag === tag ? 'badge-indigo' : ''}`}
              style={{
                cursor: 'pointer',
                textTransform: 'capitalize',
                padding: '4px 10px',
                background: selectedTag === tag ? 'rgba(129, 140, 248, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                border: selectedTag === tag ? '1px solid var(--color-accent-primary)' : '1px solid var(--color-border)'
              }}
            >
              {tag.replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Biographies */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--space-6)' }}>
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
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>{bio.name}</h2>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-accent-secondary)', marginTop: '2px' }}>
                    {bio.context}
                  </div>
                </div>
                <span className="badge badge-green" style={{ fontSize: '0.65rem' }}>
                  ✓ {bio.reviewStatus}
                </span>
              </div>

              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, marginBottom: 'var(--space-4)' }}>
                {bio.shortBio}
              </p>

              {/* Sample Top Lesson Preview */}
              {bio.lessons.length > 0 && (
                <div style={{
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(0, 0, 0, 0.2)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  marginBottom: 'var(--space-4)'
                }}>
                  <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--color-accent-primary)', fontWeight: 600 }}>
                    Core Principle:
                  </div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-primary)', marginTop: '2px' }}>
                    {bio.lessons[0].title}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '4px', lineHeight: 1.4 }}>
                    {bio.lessons[0].suggestedLesson.slice(0, 110)}...
                  </div>
                </div>
              )}

              {/* Topic tags */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: 'var(--space-4)' }}>
                {bio.topicTags.map(t => (
                  <span key={t} className="badge" style={{ fontSize: '0.65rem' }}>
                    #{t}
                  </span>
                ))}
              </div>
            </div>

            {/* Card Footer */}
            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                📖 {bio.sources.length} Verified Sources · {bio.lessons.length} Lessons
              </span>

              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAskMentorAboutBio(bio.name);
                  }}
                  title="Ask Mentor about this person"
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                >
                  💬 Ask Mentor
                </button>
                <button
                  className="btn btn-primary btn-sm"
                  style={{ fontSize: '0.75rem', padding: '4px 10px' }}
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
