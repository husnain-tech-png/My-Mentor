import React, { useState, useEffect } from 'react';

interface InstallAppBannerProps {
  onOpenInstallModal: () => void;
  canInstallDirectly: boolean;
  onInstallDirectly: () => void;
  isStandalone: boolean;
}

const DISMISS_KEY = 'mymentor_install_banner_dismissed';

export const InstallAppBanner: React.FC<InstallAppBannerProps> = ({
  onOpenInstallModal,
  canInstallDirectly,
  onInstallDirectly,
  isStandalone
}) => {
  const [dismissed, setDismissed] = useState<boolean>(() => {
    const item = localStorage.getItem(DISMISS_KEY);
    if (!item) return false;
    const time = parseInt(item, 10);
    // Suppress for 5 days after dismiss
    return Date.now() - time < 5 * 24 * 60 * 60 * 1000;
  });

  if (isStandalone || dismissed) {
    return null;
  }

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
    setDismissed(true);
  };

  const handleInstallClick = () => {
    if (canInstallDirectly) {
      onInstallDirectly();
    } else {
      onOpenInstallModal();
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '16px',
        right: '16px',
        left: '16px',
        maxWidth: '480px',
        marginLeft: 'auto',
        zIndex: 8888,
        background: 'rgba(15, 23, 42, 0.92)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(129, 140, 248, 0.35)',
        boxShadow: '0 12px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(99, 102, 241, 0.25)',
        borderRadius: 'var(--radius-xl)',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        animation: 'slideUp 0.3s ease-out'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: 'var(--radius-lg)',
            background: 'linear-gradient(135deg, #818cf8 0%, #6366f1 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 800,
            fontSize: '18px',
            flexShrink: 0
          }}
        >
          M
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            Install MyMentor App
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            Faster access & offline support on PC or Mobile
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
        <button
          onClick={handleInstallClick}
          className="btn btn-primary"
          style={{
            padding: '6px 12px',
            fontSize: '0.8rem',
            fontWeight: 700,
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-glow-indigo)'
          }}
        >
          📲 Install
        </button>
        <button
          onClick={handleDismiss}
          aria-label="Dismiss banner"
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--color-text-tertiary)',
            padding: '4px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    </div>
  );
};
