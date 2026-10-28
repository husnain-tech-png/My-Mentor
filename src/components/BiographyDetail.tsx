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
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: 'var(--space-8) var(--space-4)', width: '100%' }}>
      {/* Back button */}
      <button
        onClick={onBack}
        className="btn btn-secondary btn-sm"
        style={{ marginBottom: 'var(--space-6)', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
      >
        <span>←</span> Back to Biography Library
      </button>

      {/* Hero Header Card */}
      <div className="card card-glass" style={{ padding: 'var(--space-8)', marginBottom: 'var(--space-8)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: 'var(--space-4)' }}>
          <span className="badge badge-amber" style={{ fontSize: '0.8rem', padding: '4px 12px' }}>
            {biography.context}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge badge-green">✓ {biography.reviewStatus}</span>
            <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
              Verified: {biography.lastVerified}
            </span>
          </div>
        </div>

        <h1 style={{ fontSize: 'clamp(2.2rem, 4vw, 3rem)', fontWeight: 800, marginBottom: 'var(--space-3)', color: '#ffffff', letterSpacing: '-0.03em' }}>
          {biography.name}
        </h1>

        <p style={{ fontSize: '1.1rem', color: 'var(--color-text-secondary)', lineHeight: 1.7, marginBottom: 'var(--space-6)' }}>
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

      {/* Verified Primary Sources Section */}
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-4)' }}>
          <span style={{ fontSize: '1.3rem' }}>📖</span>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffffff' }}>
            Verified Primary Sources & Citations ({biography.sources.length})
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
          {biography.sources.map((src, idx) => (
            <div key={idx} className="card" style={{ padding: 'var(--space-5)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span className="badge badge-indigo" style={{ fontSize: '0.65rem' }}>{src.sourceType.toUpperCase()}</span>
                  <span style={{ fontSize: '0.725rem', color: 'var(--color-text-muted)' }}>{src.date}</span>
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#f8fafc', marginBottom: '6px', lineHeight: 1.4 }}>
                  {src.title}
                </div>
                {src.author && (
                  <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                    Author: {src.author}
                  </div>
                )}
                {src.rights && (
                  <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                    Rights: {src.rights}
                  </div>
                )}
              </div>

              {src.url && (
                <div style={{ marginTop: 'var(--space-4)', paddingTop: '10px', borderTop: '1px solid var(--color-border)' }}>
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-2)' }}>
          <span style={{ fontSize: '1.3rem' }}>🔬</span>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffffff' }}>
            3-Tier Lesson Analysis (Fact vs Interpretation vs Modern Lesson)
          </h2>
        </div>
        <p style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-6)', lineHeight: 1.6 }}>
          We strictly isolate what is historically documented from what is an attributed interpretation, concluding with an actionable practical takeaway.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {biography.lessons.map((lesson) => (
            <div key={lesson.id} className="card" style={{ padding: 'var(--space-6)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: 'var(--space-4)', flexWrap: 'wrap' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc' }}>
                  {lesson.title}
                </h3>
                <button
                  onClick={() => onDiscussLesson(lesson.title, lesson.suggestedLesson)}
                  className="btn btn-primary btn-sm"
                  style={{ fontSize: '0.8rem' }}
                >
                  💬 Discuss Lesson in Chat
                </button>
              </div>

              {/* Tier 1: Documented Historical Fact */}
              <div style={{
                padding: 'var(--space-4)',
                borderRadius: 'var(--radius-lg)',
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                marginBottom: 'var(--space-4)'
              }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-accent-secondary)', marginBottom: '4px' }}>
                  Tier 1: Documented Historical Fact (Strictly Audited)
                </div>
                <div style={{ fontSize: '0.9rem', color: '#f1f5f9', lineHeight: 1.6 }}>
                  {lesson.verifiedFact}
                </div>
              </div>

              {/* Tier 2: Attributed Interpretation & Caveats */}
              <div style={{
                padding: 'var(--space-4)',
                borderRadius: 'var(--radius-lg)',
                background: 'rgba(129, 140, 248, 0.06)',
                border: '1px solid rgba(129, 140, 248, 0.2)',
                marginBottom: 'var(--space-4)'
              }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-accent-primary)', marginBottom: '4px' }}>
                  Tier 2: Attributed Interpretation & Modern Context Caveats
                </div>
                <div style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                  {lesson.attributedInterpretation}
                </div>
              </div>

              {/* Tier 3: Practical Modern Lesson */}
              <div style={{
                padding: 'var(--space-4)',
                borderRadius: 'var(--radius-lg)',
                background: 'rgba(52, 211, 153, 0.08)',
                border: '1px solid rgba(52, 211, 153, 0.25)'
              }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-accent-green)', marginBottom: '4px' }}>
                  Tier 3: Actionable Modern Lesson for Your Life & Work
                </div>
                <div style={{ fontSize: '0.925rem', color: '#ffffff', lineHeight: 1.6, fontWeight: 500 }}>
                  {lesson.suggestedLesson}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
