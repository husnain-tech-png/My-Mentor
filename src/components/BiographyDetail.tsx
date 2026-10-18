import React from 'react';
import { Biography } from '../types';

interface BiographyDetailProps {
  biography: Biography;
  onBack: () => void;
  onDiscussLesson: (lessonTitle: string, suggestedTakeaway: string) => void;
}

export const BiographyDetail: React.FC<BiographyDetailProps> = ({
  biography,
  onBack,
  onDiscussLesson
}) => {
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: 'var(--space-8) var(--space-4)', width: '100%' }}>
      {/* Back button */}
      <button
        onClick={onBack}
        className="btn btn-secondary btn-sm"
        style={{ marginBottom: 'var(--space-6)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
      >
        ← Back to Biography Library
      </button>

      {/* Hero Header */}
      <div className="card card-glass" style={{ padding: 'var(--space-8)', marginBottom: 'var(--space-8)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: 'var(--space-3)' }}>
          <span className="badge badge-amber">{biography.context}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge badge-green">✓ {biography.reviewStatus}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
              Verified: {biography.lastVerified}
            </span>
          </div>
        </div>

        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, marginBottom: 'var(--space-3)', color: 'var(--color-text-primary)' }}>
          {biography.name}
        </h1>

        <p style={{ fontSize: '1.1rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: 'var(--space-5)' }}>
          {biography.shortBio}
        </p>

        {/* Topic tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {biography.topicTags.map(tag => (
            <span key={tag} className="badge badge-indigo">
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Verified Sources Section */}
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>📖</span> Verified Primary Sources & Citations ({biography.sources.length})
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
          {biography.sources.map((src, idx) => (
            <div key={idx} className="card" style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span className="badge" style={{ fontSize: '0.65rem' }}>{src.sourceType.toUpperCase()}</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{src.date}</span>
                </div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                  {src.title}
                </div>
                {src.author && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
                    Author: {src.author}
                  </div>
                )}
                {src.rights && (
                  <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                    Rights: {src.rights}
                  </div>
                )}
              </div>

              {src.url && (
                <div style={{ marginTop: 'var(--space-3)', paddingTop: '8px', borderTop: '1px solid var(--color-border)' }}>
                  <a
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="citation-tag"
                    style={{ fontSize: '0.75rem' }}
                  >
                    Examine Source Document ↗
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 3-Tier Lessons Analysis */}
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 'var(--space-2)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>🔬</span> 3-Tier Lessons (Fact vs Interpretation vs Modern Lesson)
        </h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-5)' }}>
          We strictly isolate what is historically documented from what is an attributed interpretation, concluding with an actionable takeaway.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {biography.lessons.map((lesson) => (
            <div key={lesson.id} className="card" style={{ padding: 'var(--space-6)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  {lesson.title}
                </h3>
                <button
                  onClick={() => onDiscussLesson(lesson.title, lesson.suggestedLesson)}
                  className="btn btn-primary btn-sm"
                  style={{ fontSize: '0.75rem' }}
                >
                  💬 Discuss with Mentor
                </button>
              </div>

              {/* Tier 1: Verified Fact */}
              <div style={{
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(251, 191, 36, 0.08)',
                border: '1px solid rgba(251, 191, 36, 0.25)',
                marginBottom: 'var(--space-3)'
              }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-accent-secondary)', letterSpacing: '0.05em', marginBottom: '4px' }}>
                  Tier 1: Documented Historical Fact
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--color-text-primary)', lineHeight: 1.5 }}>
                  {lesson.verifiedFact}
                </div>
              </div>

              {/* Tier 2: Attributed Interpretation */}
              <div style={{
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(129, 140, 248, 0.08)',
                border: '1px solid rgba(129, 140, 248, 0.25)',
                marginBottom: 'var(--space-3)'
              }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-accent-primary)', letterSpacing: '0.05em', marginBottom: '4px' }}>
                  Tier 2: Attributed Interpretation & Rationale
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                  {lesson.attributedInterpretation}
                </div>
              </div>

              {/* Tier 3: Suggested Modern Lesson */}
              <div style={{
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(52, 211, 153, 0.08)',
                border: '1px solid rgba(52, 211, 153, 0.25)',
                marginBottom: 'var(--space-3)'
              }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-accent-green)', letterSpacing: '0.05em', marginBottom: '4px' }}>
                  Tier 3: Suggested Modern Takeaway
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--color-text-primary)', fontWeight: 500, lineHeight: 1.5 }}>
                  {lesson.suggestedLesson}
                </div>
              </div>

              {/* Context relevance note */}
              {lesson.relevanceExplanation && (
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontStyle: 'italic', marginTop: '6px' }}>
                  📌 Relevant Context: {lesson.relevanceExplanation}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Caveats & Critical Limitations */}
      {biography.caveats && biography.caveats.length > 0 && (
        <div className="card" style={{ padding: 'var(--space-6)', background: 'rgba(239, 68, 68, 0.04)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-accent-rose)', marginBottom: 'var(--space-3)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>⚠️</span> Critical Caveats & Historical Limitations
          </h2>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingLeft: '18px' }}>
            {biography.caveats.map((c, i) => (
              <li key={i} style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', listStyleType: 'disc' }}>
                {c}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
