import React from 'react';
import { AppPage, UserMode } from '../types';

interface WelcomeScreenProps {
  onSelectMode: (mode: UserMode) => void;
  onNavigate: (page: AppPage) => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onSelectMode,
  onNavigate
}) => {
  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', padding: 'var(--space-8) var(--space-4)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div className="container" style={{ maxWidth: '960px', textAlign: 'center' }}>
        {/* Badge */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: 'var(--radius-full)', background: 'rgba(129, 140, 248, 0.1)', border: '1px solid rgba(129, 140, 248, 0.25)', marginBottom: 'var(--space-6)' }}>
          <span style={{ fontSize: '0.875rem' }}>✨</span>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-accent-primary)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            Empowering Study, Career & Ethical Life Planning
          </span>
        </div>

        {/* Main Title */}
        <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', fontWeight: 800, lineHeight: 1.15, marginBottom: 'var(--space-4)', letterSpacing: '-0.03em' }}>
          Real Wisdom. Proven Rigor. <br />
          <span style={{ background: 'linear-gradient(135deg, #818cf8 0%, #fbbf24 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Your Affordable AI Mentor.
          </span>
        </h1>

        <p style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)', color: 'var(--color-text-secondary)', maxWidth: '720px', margin: '0 auto var(--space-8)', lineHeight: 1.6 }}>
          Practical guidance for students, founders, and career professionals. Learn from verified historical biographies, explore timeless Islamic reflections, and maintain momentum with disciplined reminders.
        </p>

        {/* Action Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-6)', maxWidth: '780px', margin: '0 auto var(--space-12)' }}>
          {/* Option A: Personalized Onboarding */}
          <div
            className="card card-interactive"
            onClick={() => {
              onSelectMode('personalized');
              onNavigate('onboarding');
            }}
            style={{
              padding: 'var(--space-6)',
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              border: '2px solid rgba(129, 140, 248, 0.4)',
              background: 'linear-gradient(145deg, rgba(26, 34, 53, 0.9) 0%, rgba(35, 25, 60, 0.6) 100%)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
              <span className="badge badge-indigo">Recommended</span>
            </div>
            <div>
              <div style={{ fontSize: '2rem', marginBottom: 'var(--space-3)' }}>🎯</div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 'var(--space-2)' }}>Personalized Setup</h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, marginBottom: 'var(--space-4)' }}>
                Customize your stage (student, founder, career, property researcher), define your primary goal, and configure your mentor\'s tone and challenge level in 2 minutes.
              </p>
            </div>
            <button className="btn btn-primary" style={{ width: '100%', marginTop: 'var(--space-4)' }}>
              Configure Profile & Start →
            </button>
          </div>

          {/* Option B: Guest Quick Access */}
          <div
            className="card card-interactive"
            onClick={() => {
              onSelectMode('guest');
              onNavigate('chat');
            }}
            style={{
              padding: 'var(--space-6)',
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              border: '1px solid var(--color-border)',
              background: 'rgba(26, 34, 53, 0.5)'
            }}
          >
            <div>
              <div style={{ fontSize: '2rem', marginBottom: 'var(--space-3)' }}>⚡</div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 'var(--space-2)' }}>Instant Guest Access</h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, marginBottom: 'var(--space-4)' }}>
                Jump straight into conversation. Explore sample questions, search verified biographies, and test the mentor immediately without filling out any profile.
              </p>
            </div>
            <button className="btn btn-secondary" style={{ width: '100%', marginTop: 'var(--space-4)' }}>
              Explore as Guest →
            </button>
          </div>
        </div>

        {/* Feature Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-4)', textAlign: 'left' }}>
          <div className="card" style={{ padding: 'var(--space-4)' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: 'var(--space-2)' }}>📜</div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '4px' }}>Rigorously Verified Biographies</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
              Separates documented historical facts from attributed interpretations, caveats, and practical lessons.
            </p>
          </div>

          <div className="card" style={{ padding: 'var(--space-4)' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: 'var(--space-2)' }}>✨</div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '4px' }}>3-Layer Islamic Reflections</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
              Exact source text (Quran & Sahih Hadith), cautious summary of commentary, and clearly labeled modern practical application.
            </p>
          </div>

          <div className="card" style={{ padding: 'var(--space-4)' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: 'var(--space-2)' }}>🎙️</div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '4px' }}>Voice Interaction & Citations</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
              Speak directly with speech-to-text, listen to audio answers, and examine transparent citation details for every recommendation.
            </p>
          </div>

          <div className="card" style={{ padding: 'var(--space-4)' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: 'var(--space-2)' }}>⏰</div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '4px' }}>Disciplined Habit Nudges</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
              Daily alignment reminders with quiet hours protection so your focus compounds without spam.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
