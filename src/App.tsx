import React, { useState, useEffect } from 'react';
import { AppPage, AppState, Conversation, IslamicReflection, MentorPreferences, ReminderRule, UserMode, UserProfile } from './types';
import {
  clearAllUserData,
  DEFAULT_APP_STATE,
  DEFAULT_REMINDERS,
  loadStoredAppState,
  loadStoredReminders,
  saveStoredAppState,
  saveStoredReminders
} from './services/storage';
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

export const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(() => loadStoredAppState());
  const [reminders, setReminders] = useState<ReminderRule[]>(() => loadStoredReminders());

  // Persist state changes
  useEffect(() => {
    saveStoredAppState(appState);
  }, [appState]);

  useEffect(() => {
    saveStoredReminders(reminders);
  }, [reminders]);

  const activeConversation = appState.conversations.find(c => c.id === appState.activeConversationId) || appState.conversations[0];

  // Navigation handler
  const handleNavigate = (page: AppPage) => {
    setAppState(prev => ({ ...prev, page, sidebarOpen: false }));
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
    // Generate tailored initial greeting message
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
  };

  const handleUpdateConversation = (updated: Conversation) => {
    setAppState(prev => ({
      ...prev,
      conversations: prev.conversations.map(c => c.id === updated.id ? updated : c)
    }));
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
  };

  // Reminder rules actions
  const handleAddReminder = (rule: ReminderRule) => {
    setReminders(prev => [rule, ...prev]);
  };

  const handleUpdateReminder = (updated: ReminderRule) => {
    setReminders(prev => prev.map(r => r.id === updated.id ? updated : r));
  };

  const handleDeleteReminder = (id: string) => {
    setReminders(prev => prev.filter(r => r.id !== id));
  };

  // Reset all
  const handleResetAllData = () => {
    clearAllUserData();
    setAppState({ ...DEFAULT_APP_STATE });
    setReminders([...DEFAULT_REMINDERS]);
  };

  // Selected biography for detail view
  const currentBio = BIOGRAPHIES.find(b => b.id === appState.selectedBiographyId) || BIOGRAPHIES[0];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--color-bg-primary)' }}>
      {/* Global Navigation Header */}
      <Header
        currentPage={appState.page}
        onNavigate={handleNavigate}
        userMode={appState.mode}
        profile={appState.profile}
        preferences={appState.preferences}
        onToggleIslamicMode={handleToggleIslamicMode}
        onToggleSidebar={handleToggleSidebar}
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
      />

      {/* Main Content Router */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {appState.page === 'welcome' && (
          <WelcomeScreen
            onSelectMode={handleSelectMode}
            onNavigate={handleNavigate}
          />
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
            onUpdateProfile={(profile) => setAppState(prev => ({ ...prev, profile }))}
            onUpdatePreferences={(preferences) => setAppState(prev => ({ ...prev, preferences }))}
            onSwitchMode={(mode) => setAppState(prev => ({ ...prev, mode }))}
            onResetAllData={handleResetAllData}
          />
        )}
      </main>
    </div>
  );
};
