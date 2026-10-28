import React, { useState } from 'react';
import { ReminderRule } from '../types';
import { CURATED_REMINDER_TEMPLATES } from '../data/defaultPrompts';
import { reminderService } from '../services/reminderService';

interface RemindersViewProps {
  reminders: ReminderRule[];
  onAddReminder: (rule: ReminderRule) => void;
  onUpdateReminder: (rule: ReminderRule) => void;
  onDeleteReminder: (id: string) => void;
}

export const RemindersView: React.FC<RemindersViewProps> = ({
  reminders,
  onAddReminder,
  onUpdateReminder,
  onDeleteReminder
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(
    reminderService.getNotificationPermission()
  );
  const [testAlertMsg, setTestAlertMsg] = useState<string | null>(null);

  // New reminder form fields
  const [messageType, setMessageType] = useState<'curated' | 'custom'>('curated');
  const [selectedCuratedIndex, setSelectedCuratedIndex] = useState(0);
  const [customMessage, setCustomMessage] = useState('');
  const [localTime, setLocalTime] = useState('09:00');
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]); // Mon-Fri
  const [quietHoursStart, setQuietHoursStart] = useState('22:00');
  const [quietHoursEnd, setQuietHoursEnd] = useState('07:00');

  const daysLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const handleRequestPermission = async () => {
    const result = await reminderService.requestNotificationPermission();
    setNotificationPermission(result);
  };

  const handleToggleDay = (dayIdx: number) => {
    if (selectedDays.includes(dayIdx)) {
      if (selectedDays.length > 1) {
        setSelectedDays(selectedDays.filter(d => d !== dayIdx));
      }
    } else {
      setSelectedDays([...selectedDays, dayIdx].sort());
    }
  };

  const handleSaveReminder = () => {
    const message = messageType === 'curated'
      ? CURATED_REMINDER_TEMPLATES[selectedCuratedIndex].message
      : customMessage.trim() || 'Take a moment to align your actions with your primary purpose.';

    const newRule: ReminderRule = {
      id: `rem-${Date.now()}`,
      messageType,
      curatedCategory: messageType === 'curated' ? CURATED_REMINDER_TEMPLATES[selectedCuratedIndex].category : 'Custom Reflection',
      customMessage: message,
      localTime,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
      days: selectedDays,
      quietHoursStart,
      quietHoursEnd,
      enabled: true,
      paused: false,
      createdAt: Date.now()
    };

    onAddReminder(newRule);
    setIsAdding(false);
    setCustomMessage('');
  };

  const handleTestReminder = (rule: ReminderRule) => {
    reminderService.triggerTestNotification(rule);
    setTestAlertMsg(`Dispatched test notification: "${rule.customMessage || rule.curatedCategory}"`);
    setTimeout(() => setTestAlertMsg(null), 4000);
  };

  return (
    <div style={{ maxWidth: '920px', margin: '0 auto', padding: 'var(--space-8) var(--space-4)', width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span className="badge badge-indigo">⏰ Habit Architecture</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Quiet Hours Protected</span>
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.5rem)', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.025em' }}>
            Focus & Mindset Reminders
          </h1>
          <p style={{ fontSize: '0.925rem', color: 'var(--color-text-secondary)', maxWidth: '620px', lineHeight: 1.6 }}>
            Schedule disciplined nudges to review priorities, practice Itqān (excellence), and avoid drift throughout your week.
          </p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="btn btn-primary"
          style={{ fontWeight: 700 }}
        >
          {isAdding ? '✕ Close Form' : '+ Schedule Reminder'}
        </button>
      </div>

      {/* Test Alert Banner */}
      {testAlertMsg && (
        <div style={{
          padding: '12px 18px',
          borderRadius: 'var(--radius-lg)',
          background: 'rgba(52, 211, 153, 0.15)',
          border: '1px solid rgba(52, 211, 153, 0.35)',
          color: 'var(--color-accent-green)',
          marginBottom: 'var(--space-6)',
          fontSize: '0.875rem',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          animation: 'fadeIn 0.3s ease-out'
        }}>
          <span>🔔</span> {testAlertMsg}
        </div>
      )}

      {/* Browser Permission Banner */}
      {notificationPermission !== 'granted' && (
        <div className="card" style={{ padding: 'var(--space-5) var(--space-6)', marginBottom: 'var(--space-6)', background: 'rgba(251, 191, 36, 0.08)', border: '1px solid rgba(251, 191, 36, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-accent-secondary)' }}>
              Enable Browser Notifications
            </div>
            <div style={{ fontSize: '0.825rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
              Receive scheduled morning alignments and check-ins even when this tab is in the background.
            </div>
          </div>
          <button
            onClick={handleRequestPermission}
            className="btn btn-accent btn-sm"
          >
            Allow Notifications
          </button>
        </div>
      )}

      {/* Add Reminder Form Drawer */}
      {isAdding && (
        <div className="card card-glass" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-8)', border: '1px solid rgba(129, 140, 248, 0.35)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 'var(--space-4)', color: '#ffffff' }}>
            Schedule a New Focus Reminder
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            
            {/* Template Selector */}
            <div className="form-group">
              <label className="form-label">Message Type</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setMessageType('curated')}
                  className={`btn btn-sm ${messageType === 'curated' ? 'btn-primary' : 'btn-secondary'}`}
                >
                  Curated Growth Template
                </button>
                <button
                  type="button"
                  onClick={() => setMessageType('custom')}
                  className={`btn btn-sm ${messageType === 'custom' ? 'btn-primary' : 'btn-secondary'}`}
                >
                  Custom Personal Message
                </button>
              </div>
            </div>

            {messageType === 'curated' ? (
              <div className="form-group">
                <label className="form-label">Choose Curated Prompt</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '8px' }}>
                  {CURATED_REMINDER_TEMPLATES.map((tmpl, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedCuratedIndex(idx)}
                      style={{
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-lg)',
                        border: selectedCuratedIndex === idx ? '2px solid var(--color-accent-primary)' : '1px solid var(--color-border)',
                        background: selectedCuratedIndex === idx ? 'rgba(99, 102, 241, 0.18)' : 'rgba(255, 255, 255, 0.03)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ fontWeight: 700, fontSize: '0.85rem', color: selectedCuratedIndex === idx ? '#c7d2fe' : '#ffffff' }}>
                        {tmpl.category}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '4px', lineHeight: 1.4 }}>
                        "{tmpl.message}"
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="form-group">
                <label className="form-label">Custom Reflection Text</label>
                <textarea
                  className="form-textarea"
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="e.g. Have you reviewed your highest leverage milestone today? Focus on excellence over haste."
                  rows={3}
                />
              </div>
            )}

            {/* Time & Days Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
              <div className="form-group">
                <label className="form-label">Trigger Time (Your Local Time)</label>
                <input
                  type="time"
                  value={localTime}
                  onChange={(e) => setLocalTime(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Active Days</label>
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                  {daysLabels.map((dayName, dIdx) => {
                    const isSelected = selectedDays.includes(dIdx);
                    return (
                      <button
                        key={dIdx}
                        type="button"
                        onClick={() => handleToggleDay(dIdx)}
                        style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: '8px',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          background: isSelected ? 'var(--color-accent-primary)' : 'rgba(255, 255, 255, 0.05)',
                          color: isSelected ? '#ffffff' : 'var(--color-text-secondary)',
                          border: isSelected ? '1px solid var(--color-accent-primary)' : '1px solid var(--color-border)'
                        }}
                      >
                        {dayName}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Quiet Hours */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
              <div className="form-group">
                <label className="form-label">Quiet Hours Start</label>
                <input
                  type="time"
                  value={quietHoursStart}
                  onChange={(e) => setQuietHoursStart(e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Quiet Hours End</label>
                <input
                  type="time"
                  value={quietHoursEnd}
                  onChange={(e) => setQuietHoursEnd(e.target.value)}
                  className="form-input"
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: 'var(--space-2)' }}>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveReminder}
                className="btn btn-primary"
                style={{ fontWeight: 700 }}
              >
                Save Schedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reminders List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {reminders.length === 0 ? (
          <div className="card" style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>⏰</div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc', marginBottom: '6px' }}>
              No Active Reminders
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', maxWidth: '400px', margin: '0 auto 16px' }}>
              Add a morning or evening check-in to stay centered on your core goals and high-leverage habits.
            </p>
            <button
              onClick={() => setIsAdding(true)}
              className="btn btn-primary btn-sm"
            >
              + Create First Reminder
            </button>
          </div>
        ) : (
          reminders.map((rem) => (
            <div
              key={rem.id}
              className="card"
              style={{
                padding: 'var(--space-5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '14px',
                opacity: rem.enabled ? 1 : 0.65,
                border: rem.enabled ? '1px solid rgba(129, 140, 248, 0.25)' : '1px solid var(--color-border)',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ flex: 1, minWidth: '240px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span className="badge badge-indigo" style={{ fontSize: '0.7rem' }}>
                    {rem.curatedCategory || 'Reflection'}
                  </span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-accent-secondary)' }}>
                    ⏰ {rem.localTime}
                  </span>
                  <span style={{ fontSize: '0.725rem', color: 'var(--color-text-muted)' }}>
                    Quiet: {rem.quietHoursStart}–{rem.quietHoursEnd}
                  </span>
                </div>

                <div style={{ fontSize: '0.925rem', fontWeight: 600, color: '#f8fafc', lineHeight: 1.5, marginBottom: '6px' }}>
                  "{rem.customMessage}"
                </div>

                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                  {daysLabels.map((dName, dIdx) => {
                    const isActive = rem.days.includes(dIdx);
                    return (
                      <span
                        key={dIdx}
                        style={{
                          fontSize: '0.65rem',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontWeight: 600,
                          background: isActive ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                          color: isActive ? '#c7d2fe' : 'var(--color-text-muted)'
                        }}
                      >
                        {dName}
                      </span>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {/* Test button */}
                <button
                  onClick={() => handleTestReminder(rem)}
                  title="Test notification dispatch right now"
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.75rem', padding: '5px 10px' }}
                >
                  🔔 Test
                </button>

                {/* Enable toggle */}
                <label className="switch" title={rem.enabled ? 'Enabled' : 'Paused'}>
                  <input
                    type="checkbox"
                    checked={rem.enabled}
                    onChange={(e) => onUpdateReminder({ ...rem, enabled: e.target.checked })}
                  />
                  <span className="slider"></span>
                </label>

                {/* Delete button */}
                <button
                  onClick={() => onDeleteReminder(rem.id)}
                  title="Delete reminder"
                  style={{
                    padding: '6px 8px',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--color-text-muted)',
                    cursor: 'pointer',
                    opacity: 0.7
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.7')}
                >
                  🗑️
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
