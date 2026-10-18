import { AppState, CloudUser, Conversation, MentorPreferences, ReminderRule, UserProfile, ChatMessage } from '../types';
import { getSupabase, recordLastSyncTime } from './supabaseClient';

/**
 * Authentication Methods
 */

export const getCurrentUser = async (): Promise<CloudUser | null> => {
  const supabase = getSupabase();
  if (!supabase) return null;

  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session?.user) return null;

    return {
      id: session.user.id,
      email: session.user.email,
      displayName: session.user.user_metadata?.display_name || session.user.email?.split('@')[0]
    };
  } catch (err) {
    console.warn('Error fetching current user:', err);
    return null;
  }
};

export const signUpWithEmail = async (
  email: string,
  password: string,
  displayName?: string
): Promise<{ ok: boolean; user?: CloudUser; message?: string }> => {
  const supabase = getSupabase();
  if (!supabase) {
    return { ok: false, message: 'Supabase is not configured. Please set your Supabase URL & Anon Key.' };
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          display_name: displayName?.trim() || email.split('@')[0]
        }
      }
    });

    if (error) {
      return { ok: false, message: error.message };
    }

    if (!data.user) {
      return { ok: false, message: 'Sign up failed. Please try again.' };
    }

    return {
      ok: true,
      user: {
        id: data.user.id,
        email: data.user.email,
        displayName: displayName || data.user.email?.split('@')[0]
      },
      message: data.session
        ? 'Account created and signed in successfully!'
        : 'Account created! Please check your email inbox to confirm your registration.'
    };
  } catch (err: any) {
    return { ok: false, message: err?.message || 'Failed to sign up.' };
  }
};

export const signInWithEmail = async (
  email: string,
  password: string
): Promise<{ ok: boolean; user?: CloudUser; message?: string }> => {
  const supabase = getSupabase();
  if (!supabase) {
    return { ok: false, message: 'Supabase is not configured.' };
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password
    });

    if (error) {
      return { ok: false, message: error.message };
    }

    if (!data.user) {
      return { ok: false, message: 'Sign in failed.' };
    }

    return {
      ok: true,
      user: {
        id: data.user.id,
        email: data.user.email,
        displayName: data.user.user_metadata?.display_name || data.user.email?.split('@')[0]
      },
      message: 'Signed in successfully!'
    };
  } catch (err: any) {
    return { ok: false, message: err?.message || 'Failed to sign in.' };
  }
};

export const signInWithMagicLink = async (email: string): Promise<{ ok: boolean; message: string }> => {
  const supabase = getSupabase();
  if (!supabase) {
    return { ok: false, message: 'Supabase is not configured.' };
  }

  try {
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: window.location.origin
      }
    });

    if (error) {
      return { ok: false, message: error.message };
    }

    return { ok: true, message: 'Magic login link sent! Check your email.' };
  } catch (err: any) {
    return { ok: false, message: err?.message || 'Failed to send magic link.' };
  }
};

export const signOutUser = async (): Promise<{ ok: boolean; message?: string }> => {
  const supabase = getSupabase();
  if (!supabase) return { ok: true };

  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      return { ok: false, message: error.message };
    }
    return { ok: true };
  } catch (err: any) {
    return { ok: false, message: err?.message };
  }
};

export const onAuthStateChange = (callback: (user: CloudUser | null) => void) => {
  const supabase = getSupabase();
  if (!supabase) return () => {};

  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    if (session?.user) {
      callback({
        id: session.user.id,
        email: session.user.email,
        displayName: session.user.user_metadata?.display_name || session.user.email?.split('@')[0]
      });
    } else {
      callback(null);
    }
  });

  return () => {
    subscription.unsubscribe();
  };
};

/**
 * Cloud Push: Pushes all local profile, preferences, conversations, and reminders to Supabase
 */
export const pushAllToCloud = async (
  appState: AppState,
  reminders: ReminderRule[]
): Promise<{ ok: boolean; message: string }> => {
  const supabase = getSupabase();
  if (!supabase) {
    return { ok: false, message: 'Supabase is not configured.' };
  }

  const user = await getCurrentUser();
  if (!user) {
    return { ok: false, message: 'Please sign in to save your data to Supabase.' };
  }

  try {
    // 1. Sync User Profile
    if (appState.profile) {
      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          email: user.email,
          display_name: appState.profile.displayName || user.displayName || 'Colleague',
          stage: appState.profile.stage || 'founder',
          goal: appState.profile.goal || '',
          topic_tags: appState.profile.topicTags || [],
          weekly_time_hours: appState.profile.weeklyTimeHours || 10,
          language: appState.profile.language || 'en',
          timezone: appState.profile.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
          updated_at: new Date().toISOString()
        });

      if (profileError) console.warn('Supabase profile sync warning:', profileError.message);
    }

    // 2. Sync Preferences
    if (appState.preferences) {
      const { error: prefError } = await supabase
        .from('mentor_preferences')
        .upsert({
          user_id: user.id,
          tone: appState.preferences.tone,
          answer_format: appState.preferences.answerFormat,
          challenge_level: appState.preferences.challengeLevel,
          subject_lens: appState.preferences.subjectLens || 'startup-basics',
          custom_instruction: appState.preferences.customInstruction || '',
          islamic_mode_enabled: !!appState.preferences.islamicModeEnabled,
          groq_model: appState.preferences.groqModel || 'llama-3.3-70b-versatile',
          updated_at: new Date().toISOString()
        });

      if (prefError) console.warn('Supabase preferences sync warning:', prefError.message);
    }

    // 3. Sync Conversations & Messages
    for (const conv of appState.conversations) {
      const { error: convError } = await supabase
        .from('conversations')
        .upsert({
          id: conv.id,
          user_id: user.id,
          title: conv.title,
          created_at_ms: conv.createdAt,
          updated_at_ms: conv.updatedAt,
          updated_at: new Date().toISOString()
        });

      if (convError) {
        console.warn('Supabase conversation sync warning:', convError.message);
        continue;
      }

      // Upsert messages for this conversation
      if (conv.messages && conv.messages.length > 0) {
        const rows = conv.messages.map(m => ({
          id: m.id,
          conversation_id: conv.id,
          user_id: user.id,
          role: m.role,
          text: m.text,
          citations: m.citations || [],
          timestamp_ms: m.timestamp,
          islamic_mode: !!m.islamicMode
        }));

        const { error: msgError } = await supabase
          .from('messages')
          .upsert(rows);

        if (msgError) console.warn('Supabase messages sync warning:', msgError.message);
      }
    }

    // 4. Sync Reminders
    if (reminders && reminders.length > 0) {
      const reminderRows = reminders.map(r => ({
        id: r.id,
        user_id: user.id,
        message_type: r.messageType,
        curated_category: r.curatedCategory || null,
        custom_message: r.customMessage || null,
        local_time: r.localTime,
        timezone: r.timezone,
        days: r.days,
        quiet_hours_start: r.quietHoursStart || '22:00',
        quiet_hours_end: r.quietHoursEnd || '07:00',
        enabled: r.enabled,
        paused: r.paused,
        created_at_ms: r.createdAt,
        updated_at: new Date().toISOString()
      }));

      const { error: remError } = await supabase
        .from('reminders')
        .upsert(reminderRows);

      if (remError) console.warn('Supabase reminders sync warning:', remError.message);
    }

    recordLastSyncTime();
    return { ok: true, message: 'All local data safely backed up to Supabase Cloud!' };
  } catch (err: any) {
    return { ok: false, message: err?.message || 'Sync failed.' };
  }
};

/**
 * Cloud Pull: Fetches all data belonging to the user from Supabase and merges with local state
 */
export const pullAllFromCloud = async (): Promise<{
  ok: boolean;
  profile?: UserProfile | null;
  preferences?: MentorPreferences | null;
  conversations?: Conversation[];
  reminders?: ReminderRule[];
  message: string;
}> => {
  const supabase = getSupabase();
  if (!supabase) {
    return { ok: false, message: 'Supabase is not configured.' };
  }

  const user = await getCurrentUser();
  if (!user) {
    return { ok: false, message: 'No user signed in to pull data.' };
  }

  try {
    // 1. Fetch Profile
    const { data: profileData } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    const loadedProfile: UserProfile | null = profileData
      ? {
          displayName: profileData.display_name,
          stage: profileData.stage,
          goal: profileData.goal,
          topicTags: profileData.topic_tags || [],
          weeklyTimeHours: profileData.weekly_time_hours,
          language: profileData.language,
          timezone: profileData.timezone
        }
      : null;

    // 2. Fetch Preferences
    const { data: prefData } = await supabase
      .from('mentor_preferences')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    const loadedPreferences: MentorPreferences | null = prefData
      ? {
          tone: prefData.tone,
          answerFormat: prefData.answer_format,
          challengeLevel: prefData.challenge_level,
          subjectLens: prefData.subject_lens,
          customInstruction: prefData.custom_instruction,
          islamicModeEnabled: prefData.islamic_mode_enabled,
          groqModel: prefData.groq_model
        }
      : null;

    // 3. Fetch Conversations
    const { data: convRows } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at_ms', { ascending: false });

    // 4. Fetch Messages
    const { data: msgRows } = await supabase
      .from('messages')
      .select('*')
      .eq('user_id', user.id)
      .order('timestamp_ms', { ascending: true });

    // Group messages by conversation ID
    const msgMap = new Map<string, ChatMessage[]>();
    if (msgRows) {
      for (const m of msgRows) {
        const msg: ChatMessage = {
          id: m.id,
          role: m.role as 'user' | 'mentor',
          text: m.text,
          citations: m.citations || [],
          timestamp: Number(m.timestamp_ms),
          islamicMode: m.islamic_mode
        };
        const list = msgMap.get(m.conversation_id) || [];
        list.push(msg);
        msgMap.set(m.conversation_id, list);
      }
    }

    const loadedConversations: Conversation[] = (convRows || []).map(c => ({
      id: c.id,
      title: c.title,
      createdAt: Number(c.created_at_ms),
      updatedAt: Number(c.updated_at_ms),
      messages: msgMap.get(c.id) || []
    }));

    // 5. Fetch Reminders
    const { data: reminderRows } = await supabase
      .from('reminders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at_ms', { ascending: false });

    const loadedReminders: ReminderRule[] = (reminderRows || []).map(r => ({
      id: r.id,
      messageType: r.message_type as 'curated' | 'custom',
      curatedCategory: r.curated_category,
      customMessage: r.custom_message,
      localTime: r.local_time,
      timezone: r.timezone,
      days: r.days || [1, 2, 3, 4, 5],
      quietHoursStart: r.quiet_hours_start,
      quietHoursEnd: r.quiet_hours_end,
      enabled: r.enabled,
      paused: r.paused,
      createdAt: Number(r.created_at_ms)
    }));

    recordLastSyncTime();

    return {
      ok: true,
      profile: loadedProfile,
      preferences: loadedPreferences,
      conversations: loadedConversations,
      reminders: loadedReminders,
      message: `Downloaded ${loadedConversations.length} conversations and ${loadedReminders.length} reminders from Supabase.`
    };
  } catch (err: any) {
    return { ok: false, message: err?.message || 'Failed to download from Supabase.' };
  }
};

/**
 * Granular sync helper: syncs a single conversation
 */
export const syncConversationToCloud = async (conv: Conversation): Promise<void> => {
  const supabase = getSupabase();
  if (!supabase) return;

  const user = await getCurrentUser();
  if (!user) return;

  try {
    await supabase.from('conversations').upsert({
      id: conv.id,
      user_id: user.id,
      title: conv.title,
      created_at_ms: conv.createdAt,
      updated_at_ms: conv.updatedAt,
      updated_at: new Date().toISOString()
    });

    if (conv.messages.length > 0) {
      const rows = conv.messages.map(m => ({
        id: m.id,
        conversation_id: conv.id,
        user_id: user.id,
        role: m.role,
        text: m.text,
        citations: m.citations || [],
        timestamp_ms: m.timestamp,
        islamic_mode: !!m.islamicMode
      }));
      await supabase.from('messages').upsert(rows);
    }
  } catch (err) {
    console.warn('Background conv sync error:', err);
  }
};

/**
 * Deletes a conversation from Supabase
 */
export const deleteConversationFromCloud = async (convId: string): Promise<void> => {
  const supabase = getSupabase();
  if (!supabase) return;

  try {
    await supabase.from('conversations').delete().eq('id', convId);
  } catch (err) {
    console.warn('Cloud delete error:', err);
  }
};

/**
 * Granular sync helper: syncs a single reminder
 */
export const syncReminderToCloud = async (reminder: ReminderRule): Promise<void> => {
  const supabase = getSupabase();
  if (!supabase) return;

  const user = await getCurrentUser();
  if (!user) return;

  try {
    await supabase.from('reminders').upsert({
      id: reminder.id,
      user_id: user.id,
      message_type: reminder.messageType,
      curated_category: reminder.curatedCategory || null,
      custom_message: reminder.customMessage || null,
      local_time: reminder.localTime,
      timezone: reminder.timezone,
      days: reminder.days,
      quiet_hours_start: reminder.quietHoursStart || '22:00',
      quiet_hours_end: reminder.quietHoursEnd || '07:00',
      enabled: reminder.enabled,
      paused: reminder.paused,
      created_at_ms: reminder.createdAt,
      updated_at: new Date().toISOString()
    });
  } catch (err) {
    console.warn('Background reminder sync error:', err);
  }
};

/**
 * Deletes a reminder from Supabase
 */
export const deleteReminderFromCloud = async (reminderId: string): Promise<void> => {
  const supabase = getSupabase();
  if (!supabase) return;

  try {
    await supabase.from('reminders').delete().eq('id', reminderId);
  } catch (err) {
    console.warn('Cloud delete reminder error:', err);
  }
};
