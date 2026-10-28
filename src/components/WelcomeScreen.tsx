import React from 'react';
import { AppPage, UserMode } from '../types';

interface WelcomeScreenProps {
  onSelectMode: (mode: UserMode) => void;
  onNavigate: (page: AppPage) => void;
  onAskPrompt?: (prompt: string) => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onSelectMode,
  onNavigate,
  onAskPrompt
}) => {
  const quickQuestions = [
    {
      icon: '🚀',
      tag: 'Career & Startups',
      prompt: 'How do I balance a full-time job while building a high-impact startup without burning out?'
    },
    {
      icon: '🎓',
      tag: 'Study & Academics',
      prompt: 'What are the most effective study systems for retaining deep technical and conceptual material?'
    },
    {
      icon: '⚖️',
      tag: 'Ethical Trade',
      prompt: 'What principles made historical figures like Abdur Rahman ibn Awf successful in ethical business and trade?'
    },
    {
      icon: '⏰',
      tag: 'Habits & Focus',
      prompt: 'How do I design a disciplined weekly routine that protects my morning focus and spiritual alignment?'
    }
  ];

  const handleQuickQuestionClick = (prompt: string) => {
    onSelectMode('guest');
    if (onAskPrompt) {
      onAskPrompt(prompt);
    } else {
      onNavigate('chat');
    }
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 68px)', padding: 'var(--space-10) var(--space-4)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div className="container" style={{ maxWidth: '1040px', textAlign: 'center' }}>
        
        {/* Top Badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 16px',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(99, 102, 241, 0.12)',
            border: '1px solid rgba(129, 140, 248, 0.3)',
            marginBottom: 'var(--space-6)',
            boxShadow: '0 0 20px rgba(99, 102, 241, 0.15)'
          }}
        >
          <span style={{ fontSize: '0.9rem' }}>✨</span>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#c7d2fe', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            Audited Wisdom · Verified Primary Citations · AI Mentorship
          </span>
        </div>

        {/* Hero Headline */}
        <h1 style={{ fontSize: 'clamp(2.4rem, 5.5vw, 4rem)', fontWeight: 800, lineHeight: 1.12, marginBottom: 'var(--space-5)', letterSpacing: '-0.035em' }}>
          Real Wisdom. Proven Rigor. <br />
          <span style={{ background: 'linear-gradient(135deg, #818cf8 0%, #c084fc 50%, #fbbf24 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Your Intelligent AI Mentor.
          </span>
        </h1>

        {/* Subtitle */}
        <p style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)', color: 'var(--color-text-secondary)', maxWidth: '760px', margin: '0 auto var(--space-8)', lineHeight: 1.65 }}>
          High-conviction guidance for students, founders, and professionals. Learn from verified historical biographies, explore timeless Islamic reflections, and sustain momentum with disciplined habit nudges.
        </p>

        {/* Trust & Proof Indicators Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: 'var(--space-10)' }}>
          <span className="badge" style={{ padding: '6px 14px', background: 'rgba(255, 255, 255, 0.04)', borderColor: 'rgba(255, 255, 255, 0.1)' }}>
            🏛️ Audited Primary Citations
          </span>
          <span className="badge badge-violet" style={{ padding: '6px 14px' }}>
            🌙 3-Layer Islamic Ethical Standard
          </span>
          <span className="badge badge-green" style={{ padding: '6px 14px' }}>
            🎙️ Two-Way Audio & Speech
          </span>
          <span className="badge badge-amber" style={{ padding: '6px 14px' }}>
            ☁️ Offline-First & Cloud Sync
          </span>
        </div>

        {/* Action Selection Cards (The 2 Core Paths) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-6)', maxWidth: '860px', margin: '0 auto var(--space-12)' }}>
          
          {/* Option 1: Personalized Mentorship */}
          <div
            className="card card-interactive"
            onClick={() => {
              onSelectMode('personalized');
              onNavigate('onboarding');
            }}
            style={{
              padding: 'var(--space-8) var(--space-6)',
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              border: '2px solid rgba(129, 140, 248, 0.45)',
              background: 'linear-gradient(150deg, rgba(22, 30, 52, 0.95) 0%, rgba(38, 26, 66, 0.75) 100%)',
              position: 'relative',
              boxShadow: '0 12px 32px rgba(0, 0, 0, 0.5), 0 0 25px rgba(99, 102, 241, 0.2)'
            }}
          >
            <div style={{ position: 'absolute', top: '16px', right: '16px' }}>
              <span className="badge badge-indigo" style={{ fontWeight: 700, padding: '4px 10px', fontSize: '0.72rem' }}>
                ⭐ Recommended
              </span>
            </div>

            <div>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                background: 'rgba(129, 140, 248, 0.18)',
                border: '1px solid rgba(129, 140, 248, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.6rem',
                marginBottom: 'var(--space-4)'
              }}>
                🎯
              </div>
              <h2 style={{ fontSize: '1.45rem', fontWeight: 800, marginBottom: 'var(--space-2)', color: '#ffffff' }}>
                Personalized Setup
              </h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: 'var(--space-4)' }}>
                Customize your stage (student, early career, founder, researcher), set your target goal, and choose your mentor's tone, challenge rigor, and communication style.
              </p>

              {/* Benefits list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: 'var(--space-4)', fontSize: '0.8rem', color: '#cbd5e1' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ color: '#34d399' }}>✓</span> Custom guidance calibrated to your exact weekly hours
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ color: '#34d399' }}>✓</span> Adjustable tone (Warm & Supportive or Direct & Rigorous)
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ color: '#34d399' }}>✓</span> Quick 2-minute onboarding
                </div>
              </div>
            </div>

            <button className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 'var(--space-4)', fontWeight: 700 }}>
              Configure Profile & Start →
            </button>
          </div>

          {/* Option 2: Instant Guest Access */}
          <div
            className="card card-interactive"
            onClick={() => {
              onSelectMode('guest');
              onNavigate('chat');
            }}
            style={{
              padding: 'var(--space-8) var(--space-6)',
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              border: '1px solid var(--color-border)',
              background: 'linear-gradient(150deg, rgba(16, 23, 38, 0.85) 0%, rgba(13, 19, 32, 0.95) 100%)',
              position: 'relative'
            }}
          >
            <div style={{ position: 'absolute', top: '16px', right: '16px' }}>
              <span className="badge badge-amber" style={{ fontWeight: 700, padding: '4px 10px', fontSize: '0.72rem' }}>
                ⚡ Instant Access
              </span>
            </div>

            <div>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                background: 'rgba(251, 191, 36, 0.15)',
                border: '1px solid rgba(251, 191, 36, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.6rem',
                marginBottom: 'var(--space-4)'
              }}>
                ⚡
              </div>
              <h2 style={{ fontSize: '1.45rem', fontWeight: 800, marginBottom: 'var(--space-2)', color: '#ffffff' }}>
                Instant Guest Mode
              </h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: 'var(--space-4)' }}>
                Jump straight into conversation with zero friction. Ask immediate questions, explore verified biographies, or test Islamic reflections right away.
              </p>

              {/* Benefits list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: 'var(--space-4)', fontSize: '0.8rem', color: '#cbd5e1' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ color: '#34d399' }}>✓</span> Zero profile fields required — start in 1 second
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ color: '#34d399' }}>✓</span> Full access to verified historical biography library
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ color: '#34d399' }}>✓</span> Upgrade to personalized profile anytime
                </div>
              </div>
            </div>

            <button className="btn btn-secondary btn-lg" style={{ width: '100%', marginTop: 'var(--space-4)', fontWeight: 700 }}>
              Explore as Guest →
            </button>
          </div>
        </div>

        {/* Quick Questions Starter Shelf */}
        <div style={{ marginBottom: 'var(--space-12)', textAlign: 'left' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc' }}>
                💡 Popular Questions to Ask Right Now
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                Click any question below to test your mentor immediately
              </p>
            </div>
            <span className="badge badge-indigo">1-Click Launch</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-3)' }}>
            {quickQuestions.map((q, idx) => (
              <div
                key={idx}
                className="card-feature card-interactive"
                onClick={() => handleQuickQuestionClick(q.prompt)}
                style={{
                  padding: 'var(--space-4)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderRadius: 'var(--radius-lg)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                    <span style={{ fontSize: '1rem' }}>{q.icon}</span>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-accent-primary)', textTransform: 'uppercase' }}>
                      {q.tag}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-primary)', lineHeight: 1.45, fontWeight: 500 }}>
                    "{q.prompt}"
                  </p>
                </div>
                <div style={{ marginTop: 'var(--space-3)', fontSize: '0.75rem', color: 'var(--color-accent-secondary)', fontWeight: 600 }}>
                  Ask Mentor →
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Four Feature Pillars Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 'var(--space-4)', textAlign: 'left' }}>
          
          <div className="card-feature">
            <div style={{ fontSize: '1.8rem', marginBottom: 'var(--space-2)' }}>📜</div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '6px', color: '#f8fafc' }}>
              Rigorously Verified Biographies
            </h3>
            <p style={{ fontSize: '0.825rem', color: 'var(--color-text-secondary)', lineHeight: 1.55 }}>
              Separates documented historical facts from modern interpretations, institutional caveats, and practical principles.
            </p>
          </div>

          <div className="card-feature">
            <div style={{ fontSize: '1.8rem', marginBottom: 'var(--space-2)' }}>🌙</div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '6px', color: '#f8fafc' }}>
              3-Layer Islamic Reflections
            </h3>
            <p style={{ fontSize: '0.825rem', color: 'var(--color-text-secondary)', lineHeight: 1.55 }}>
              Exact source text (Quran & Sahih Hadith), scholarly commentary context, and clearly labeled modern daily applications.
            </p>
          </div>

          <div className="card-feature">
            <div style={{ fontSize: '1.8rem', marginBottom: 'var(--space-2)' }}>🎙️</div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '6px', color: '#f8fafc' }}>
              Voice Input & Audio Readback
            </h3>
            <p style={{ fontSize: '0.825rem', color: 'var(--color-text-secondary)', lineHeight: 1.55 }}>
              Speak directly with speech-to-text, listen to answers aloud, and inspect full transparency citations for every guidance item.
            </p>
          </div>

          <div className="card-feature">
            <div style={{ fontSize: '1.8rem', marginBottom: 'var(--space-2)' }}>⏰</div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '6px', color: '#f8fafc' }}>
              Disciplined Habit Nudges
            </h3>
            <p style={{ fontSize: '0.825rem', color: 'var(--color-text-secondary)', lineHeight: 1.55 }}>
              Custom morning and evening alignment reminders with quiet hours protection so your focus compounds daily.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};
