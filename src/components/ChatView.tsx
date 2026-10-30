import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, Conversation, MentorPreferences, UserProfile, VoiceState } from '../types';
import { SUGGESTED_PROMPTS } from '../data/defaultPrompts';
import { speechService } from '../services/speechService';
import { generateMentorReplyAsync } from '../services/mentorEngine';
import { getEffectiveGroqApiKey, getEffectiveGroqModel, isGroqAvailable } from '../services/groqService';

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

  const [isGroqOnline, setIsGroqOnline] = useState<boolean>(() => !!getEffectiveGroqApiKey(preferences));
  const groqModel = getEffectiveGroqModel(preferences);

  useEffect(() => {
    let isMounted = true;
    isGroqAvailable(preferences).then(online => {
      if (isMounted) setIsGroqOnline(online);
    });
    return () => {
      isMounted = false;
    };
  }, [preferences]);

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
      title: conversation.messages.length <= 1 ? query.slice(0, 32) + '...' : conversation.title,
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
        return (
          <h4 key={idx} style={{ fontSize: '0.95rem', fontWeight: 700, margin: '12px 0 4px', color: 'var(--color-accent-primary)' }}>
            {line.replace('#### ', '')}
          </h4>
        );
      }
      // Heading 3
      if (line.startsWith('### ')) {
        return (
          <h3 key={idx} style={{ fontSize: '1.1rem', fontWeight: 800, margin: '14px 0 6px', color: '#ffffff' }}>
            {line.replace('### ', '')}
          </h3>
        );
      }
      // Blockquote
      if (line.startsWith('> ')) {
        return (
          <blockquote
            key={idx}
            style={{
              borderLeft: '3px solid var(--color-accent-secondary)',
              margin: '8px 0',
              color: 'var(--color-text-secondary)',
              fontStyle: 'italic',
              background: 'rgba(251, 191, 36, 0.06)',
              padding: '8px 14px',
              borderRadius: '0 var(--radius-md) var(--radius-md) 0',
              lineHeight: 1.55
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
          <li key={idx} style={{ marginLeft: '18px', listStyleType: 'disc', margin: '4px 0', lineHeight: 1.55 }}>
            {formatBold(cleanItem)}
          </li>
        );
      }
      // Numbered list
      if (/^\d+\.\s+/.test(line.trim())) {
        const cleanItem = line.trim().replace(/^\d+\.\s+/, '');
        return (
          <div key={idx} style={{ display: 'flex', gap: '8px', margin: '5px 0', lineHeight: 1.55 }}>
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
      return <p key={idx} style={{ margin: '4px 0', lineHeight: 1.6 }}>{formatBold(line)}</p>;
    });
  };

  const formatBold = (str: string) => {
    const parts = str.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} style={{ color: '#ffffff', fontWeight: 700 }}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div className="chat-container">
      {/* Chat Sub-Header Info Bar */}
      <div style={{
        padding: '8px var(--space-6)',
        background: 'rgba(10, 15, 26, 0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--color-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '8px',
        fontSize: '0.8rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>
            💬 {conversation.title}
          </span>
          <span className="badge badge-indigo" style={{ textTransform: 'capitalize' }}>
            Tone: {preferences.tone}
          </span>
          <span className="badge" style={{ textTransform: 'capitalize' }}>
            {preferences.answerFormat}
          </span>
          {preferences.islamicModeEnabled && (
            <span className="badge badge-violet">
              🌙 Islamic Mode
            </span>
          )}
          {isGroqOnline ? (
            <span className="badge badge-green" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#34d399', boxShadow: '0 0 6px #34d399' }} />
              ⚡ Groq: {groqModel}
            </span>
          ) : (
            <span className="badge" style={{ opacity: 0.8 }} title="Offline Knowledge Base with historical biographies & curated wisdom. Add Groq key in Settings for cloud LLM.">
              📖 Knowledge Base Active
            </span>
          )}
        </div>

        <div style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>
          {conversation.messages.length} messages
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="chat-message-list">
        
        {/* If conversation is empty or brand new, show inspiring prompt pills */}
        {conversation.messages.length <= 1 && (
          <div style={{
            maxWidth: '820px',
            margin: 'var(--space-4) auto var(--space-6)',
            width: '100%',
            padding: 'var(--space-6)',
            background: 'rgba(18, 25, 42, 0.65)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-xl)',
            textAlign: 'left'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontSize: '1.4rem' }}>💡</span>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc' }}>
                Prompt Suggestions to Kickstart Your Session:
              </h3>
            </div>
            <p style={{ fontSize: '0.825rem', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)' }}>
              Click any topic below or ask your own question in the input box:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px' }}>
              {SUGGESTED_PROMPTS.map((prompt) => (
                <button
                  key={prompt.id}
                  onClick={() => handleSendMessage(prompt.prompt)}
                  className="card-feature card-interactive"
                  style={{
                    padding: '10px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    textAlign: 'left',
                    borderRadius: 'var(--radius-lg)'
                  }}
                >
                  <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>{prompt.icon}</span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.8rem', color: '#f1f5f9' }}>
                      {prompt.label}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {prompt.prompt}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message Bubble List */}
        {conversation.messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div key={msg.id} className={`message-row ${isUser ? 'user' : 'mentor'}`}>
              {!isUser && (
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '11px',
                  background: preferences.islamicModeEnabled
                    ? 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)'
                    : 'linear-gradient(135deg, #818cf8 0%, #4f46e5 100%)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  flexShrink: 0,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.4)'
                }}>
                  {preferences.islamicModeEnabled ? '☪' : 'M'}
                </div>
              )}

              <div className={`message-bubble ${isUser ? 'user' : 'mentor'} ${msg.islamicMode ? 'islamic-theme' : ''}`}>
                <div>{renderFormattedText(msg.text)}</div>

                {/* Citations Box */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="citation-box">
                    <div style={{ fontWeight: 700, color: 'var(--color-accent-secondary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>🔍 Verified References & Sources:</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {msg.citations.map((cite, cIdx) => (
                        <div key={cIdx} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                          <div>
                            <span className="badge badge-indigo" style={{ marginRight: '6px', fontSize: '0.65rem' }}>
                              {cite.sourceType.toUpperCase()}
                            </span>
                            <span style={{ fontWeight: 600, color: '#f1f5f9' }}>{cite.label}</span>
                            {cite.details && (
                              <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.725rem', marginTop: '2px', lineHeight: 1.4 }}>
                                {cite.details}
                              </div>
                            )}
                          </div>
                          {cite.url && (cite.url.startsWith('http://') || cite.url.startsWith('https://')) && (
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
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: '10px',
                  paddingTop: '8px',
                  borderTop: '1px solid rgba(255,255,255,0.08)',
                  fontSize: '0.725rem',
                  color: isUser ? 'rgba(255,255,255,0.85)' : 'var(--color-text-muted)'
                }}>
                  <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>

                  {!isUser && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <button
                        onClick={() => handleSpeakMessage(msg.id, msg.text)}
                        title="Read message aloud"
                        style={{
                          color: activeSpeechMsgId === msg.id ? 'var(--color-accent-primary)' : 'inherit',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontWeight: 500
                        }}
                      >
                        {activeSpeechMsgId === msg.id ? '🔊 Reading...' : '🔈 Listen'}
                      </button>

                      <button
                        onClick={() => handleCopyText(msg.id, msg.text)}
                        title="Copy message text"
                        style={{
                          color: copiedId === msg.id ? 'var(--color-success)' : 'inherit',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontWeight: 500
                        }}
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
              width: '36px',
              height: '36px',
              borderRadius: '11px',
              background: preferences.islamicModeEnabled
                ? 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)'
                : 'linear-gradient(135deg, #818cf8 0%, #4f46e5 100%)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.95rem',
              fontWeight: 800,
              flexShrink: 0
            }}>
              {preferences.islamicModeEnabled ? '☪' : 'M'}
            </div>
            <div className={`message-bubble mentor ${preferences.islamicModeEnabled ? 'islamic-theme' : ''}`}>
              <div>
                {renderFormattedText(streamingText)}
                <span style={{ display: 'inline-block', width: '6px', height: '14px', background: 'var(--color-accent-primary)', marginLeft: '4px', verticalAlign: 'middle', animation: 'pulse 0.8s infinite' }} />
              </div>
            </div>
          </div>
        )}

        {/* Loading Indicator (Formulating response) */}
        {isGenerating && !streamingText && (
          <div className="message-row mentor">
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '11px',
              background: 'rgba(99, 102, 241, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              color: 'white'
            }}>
              M
            </div>
            <div className="message-bubble mentor" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-accent-primary)', animation: 'pulse 1s infinite' }} />
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-accent-primary)', animation: 'pulse 1s infinite 0.2s' }} />
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-accent-primary)', animation: 'pulse 1s infinite 0.4s' }} />
              <span style={{ fontSize: '0.825rem', color: 'var(--color-text-secondary)', marginLeft: '6px' }}>
                {isGroqOnline ? `Consulting Groq (${groqModel})...` : 'Consulting historical biographies & formulating guidance...'}
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Floating Bottom Input Bar */}
      <div style={{
        padding: 'var(--space-4) var(--space-6)',
        background: 'rgba(7, 10, 19, 0.92)',
        backdropFilter: 'blur(16px)',
        borderTop: '1px solid var(--color-border)',
        position: 'relative'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.65rem', maxWidth: '920px', margin: '0 auto' }}>
          
          {/* Voice Input Button */}
          <button
            onClick={handleToggleVoiceInput}
            aria-label="Toggle voice input"
            title={voiceState === 'listening' ? 'Listening... click to stop' : 'Voice input (Speech to Text)'}
            className={`btn btn-icon ${voiceState === 'listening' ? 'btn-accent' : 'btn-secondary'}`}
            style={{
              position: 'relative',
              flexShrink: 0,
              width: '46px',
              height: '46px',
              borderRadius: 'var(--radius-lg)'
            }}
          >
            {voiceState === 'listening' && (
              <div
                className="voice-pulse-ring"
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: 'var(--radius-lg)',
                  border: '2px solid var(--color-accent-secondary)'
                }}
              />
            )}
            <span style={{ fontSize: '1.15rem' }}>{voiceState === 'listening' ? '🔴' : '🎤'}</span>
          </button>

          {/* Textarea Input */}
          <div style={{ flex: 1, position: 'relative' }}>
            <textarea
              ref={textareaRef}
              rows={2}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                preferences.islamicModeEnabled
                  ? 'Ask about study routines, startup validation, career decisions, or Islamic ethics...'
                  : 'Ask about career strategy, study retention, startup ideas, or work-life balance...'
              }
              className="form-textarea"
              style={{
                minHeight: '46px',
                maxHeight: '160px',
                padding: '11px 14px',
                fontSize: '0.925rem',
                borderRadius: 'var(--radius-lg)'
              }}
            />
          </div>

          {/* Send Button */}
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim() || isGenerating}
            className="btn btn-primary"
            style={{
              height: '46px',
              padding: '0 20px',
              flexShrink: 0,
              borderRadius: 'var(--radius-lg)',
              fontWeight: 700,
              opacity: !inputText.trim() || isGenerating ? 0.5 : 1
            }}
          >
            <span>Send</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
          </button>
        </div>

        <div style={{ textAlign: 'center', fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '8px' }}>
          MyMentor grounds guidance in historical evidence & primary citations. Press Enter to send, Shift+Enter for new line.
        </div>
      </div>
    </div>
  );
};
