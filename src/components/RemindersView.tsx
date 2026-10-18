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
    setTestAlertMsg(`Dispatched test notification for: "${rule.customMessage || rule.curatedCategory}"`);
    setTimeout(() => setTestAlertMsg(null), 4000);
  };

  return (
    <div style={{ maxWidth: '880px', margin: '0 auto', padding: 'var(--space-8) var(--space-4)', width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span className="badge badge-indigo">Habit Architecture</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Quiet Hours Protected</span>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Focus & Mindset Reminders</h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', maxWidth: '580px', lineHeight: 1.5 }}>
            Schedule disciplined nudges to review priorities, practice Itqān (excellence), and avoid drift throughout your week.
          </p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="btn btn-primary"
        >
          {isAdding ? '✕ Cancel' : '+ Schedule Reminder'}
        </button>
      </div>

      {/* Test Alert Banner */}
      {testAlertMsg && (
        <div style={{
          padding: '12px 16px',
          borderRadius: 'var(--radius-lg)',
          background: 'rgba(52, 211, 153, 0.15)',
          border: '1px solid rgba(52, 211, 153, 0.3)',
          color: 'var(--color-accent-green)',
          marginBottom: 'var(--space-6)',
          fontSize: '0.875rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span>🔔</span> {testAlertMsg}
        </div>
      )}

      {/* Browser Permission Banner */}
      {notificationPermission !== 'granted' && (
        <div className="card" style={{ padding: 'var(--space-4) var(--space-6)', marginBottom: 'var(--space-6)', background: 'rgba(251, 191, 36, 0.08)', border: '1px solid rgba(251, 191, 36, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-accent-secondary)' }}>
              Enable Browser Notifications
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
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

      {/* Add Reminder Form */}
      {isAdding && (
        <div className="card card-glass" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-8)' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 'var(--space-4)' }}>Create New Focus Reminder</h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {/* Type selector */}
            <div className="form-group">
              <label className="form-label">Message Source</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)' }}>
                <button
                  type="button"
                  onClick={() => setMessageType('curated')}
                  className={`btn ${messageType === 'curated' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ fontSize: '0.85rem' }}
                >
                  📜 Curated Mentor Wisdom
                </button>
                <button
                  type="button"
                  onClick={() => setMessageType('custom')}
                  className={`btn ${messageType === 'custom' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ fontSize: '0.85rem' }}
                >
                  ✍️ Custom Personal Message
                </button>
              </div>
            </div>

            {/* Template or Custom input */}
            {messageType === 'curated' ? (
              <div className="form-group">
                <label className="form-label">Select Curated Theme</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {CURATED_REMINDER_TEMPLATES.map((tmpl, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedCuratedIndex(idx)}
                      style={{
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-md)',
                        background: selectedCuratedIndex === idx ? 'rgba(129, 140, 248, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                        border: selectedCuratedIndex === idx ? '1px solid var(--color-accent-primary)' : '1px solid var(--color-border)',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-accent-secondary)' }}>
                        {tmpl.category}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                        "{tmpl.message}"
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="form-group">
                <label className="form-label" htmlFor="customReminderMessage">Your Custom Reminder Prompt</label>
                <textarea
                  id="customReminderMessage"
                  className="form-textarea"
                  placeholder="e.g. Pause and check: am I doing shallow work or deep focus right now?"
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  rows={2}
                />
              </div>
            )}

            {/* Time & Days */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="reminderLocalTime">Time (Local)</label>
                <input
                  id="reminderLocalTime"
                  type="time"
                  className="form-input"
                  value={localTime}
                  onChange={(e) => setLocalTime(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Days of Week</label>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {daysLabels.map((lbl, idx) => {
                    const isSelected = selectedDays.includes(idx);
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleToggleDay(idx)}
                        style={{
                          flex: 1,
                          padding: '6px 2px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          background: isSelected ? 'var(--color-accent-primary)' : 'rgba(255,255,255,0.05)',
                          color: isSelected ? 'white' : 'var(--color-text-muted)',
                          border: isSelected ? '1px solid var(--color-accent-primary)' : '1px solid var(--color-border)'
                        }}
                      >
                        {lbl}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Quiet hours */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="quietHoursStart">Quiet Hours Start</label>
                <input
                  id="quietHoursStart"
                  type="time"
                  className="form-input"
                  value={quietHoursStart}
                  onChange={(e) => setQuietHoursStart(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="quietHoursEnd">Quiet Hours End</label>
                <input
                  id="quietHoursEnd"
                  type="time"
                  className="form-input"
                  value={quietHoursEnd}
                  onChange={(e) => setQuietHoursEnd(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
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
              >
                Save Schedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reminder List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {reminders.map((rule) => {
          const inQuiet = reminderService.isInQuietHours(rule);
          return (
            <div
              key={rule.id}
              className="card"
              style={{
                padding: 'var(--space-5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 'var(--space-4)',
                opacity: rule.enabled ? 1 : 0.6
              }}
            >
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-accent-primary)' }}>
                    {rule.localTime}
                  </span>
                  <span className="badge badge-indigo">
                    {rule.curatedCategory || 'Daily Alignment'}
                  </span>
                  {inQuiet && (
                    <span className="badge" style={{ color: 'var(--color-warning)', borderColor: 'rgba(251, 191, 36, 0.3)' }}>
                      🌙 Quiet Hours
                    </span>
                  )}
                </div>

                <div style={{ fontSize: '0.9rem', color: 'var(--color-text-primary)', marginBottom: '6px' }}>
                  "{rule.customMessage}"
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                  <span>Repeats:</span>
                  {rule.days.map(d => daysLabels[d]).join(', ')}
                  <span>·</span>
                  <span>Quiet: {rule.quietHoursStart}–{rule.quietHoursEnd}</span>
                </div>
              </div>

              {/* Controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <button
                  onClick={() => handleTestReminder(rule)}
                  className="btn btn-secondary btn-sm"
                  title="Test notification immediately"
                >
                  🔔 Test
                </button>

                <label className="switch" title="Toggle active status">
                  <input
                    type="checkbox"
                    checked={rule.enabled}
                    onChange={(e) => onUpdateReminder({ ...rule, enabled: e.target.checked })}
                  />
                  <span className="slider"></span>
                </label>

                <button
                  onClick={() => onDeleteReminder(rule.id)}
                  title="Delete reminder"
                  className="btn btn-secondary btn-icon"
                  style={{ width: '34px', height: '34px', color: 'var(--color-error)' }}
                >
                  🗑️
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
