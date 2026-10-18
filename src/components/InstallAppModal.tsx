import React from 'react';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  canInstallDirectly: boolean;
  onInstallDirectly: () => void;
  isStandalone: boolean;
  isIOS: boolean;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({
  isOpen,
  onClose,
  canInstallDirectly,
  onInstallDirectly,
  isStandalone,
  isIOS
}) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(5, 8, 15, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-4)'
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{
          maxWidth: '520px',
          width: '100%',
          background: 'var(--color-bg-elevated)',
          border: '1px solid var(--color-border-subtle)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 40px rgba(99, 102, 241, 0.15)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-6)',
          position: 'relative',
          animation: 'fadeInUp 0.25s ease-out'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close installation modal"
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'transparent',
            border: 'none',
            color: 'var(--color-text-secondary)',
            cursor: 'pointer',
            padding: '6px',
            borderRadius: 'var(--radius-md)'
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius-lg)',
              background: 'linear-gradient(135deg, #818cf8 0%, #6366f1 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 800,
              fontSize: '24px',
              boxShadow: 'var(--shadow-glow-indigo)',
              flexShrink: 0
            }}
          >
            M
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--color-text-primary)' }}>
              Install MyMentor
            </h2>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
              Works seamlessly on Mobile (iOS / Android) & PC (Windows / Mac)
            </p>
          </div>
        </div>

        {isStandalone ? (
          <div
            style={{
              background: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-4)',
              textAlign: 'center',
              marginBottom: 'var(--space-4)'
            }}
          >
            <div style={{ fontSize: '2rem', marginBottom: '6px' }}>✨</div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#4ade80', margin: '0 0 4px 0' }}>
              Already Running as Installed App
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', margin: 0 }}>
              You are currently using MyMentor in standalone installed mode. Fast launches, offline access, and full screen experience are active!
            </p>
          </div>
        ) : (
          <>
            {/* Benefits pills */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 'var(--space-2)',
                marginBottom: 'var(--space-5)'
              }}
            >
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--color-border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: 'var(--space-2)',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: '1.2rem', marginBottom: '2px' }}>⚡</div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600 }}>1-Tap Launch</div>
              </div>
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--color-border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: 'var(--space-2)',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: '1.2rem', marginBottom: '2px' }}>📶</div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600 }}>Offline Access</div>
              </div>
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--color-border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: 'var(--space-2)',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: '1.2rem', marginBottom: '2px' }}>☁️</div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600 }}>Cloud Sync</div>
              </div>
            </div>

            {/* Direct 1-Click Install Button if supported (Chrome, Edge, Android) */}
            {canInstallDirectly && (
              <div style={{ marginBottom: 'var(--space-5)' }}>
                <button
                  onClick={() => {
                    onInstallDirectly();
                    onClose();
                  }}
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    padding: '12px 18px',
                    fontSize: '1rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: 'var(--shadow-glow-indigo)'
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  <span>Install App Now (1-Click)</span>
                </button>
              </div>
            )}

            {/* Platform Specific Guides */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {isIOS ? (
                /* iPhone / iPad iOS Guide */
                <div
                  style={{
                    background: 'rgba(99, 102, 241, 0.08)',
                    border: '1px solid rgba(99, 102, 241, 0.25)',
                    borderRadius: 'var(--radius-lg)',
                    padding: 'var(--space-4)'
                  }}
                >
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, margin: '0 0 8px 0', color: '#a5b4fc', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>📱 How to Install on iPhone / iPad (Safari):</span>
                  </h4>
                  <ol style={{ margin: 0, paddingLeft: '20px', fontSize: '0.85rem', color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <li>
                      Tap the <strong>Share button</strong> (<span style={{ fontSize: '1rem' }}>📤</span>) at the bottom or top of Safari.
                    </li>
                    <li>
                      Scroll down in the share sheet and tap <strong>"Add to Home Screen"</strong> (<span style={{ fontSize: '1rem' }}>➕</span>).
                    </li>
                    <li>
                      Tap <strong>"Add"</strong> in the top-right corner.
                    </li>
                  </ol>
                </div>
              ) : (
                /* PC (Windows / Mac / Chrome / Edge) and Android Guide */
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--color-border-subtle)',
                    borderRadius: 'var(--radius-lg)',
                    padding: 'var(--space-4)'
                  }}
                >
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, margin: '0 0 8px 0', color: 'var(--color-text-primary)' }}>
                    🖥️ How to Install on PC (Windows / Mac) or Android:
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.85rem', color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <li>
                      <strong>On PC Chrome / Edge:</strong> Look for the <strong>Install</strong> icon (<span style={{ fontSize: '0.9rem' }}>⊕</span> or 🖥️) on the right side of the URL address bar, or click browser menu (⋮) → <em>"Install MyMentor"</em>.
                    </li>
                    <li>
                      <strong>On Android Chrome:</strong> Tap the <strong>three dots (⋮)</strong> in the top-right corner → tap <em>"Add to Home screen"</em> or <em>"Install app"</em>.
                    </li>
                    <li>
                      Once installed, MyMentor opens as its own distraction-free standalone desktop/mobile window with an app icon on your desktop/home screen!
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </>
        )}

        <div style={{ marginTop: 'var(--space-5)', display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={onClose} className="btn btn-secondary" style={{ padding: '8px 20px' }}>
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
