import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, Citation, Conversation, MentorPreferences, UserProfile, VoiceState } from '../types';
import { SUGGESTED_PROMPTS } from '../data/defaultPrompts';
import { speechService } from '../services/speechService';
import { generateMentorReplyAsync } from '../services/mentorEngine';
import { getEffectiveGroqApiKey, getEffectiveGroqModel } from '../services/groqService';

interface ChatViewProps {
  conversation: Conversation;
  profile: UserProfile | null;
  preferences: MentorPreferences;
  onUpdateConversation: (updated: Conversation) => void;
  onNavigateToBiography?: (bioId: string) => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  conversation,
  profile,
  preferences,
  onUpdateConversation
}) => {
  const [inputText, setInputText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [activeSpeechMsgId, setActiveSpeechMsgId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const groqKey = getEffectiveGroqApiKey(preferences);
  const groqModel = getEffectiveGroqModel(preferences);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation.messages, isGenerating, streamingText]);

  // Voice Speech-to-Text handler
  const handleToggleVoiceInput = () => {
    if (voiceState === 'listening') {
      speechService.stopListening();
      setVoiceState('idle');
    } else {
      speechService.startListening(
        (transcript) => {
          setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        },
        (state) => {
          setVoiceState(state);
        }
      );
    }
  };

  // Text-to-Speech handler for mentor messages
  const handleSpeakMessage = (msgId: string, text: string) => {
    if (activeSpeechMsgId === msgId && voiceState === 'speaking') {
      speechService.stopSpeaking(() => {
        setVoiceState('idle');
        setActiveSpeechMsgId(null);
      });
    } else {
      setActiveSpeechMsgId(msgId);
      speechService.speak(text, (state) => {
        setVoiceState(state);
        if (state === 'idle') {
          setActiveSpeechMsgId(null);
        }
      });
    }
  };

  const handleCopyText = (msgId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(msgId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || isGenerating) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      text: query,
      timestamp: Date.now()
    };

    const newMessages = [...conversation.messages, userMsg];
    const updatedConversation: Conversation = {
      ...conversation,
      title: conversation.messages.length === 0 ? query.slice(0, 32) + '...' : conversation.title,
      messages: newMessages,
      updatedAt: Date.now()
    };

    onUpdateConversation(updatedConversation);
    setInputText('');
    setIsGenerating(true);
    setStreamingText('');

    try {
      const output = await generateMentorReplyAsync({
        userMessage: query,
        history: newMessages.map(m => ({ role: m.role, text: m.text })),
        profile,
        preferences,
        onChunk: (chunkText) => {
          setStreamingText(chunkText);
        }
      });

      const mentorMsg: ChatMessage = {
        id: `msg-${Date.now()}-mentor`,
        role: 'mentor',
        text: output.text,
        citations: output.citations,
        timestamp: Date.now(),
        islamicMode: preferences.islamicModeEnabled
      };

      onUpdateConversation({
        ...updatedConversation,
        messages: [...newMessages, mentorMsg],
        updatedAt: Date.now()
      });
    } catch (err: any) {
      console.error('Error generating mentor response:', err);
    } finally {
      setIsGenerating(false);
      setStreamingText('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Render markdown-like text
  const renderFormattedText = (rawText: string) => {
    const lines = rawText.split('\n');
    return lines.map((line, idx) => {
      // Heading 4
      if (line.startsWith('#### ')) {
        return <h4 key={idx} style={{ fontSize: '1rem', fontWeight: 700, margin: '14px 0 6px', color: 'var(--color-accent-primary)' }}>{line.replace('#### ', '')}</h4>;
      }
      // Heading 3
      if (line.startsWith('### ')) {
        return <h3 key={idx} style={{ fontSize: '1.15rem', fontWeight: 800, margin: '16px 0 8px', color: 'white' }}>{line.replace('### ', '')}</h3>;
      }
      // Blockquote
      if (line.startsWith('> ')) {
        return (
          <blockquote
            key={idx}
            style={{
              borderLeft: '3px solid var(--color-accent-secondary)',
              paddingLeft: '12px',
              margin: '8px 0',
              color: 'var(--color-text-secondary)',
              fontStyle: 'italic',
              background: 'rgba(251, 191, 36, 0.05)',
              padding: '8px 12px',
              borderRadius: '0 var(--radius-sm) var(--radius-sm) 0'
            }}
          >
            {line.replace('> ', '')}
          </blockquote>
        );
      }
      // Bullet point
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        const cleanItem = line.trim().replace(/^[-*]\s+/, '');
        return (
          <li key={idx} style={{ marginLeft: '20px', listStyleType: 'disc', margin: '4px 0' }}>
            {formatBold(cleanItem)}
          </li>
        );
      }
      // Numbered list
      if (/^\d+\.\s+/.test(line.trim())) {
        const cleanItem = line.trim().replace(/^\d+\.\s+/, '');
        return (
          <div key={idx} style={{ display: 'flex', gap: '8px', margin: '6px 0' }}>
            <span style={{ color: 'var(--color-accent-primary)', fontWeight: 700 }}>•</span>
            <span>{formatBold(cleanItem)}</span>
          </div>
        );
      }
      // Empty line
      if (!line.trim()) {
        return <div key={idx} style={{ height: '8px' }} />;
      }
      // Normal paragraph
      return <p key={idx} style={{ margin: '4px 0' }}>{formatBold(line)}</p>;
    });
  };

  const formatBold = (str: string) => {
    const parts = str.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} style={{ color: 'var(--color-text-primary)' }}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div className="chat-container">
      {/* Chat Sub-Header */}
      <div style={{
        padding: '8px var(--space-6)',
        background: 'var(--color-bg-secondary)',
        borderBottom: '1px solid var(--color-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.8rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{conversation.title}</span>
          <span className="badge badge-indigo" style={{ textTransform: 'capitalize' }}>
            Tone: {preferences.tone}
          </span>
          <span className="badge" style={{ textTransform: 'capitalize' }}>
            {preferences.answerFormat}
          </span>
          {preferences.islamicModeEnabled && (
            <span className="badge badge-amber">
              ☪️ Islamic Lens
            </span>
          )}
          {groqKey ? (
            <span className="badge badge-green" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-accent-green)', display: 'inline-block' }} />
              ⚡ Groq: {groqModel}
            </span>
          ) : (
            <span className="badge" style={{ opacity: 0.75 }} title="Connect your Groq API key in Settings to activate real-time LLM chat.">
              🔌 Offline Knowledge Base
            </span>
          )}
        </div>

        <div style={{ color: 'var(--color-text-muted)' }}>
          {conversation.messages.length} messages
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="chat-message-list">
        {conversation.messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div key={msg.id} className={`message-row ${isUser ? 'user' : 'mentor'}`}>
              {!isUser && (
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: preferences.islamicModeEnabled ? 'rgba(167, 139, 250, 0.2)' : 'rgba(129, 140, 248, 0.2)',
                  color: preferences.islamicModeEnabled ? '#c4b5fd' : 'var(--color-accent-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  flexShrink: 0
                }}>
                  {preferences.islamicModeEnabled ? '☪' : 'M'}
                </div>
              )}

              <div className={`message-bubble ${isUser ? 'user' : 'mentor'} ${msg.islamicMode ? 'islamic-theme' : ''}`}>
                <div>{renderFormattedText(msg.text)}</div>

                {/* Citations Box */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="citation-box">
                    <div style={{ fontWeight: 600, color: 'var(--color-accent-secondary)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span>🔍 Verified References & Sources:</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {msg.citations.map((cite, cIdx) => (
                        <div key={cIdx} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                          <div>
                            <span className="badge badge-indigo" style={{ marginRight: '6px', fontSize: '0.65rem' }}>
                              {cite.sourceType.toUpperCase()}
                            </span>
                            <span style={{ fontWeight: 500 }}>{cite.label}</span>
                            {cite.details && (
                              <div style={{ color: 'var(--color-text-muted)', fontSize: '0.7rem', marginTop: '2px' }}>
                                {cite.details}
                              </div>
                            )}
                          </div>
                          {cite.url && (
                            <a
                              href={cite.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="citation-tag"
                            >
                              Verify ↗
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Message Meta & Action Bar */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px', paddingTop: '6px', borderTop: '1px solid rgba(255,255,255,0.06)', fontSize: '0.7rem', color: isUser ? 'rgba(255,255,255,0.8)' : 'var(--color-text-muted)' }}>
                  <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>

                  {!isUser && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        onClick={() => handleSpeakMessage(msg.id, msg.text)}
                        title="Read aloud"
                        style={{ color: activeSpeechMsgId === msg.id ? 'var(--color-accent-primary)' : 'inherit', cursor: 'pointer' }}
                      >
                        {activeSpeechMsgId === msg.id ? '🔊 Reading...' : '🔈 Listen'}
                      </button>

                      <button
                        onClick={() => handleCopyText(msg.id, msg.text)}
                        title="Copy message"
                        style={{ color: copiedId === msg.id ? 'var(--color-success)' : 'inherit', cursor: 'pointer' }}
                      >
                        {copiedId === msg.id ? '✓ Copied' : '📋 Copy'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Live Streaming Message Row */}
        {isGenerating && streamingText && (
          <div className="message-row mentor">
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: preferences.islamicModeEnabled ? 'rgba(167, 139, 250, 0.2)' : 'rgba(129, 140, 248, 0.2)',
              color: preferences.islamicModeEnabled ? '#c4b5fd' : 'var(--color-accent-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.9rem',
              fontWeight: 700,
              flexShrink: 0
            }}>
              {preferences.islamicModeEnabled ? '☪' : 'M'}
            </div>
            <div className={`message-bubble mentor ${preferences.islamicModeEnabled ? 'islamic-theme' : ''}`}>
              <div>
                {renderFormattedText(streamingText)}
                <span style={{ display: 'inline-block', width: '7px', height: '14px', background: 'var(--color-accent-primary)', marginLeft: '4px', verticalAlign: 'middle', animation: 'pulse 0.8s infinite' }} />
              </div>
            </div>
          </div>
        )}

        {/* Loading Indicator (Waiting for first token) */}
        {isGenerating && !streamingText && (
          <div className="message-row mentor">
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(129, 140, 248, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              M
            </div>
            <div className="message-bubble mentor" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-accent-primary)', animation: 'pulse 1s infinite' }}></div>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-accent-primary)', animation: 'pulse 1s infinite 0.2s' }}></div>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-accent-primary)', animation: 'pulse 1s infinite 0.4s' }}></div>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginLeft: '6px' }}>
                {groqKey ? `Consulting Groq (${groqModel})...` : 'Consulting sources & formulating guidance...'}
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts Shelf */}
      {conversation.messages.length <= 2 && (
        <div style={{ padding: '0 var(--space-6) var(--space-2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', overflowX: 'auto', paddingBottom: '4px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>Suggested:</span>
            {SUGGESTED_PROMPTS.map((prompt) => (
              <button
                key={prompt.id}
                onClick={() => handleSendMessage(prompt.prompt)}
                className="badge badge-indigo"
                style={{
                  padding: '6px 12px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  fontSize: '0.75rem'
                }}
              >
                {prompt.icon} {prompt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Bar */}
      <div style={{
        padding: 'var(--space-4) var(--space-6)',
        background: 'var(--color-bg-secondary)',
        borderTop: '1px solid var(--color-border)',
        position: 'relative'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 'var(--space-3)', maxWidth: '900px', margin: '0 auto' }}>
          {/* Voice Mic Button */}
          <button
            onClick={handleToggleVoiceInput}
            aria-label="Toggle voice recording"
            title={voiceState === 'listening' ? 'Listening... click to stop' : 'Voice input (Speech to Text)'}
            className={`btn btn-icon ${voiceState === 'listening' ? 'btn-accent' : 'btn-secondary'}`}
            style={{
              position: 'relative',
              flexShrink: 0,
              width: '44px',
              height: '44px'
            }}
          >
            {voiceState === 'listening' && (
              <div
                className="voice-pulse-ring"
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '50%',
                  border: '2px solid var(--color-accent-secondary)'
                }}
              />
            )}
            {voiceState === 'listening' ? '🎙️' : '🎤'}
          </button>

          {/* Text Area */}
          <div style={{ flex: 1, position: 'relative' }}>
            <textarea
              ref={textareaRef}
              rows={2}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                preferences.islamicModeEnabled
                  ? 'Ask about study, startup validation, career, or Islamic ethics...'
                  : 'Ask about study strategy, startup ideas, career decisions...'
              }
              className="form-textarea"
              style={{
                minHeight: '44px',
                maxHeight: '160px',
                padding: '10px 14px',
                fontSize: '0.95rem'
              }}
            />
          </div>

          {/* Send Button */}
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim() || isGenerating}
            className="btn btn-primary"
            style={{
              height: '44px',
              padding: '0 20px',
              flexShrink: 0,
              opacity: !inputText.trim() || isGenerating ? 0.5 : 1
            }}
          >
            <span>Send</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
          </button>
        </div>

        <div style={{ textAlign: 'center', fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '6px' }}>
          MyMentor grounds guidance in historical biographies & verified sources. Verify key professional decisions independently.
        </div>
      </div>
    </div>
  );
};
