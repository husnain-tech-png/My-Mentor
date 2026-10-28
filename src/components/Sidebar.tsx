import React from 'react';
import { AppPage, Conversation, UserProfile } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  conversations: Conversation[];
  activeId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
  onNavigate: (page: AppPage) => void;
  currentPage: AppPage;
  profile: UserProfile | null;
  cloudUser?: { email?: string; displayName?: string } | null;
  onOpenSupabaseModal?: () => void;
  onOpenInstallModal?: () => void;
  isStandalone?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  conversations,
  activeId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  onNavigate,
  currentPage,
  profile,
  cloudUser,
  onOpenSupabaseModal,
  onOpenInstallModal,
  isStandalone
}) => {
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(3, 6, 15, 0.7)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            zIndex: 250,
            transition: 'opacity 0.25s ease'
          }}
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: '310px',
          background: 'rgba(10, 15, 26, 0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRight: '1px solid var(--color-border)',
          zIndex: 300,
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: isOpen ? '0 20px 40px rgba(0, 0, 0, 0.8), 0 0 30px rgba(99, 102, 241, 0.15)' : 'none'
        }}
      >
        {/* Header */}
        <div style={{ padding: 'var(--space-5) var(--space-4)', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '9px',
              background: 'linear-gradient(135deg, #818cf8 0%, #4f46e5 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 800,
              fontSize: '15px'
            }}>
              M
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#f8fafc' }}>MyMentor</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>Navigator & History</div>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close navigation sidebar"
            className="btn btn-secondary btn-icon"
            style={{ width: '32px', height: '32px', borderRadius: '8px', fontSize: '0.9rem' }}
          >
            ✕
          </button>
        </div>

        {/* Action: New Chat Button */}
        <div style={{ padding: 'var(--space-4)' }}>
          <button
            onClick={() => {
              onNewConversation();
              onNavigate('chat');
              onClose();
            }}
            className="btn btn-primary"
            style={{ width: '100%', gap: '8px', padding: '0.75rem', fontWeight: 700 }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            <span>+ New Mentorship Chat</span>
          </button>
        </div>

        {/* Quick Section Navigation Links */}
        <div style={{ padding: '0 var(--space-4) var(--space-3)' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
            Core Modules
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <button
              onClick={() => { onNavigate('chat'); onClose(); }}
              className={`nav-link ${currentPage === 'chat' ? 'active' : ''}`}
              style={{ width: '100%', justifyContent: 'flex-start' }}
            >
              💬 <span>AI Mentor Chat</span>
            </button>
            <button
              onClick={() => { onNavigate('library'); onClose(); }}
              className={`nav-link ${currentPage === 'library' || currentPage === 'biography-detail' ? 'active' : ''}`}
              style={{ width: '100%', justifyContent: 'flex-start' }}
            >
              📚 <span>Verified Biographies</span>
            </button>
            <button
              onClick={() => { onNavigate('islamic'); onClose(); }}
              className={`nav-link ${currentPage === 'islamic' ? 'active' : ''}`}
              style={{ width: '100%', justifyContent: 'flex-start' }}
            >
              🌙 <span>Islamic Reflections</span>
            </button>
            <button
              onClick={() => { onNavigate('reminders'); onClose(); }}
              className={`nav-link ${currentPage === 'reminders' ? 'active' : ''}`}
              style={{ width: '100%', justifyContent: 'flex-start' }}
            >
              ⏰ <span>Focus Reminders</span>
            </button>
            <button
              onClick={() => { onNavigate('settings'); onClose(); }}
              className={`nav-link ${currentPage === 'settings' ? 'active' : ''}`}
              style={{ width: '100%', justifyContent: 'flex-start' }}
            >
              ⚙️ <span>Preferences & AI Engine</span>
            </button>
          </div>
        </div>

        {/* Cloud & PWA Shortcuts */}
        <div style={{ padding: '0 var(--space-4) var(--space-3)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {onOpenSupabaseModal && (
              <button
                onClick={() => { onOpenSupabaseModal(); onClose(); }}
                className="nav-link"
                style={{
                  width: '100%',
                  justifyContent: 'flex-start',
                  fontSize: '0.8rem',
                  color: cloudUser ? '#34d399' : 'var(--color-text-secondary)',
                  background: cloudUser ? 'rgba(52, 211, 153, 0.08)' : 'transparent',
                  border: cloudUser ? '1px solid rgba(52, 211, 153, 0.25)' : '1px solid transparent'
                }}
              >
                ☁️ <span>{cloudUser ? 'Cloud Sync: Active' : 'Connect Supabase Cloud'}</span>
              </button>
            )}
            {!isStandalone && onOpenInstallModal && (
              <button
                onClick={() => { onOpenInstallModal(); onClose(); }}
                className="nav-link"
                style={{ width: '100%', justifyContent: 'flex-start', fontSize: '0.8rem', color: '#c7d2fe' }}
              >
                📲 <span>Install App on Device</span>
              </button>
            )}
          </div>
        </div>

        {/* Conversation List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 var(--space-4) var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Saved Chats ({conversations.length})
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            {conversations.map(conv => {
              const isActive = conv.id === activeId && currentPage === 'chat';
              return (
                <div
                  key={conv.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-lg)',
                    background: isActive ? 'rgba(99, 102, 241, 0.16)' : 'rgba(255, 255, 255, 0.025)',
                    border: isActive ? '1px solid rgba(129, 140, 248, 0.35)' : '1px solid transparent',
                    cursor: 'pointer',
                    transition: 'all 0.18s ease'
                  }}
                  onClick={() => {
                    onSelectConversation(conv.id);
                    onNavigate('chat');
                    onClose();
                  }}
                >
                  <div style={{ minWidth: 0, flex: 1, marginRight: '6px' }}>
                    <div style={{
                      fontSize: '0.825rem',
                      fontWeight: isActive ? 700 : 500,
                      color: isActive ? '#ffffff' : 'var(--color-text-secondary)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {conv.title || 'Untitled Session'}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                      {new Date(conv.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })} · {conv.messages.length} msgs
                    </div>
                  </div>

                  {conversations.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteConversation(conv.id);
                      }}
                      title="Delete conversation"
                      style={{
                        padding: '4px',
                        color: 'var(--color-text-muted)',
                        borderRadius: 'var(--radius-sm)',
                        opacity: 0.5,
                        fontSize: '0.8rem'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                      onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.5')}
                    >
                      🗑️
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Profile Footer */}
        <div style={{ padding: 'var(--space-4)', borderTop: '1px solid var(--color-border)', background: 'rgba(7, 10, 19, 0.95)' }}>
          <div
            onClick={() => { onNavigate('settings'); onClose(); }}
            style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer', padding: '4px', borderRadius: 'var(--radius-lg)' }}
          >
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'rgba(99, 102, 241, 0.2)',
              border: '1px solid rgba(129, 140, 248, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1rem',
              flexShrink: 0
            }}>
              👤
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {profile?.displayName || 'Guest User'}
              </div>
              <div style={{ fontSize: '0.725rem', color: 'var(--color-accent-primary)', textTransform: 'capitalize' }}>
                {profile?.stage ? profile.stage.replace('-', ' ') : 'Quick Access Mode'}
              </div>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>⚙️</div>
          </div>
        </div>
      </aside>
    </>
  );
};
