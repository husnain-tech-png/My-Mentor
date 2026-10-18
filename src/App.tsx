import React, { useState, useEffect } from 'react';
import {
  AppPage,
  AppState,
  CloudUser,
  Conversation,
  IslamicReflection,
  MentorPreferences,
  ReminderRule,
  UserMode,
  UserProfile
} from './types';
import {
  clearAllUserData,
  DEFAULT_APP_STATE,
  DEFAULT_REMINDERS,
  loadStoredAppState,
  loadStoredReminders,
  saveStoredAppState,
  saveStoredReminders
} from './services/storage';
import {
  getCurrentUser,
  onAuthStateChange,
  syncConversationToCloud,
  deleteConversationFromCloud,
  syncReminderToCloud,
  deleteReminderFromCloud
} from './services/supabaseSync';
import { BIOGRAPHIES } from './data/biographies';

// Components
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { WelcomeScreen } from './components/WelcomeScreen';
import { OnboardingWizard } from './components/OnboardingWizard';
import { ChatView } from './components/ChatView';
import { BiographyLibrary } from './components/BiographyLibrary';
import { BiographyDetail } from './components/BiographyDetail';
import { IslamicReflectionsView } from './components/IslamicReflectionsView';
import { RemindersView } from './components/RemindersView';
import { SettingsView } from './components/SettingsView';
import { SupabaseSyncModal } from './components/SupabaseSyncModal';
import { InstallAppModal } from './components/InstallAppModal';
import { InstallAppBanner } from './components/InstallAppBanner';

export const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(() => loadStoredAppState());
  const [reminders, setReminders] = useState<ReminderRule[]>(() => loadStoredReminders());

  // Cloud & Supabase State
  const [cloudUser, setCloudUser] = useState<CloudUser | null>(null);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);

  // PWA & Installation State
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [canInstallDirectly, setCanInstallDirectly] = useState(false);
  const [isStandalone, setIsStandalone] = useState(() => {
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    );
  });
  const [isIOS] = useState(() => /iPhone|iPad|iPod/.test(navigator.userAgent));

  // Listen to PWA installation events
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstallDirectly(true);
    };

    const handleAppInstalled = () => {
      setIsStandalone(true);
      setDeferredPrompt(null);
      setCanInstallDirectly(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Check Supabase Auth User
  useEffect(() => {
    getCurrentUser().then(user => setCloudUser(user));
    const unsubscribe = onAuthStateChange(user => setCloudUser(user));
    return () => unsubscribe();
  }, []);

  // Persist state changes locally
  useEffect(() => {
    saveStoredAppState(appState);
  }, [appState]);

  useEffect(() => {
    saveStoredReminders(reminders);
  }, [reminders]);

  const activeConversation =
    appState.conversations.find(c => c.id === appState.activeConversationId) ||
    appState.conversations[0];

  // Navigation handler
  const handleNavigate = (page: AppPage) => {
    setAppState(prev => ({ ...prev, page, sidebarOpen: false }));
  };

  // Direct PWA Install trigger
  const handleInstallDirectly = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const choiceResult = await deferredPrompt.userChoice;
        if (choiceResult.outcome === 'accepted') {
          setDeferredPrompt(null);
          setCanInstallDirectly(false);
        }
      } catch (err) {
        console.warn('Install prompt error:', err);
      }
    } else {
      setIsInstallModalOpen(true);
    }
  };

  // Mode selection from Welcome
  const handleSelectMode = (mode: UserMode) => {
    setAppState(prev => ({
      ...prev,
      mode,
      page: mode === 'personalized' ? 'onboarding' : 'chat'
    }));
  };

  // Onboarding completion
  const handleOnboardingComplete = (profile: UserProfile, preferences: MentorPreferences) => {
    const personalizedGreeting = `Salam and welcome, ${profile.displayName}! I have adjusted my guidance to match your stage as a **${profile.stage?.replace('-', ' ')}** focusing on **${profile.goal || 'growth and mastery'}**.\n\nMy tone is set to **${preferences.tone}**, delivering **${preferences.answerFormat}** recommendations. Feel free to ask your most critical question today.`;

    const newConversation: Conversation = {
      id: `conv-${Date.now()}`,
      title: `${profile.goal ? profile.goal.slice(0, 24) + '...' : 'Initial Strategy'}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [
        {
          id: `msg-${Date.now()}`,
          role: 'mentor',
          text: personalizedGreeting,
          timestamp: Date.now(),
          islamicMode: preferences.islamicModeEnabled
        }
      ]
    };

    setAppState(prev => ({
      ...prev,
      mode: 'personalized',
      profile,
      preferences,
      page: 'chat',
      conversations: [newConversation, ...prev.conversations],
      activeConversationId: newConversation.id
    }));

    // Auto-sync new conversation to Supabase if logged in
    syncConversationToCloud(newConversation);
  };

  // Toggle Islamic Mode globally
  const handleToggleIslamicMode = () => {
    setAppState(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        islamicModeEnabled: !prev.preferences.islamicModeEnabled
      }
    }));
  };

  // Toggle Sidebar
  const handleToggleSidebar = () => {
    setAppState(prev => ({ ...prev, sidebarOpen: !prev.sidebarOpen }));
  };

  // Conversation Management
  const handleNewConversation = () => {
    const newConv: Conversation = {
      id: `conv-${Date.now()}`,
      title: 'New Mentorship Chat',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [
        {
          id: `msg-${Date.now()}`,
          role: 'mentor',
          text: appState.preferences.islamicModeEnabled
            ? 'Salam! What challenge or reflection would you like to explore together right now?'
            : 'Welcome. What strategic challenge, study priority, or decision is on your mind today?',
          timestamp: Date.now(),
          islamicMode: appState.preferences.islamicModeEnabled
        }
      ]
    };

    setAppState(prev => ({
      ...prev,
      conversations: [newConv, ...prev.conversations],
      activeConversationId: newConv.id,
      page: 'chat'
    }));

    syncConversationToCloud(newConv);
  };

  const handleUpdateConversation = (updated: Conversation) => {
    setAppState(prev => ({
      ...prev,
      conversations: prev.conversations.map(c => (c.id === updated.id ? updated : c))
    }));
    // Sync to Supabase in background
    syncConversationToCloud(updated);
  };

  const handleDeleteConversation = (id: string) => {
    setAppState(prev => {
      const remaining = prev.conversations.filter(c => c.id !== id);
      const fallback = remaining.length > 0 ? remaining[0] : null;
      return {
        ...prev,
        conversations: remaining.length > 0 ? remaining : [DEFAULT_APP_STATE.conversations[0]],
        activeConversationId: fallback ? fallback.id : DEFAULT_APP_STATE.conversations[0].id
      };
    });
    // Remove from Supabase
    deleteConversationFromCloud(id);
  };

  const handleSelectConversation = (id: string) => {
    setAppState(prev => ({
      ...prev,
      activeConversationId: id,
      page: 'chat'
    }));
  };

  // Biography navigation & actions
  const handleSelectBiography = (bioId: string) => {
    setAppState(prev => ({
      ...prev,
      selectedBiographyId: bioId,
      page: 'biography-detail'
    }));
  };

  const handleAskMentorAboutBio = (name: string) => {
    const prompt = `Tell me about ${name}'s core principles and how I can apply their methods to my modern work and life.`;
    handleNewConversationWithPrompt(prompt);
  };

  const handleDiscussLesson = (title: string, takeaway: string) => {
    const prompt = `I was studying the lesson "${title}". The suggested takeaway was: "${takeaway}". How should I implement this practically in my weekly planning?`;
    handleNewConversationWithPrompt(prompt);
  };

  const handleDiscussReflection = (reflection: IslamicReflection) => {
    const prompt = `I was reading the Islamic reflection on "${reflection.title}" (${reflection.theme}). The key takeaway was: "${reflection.practicalReflection}". Can we analyze how to embody this principle in my current career and study habits?`;
    handleNewConversationWithPrompt(prompt);
  };

  const handleNewConversationWithPrompt = (promptText: string) => {
    const userMsg = {
      id: `msg-${Date.now()}-u`,
      role: 'user' as const,
      text: promptText,
      timestamp: Date.now()
    };

    const newConv: Conversation = {
      id: `conv-${Date.now()}`,
      title: promptText.slice(0, 30) + '...',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [userMsg]
    };

    setAppState(prev => ({
      ...prev,
      conversations: [newConv, ...prev.conversations],
      activeConversationId: newConv.id,
      page: 'chat'
    }));

    syncConversationToCloud(newConv);
  };

  // Reminder rules actions
  const handleAddReminder = (rule: ReminderRule) => {
    setReminders(prev => [rule, ...prev]);
    syncReminderToCloud(rule);
  };

  const handleUpdateReminder = (updated: ReminderRule) => {
    setReminders(prev => prev.map(r => (r.id === updated.id ? updated : r)));
    syncReminderToCloud(updated);
  };

  const handleDeleteReminder = (id: string) => {
    setReminders(prev => prev.filter(r => r.id !== id));
    deleteReminderFromCloud(id);
  };

  // Reset all
  const handleResetAllData = () => {
    clearAllUserData();
    setAppState({ ...DEFAULT_APP_STATE });
    setReminders([...DEFAULT_REMINDERS]);
  };

  // Merge or apply data fetched from Supabase
  const handleApplyCloudData = (cloudData: {
    profile?: any;
    preferences?: any;
    conversations?: any[];
    reminders?: any[];
  }) => {
    setAppState(prev => ({
      ...prev,
      profile: cloudData.profile || prev.profile,
      preferences: cloudData.preferences || prev.preferences,
      conversations:
        cloudData.conversations && cloudData.conversations.length > 0
          ? cloudData.conversations
          : prev.conversations,
      activeConversationId:
        cloudData.conversations && cloudData.conversations.length > 0
          ? cloudData.conversations[0].id
          : prev.activeConversationId
    }));

    if (cloudData.reminders && cloudData.reminders.length > 0) {
      setReminders(cloudData.reminders);
    }
  };

  const currentBio =
    BIOGRAPHIES.find(b => b.id === appState.selectedBiographyId) || BIOGRAPHIES[0];

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--color-bg-primary)'
      }}
    >
      {/* Global Navigation Header */}
      <Header
        currentPage={appState.page}
        onNavigate={handleNavigate}
        userMode={appState.mode}
        profile={appState.profile}
        preferences={appState.preferences}
        onToggleIslamicMode={handleToggleIslamicMode}
        onToggleSidebar={handleToggleSidebar}
        cloudUser={cloudUser}
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
        isStandalone={isStandalone}
        canInstallDirectly={canInstallDirectly}
      />

      {/* Slide-out Sidebar Drawer */}
      <Sidebar
        isOpen={appState.sidebarOpen}
        onClose={() => setAppState(prev => ({ ...prev, sidebarOpen: false }))}
        conversations={appState.conversations}
        activeId={appState.activeConversationId}
        onSelectConversation={handleSelectConversation}
        onNewConversation={handleNewConversation}
        onDeleteConversation={handleDeleteConversation}
        onNavigate={handleNavigate}
        currentPage={appState.page}
        profile={appState.profile}
        cloudUser={cloudUser}
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
        isStandalone={isStandalone}
      />

      {/* Main Content Router */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {appState.page === 'welcome' && (
          <WelcomeScreen onSelectMode={handleSelectMode} onNavigate={handleNavigate} />
        )}

        {appState.page === 'onboarding' && (
          <OnboardingWizard
            initialProfile={appState.profile}
            initialPreferences={appState.preferences}
            onComplete={handleOnboardingComplete}
            onCancel={() => handleNavigate('welcome')}
          />
        )}

        {appState.page === 'chat' && activeConversation && (
          <ChatView
            conversation={activeConversation}
            profile={appState.profile}
            preferences={appState.preferences}
            onUpdateConversation={handleUpdateConversation}
          />
        )}

        {appState.page === 'library' && (
          <BiographyLibrary
            onSelectBiography={handleSelectBiography}
            onAskMentorAboutBio={handleAskMentorAboutBio}
          />
        )}

        {appState.page === 'biography-detail' && currentBio && (
          <BiographyDetail
            biography={currentBio}
            onBack={() => handleNavigate('library')}
            onDiscussLesson={handleDiscussLesson}
          />
        )}

        {appState.page === 'islamic' && (
          <IslamicReflectionsView
            onDiscussReflection={handleDiscussReflection}
            islamicModeActive={appState.preferences.islamicModeEnabled}
            onToggleIslamicMode={handleToggleIslamicMode}
          />
        )}

        {appState.page === 'reminders' && (
          <RemindersView
            reminders={reminders}
            onAddReminder={handleAddReminder}
            onUpdateReminder={handleUpdateReminder}
            onDeleteReminder={handleDeleteReminder}
          />
        )}

        {appState.page === 'settings' && (
          <SettingsView
            appState={appState}
            reminders={reminders}
            onUpdateProfile={profile => setAppState(prev => ({ ...prev, profile }))}
            onUpdatePreferences={preferences => setAppState(prev => ({ ...prev, preferences }))}
            onSwitchMode={mode => setAppState(prev => ({ ...prev, mode }))}
            onResetAllData={handleResetAllData}
            cloudUser={cloudUser}
            onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
            onOpenInstallModal={() => setIsInstallModalOpen(true)}
            isStandalone={isStandalone}
          />
        )}
      </main>

      {/* Install App Floating Banner */}
      <InstallAppBanner
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
        canInstallDirectly={canInstallDirectly}
        onInstallDirectly={handleInstallDirectly}
        isStandalone={isStandalone}
      />

      {/* Install App Step-by-Step Modal */}
      <InstallAppModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        canInstallDirectly={canInstallDirectly}
        onInstallDirectly={handleInstallDirectly}
        isStandalone={isStandalone}
        isIOS={isIOS}
      />

      {/* Supabase Cloud Sync & Account Hub Modal */}
      <SupabaseSyncModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        appState={appState}
        reminders={reminders}
        onApplyCloudData={handleApplyCloudData}
        currentUser={cloudUser}
        onUserChange={user => setCloudUser(user)}
      />
    </div>
  );
};
