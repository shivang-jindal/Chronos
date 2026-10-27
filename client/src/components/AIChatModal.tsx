import { useState, useRef, useEffect, useCallback } from 'react';
import { X, Send, Mic, Loader2, Copy, ThumbsUp, ThumbsDown, Sparkles, MessageSquare, Mic as MicIcon } from 'lucide-react';
import { useChronosStore } from '../store/chronosStore';
import { useToast } from './Toast';

export function AIChatModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  const [messages, setMessages] = useState<Array<{ id: string; role: 'user' | 'assistant' | 'system'; content: string; timestamp: number; actions?: any[] }>>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [voiceActive, setVoiceActive] = useState(false);
  const [voiceListening, setVoiceListening] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'display' | 'layers' | 'notifications' | 'advanced'>('general');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { addToast } = useToast();

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSend = async () => {
    if (!input.trim() || sending) return;

    const userMessage = input;
    setInput('');
    setSending(true);

    const userMsg = {
      id: crypto.randomUUID(),
      role: 'user' as const,
      content: userMessage,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, userMsg]);

    try {
      const response = await fetch('/api/v1/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          context: {
            location: null,
            layers: [],
            timeRange: null
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const assistantMsg = {
          id: crypto.randomUUID(),
          role: 'assistant' as const,
          content: data.message,
          timestamp: Date.now(),
          actions: data.actions
        };
        setMessages(prev => [...prev, assistantMsg]);
      } else {
        throw new Error('Failed to get response');
      }
    } catch (error) {
      const errorMsg = {
        id: crypto.randomUUID(),
        role: 'assistant' as const,
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleVoiceToggle = () => {
    if (!voiceActive) {
      setVoiceActive(true);
      addToast({ type: 'info', title: 'Voice Activated', message: 'Click the mic to start speaking', duration: 3000 });
    } else {
      setVoiceActive(false);
      addToast({ type: 'info', title: 'Voice Deactivated' });
    }
  };

  const handleVoiceStart = () => {
    setVoiceListening(true);
  };

  const handleVoiceEnd = () => {
    setVoiceListening(false);
  };

  const handleActionClick = (action: any) => {
    console.log('Action:', action);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleFeedback = (messageId: string, positive: boolean) => {
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm">
      <div className="bg-surface rounded-xl shadow-[var(--shadow-pop)] max-w-2xl w-full mx-4 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-line">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-[#04121d]" />
            </div>
            <span className="font-semibold text-ink">Chronos AI</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setVoiceActive(!voiceActive)}
              className={`p-2 rounded-lg transition-colors ${voiceActive ? 'bg-brand-500/10 text-brand-200' : 'text-ink-faint hover:bg-white/5'}`}
              aria-label={voiceActive ? 'Deactivate voice' : 'Activate voice'}
            >
              {voiceListening ? <Mic className="w-5 h-5 animate-pulse text-red-500" /> : <MicIcon className="w-5 h-5" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/5"
              aria-label="Close chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex border-b border-line">
          {['general', 'display', 'layers', 'notifications', 'advanced'].map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t as any)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === t
                  ? 'border-brand-500 text-brand-300'
                  : 'text-ink-faint hover:text-ink'
              }`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={messagesEndRef}>
          {messages.length === 0 && (
            <div className="text-center py-12 text-ink-faint">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Welcome to Chronos AI</p>
              <p className="text-sm mt-2 opacity-70">Ask me anything about Earth's changes over time</p>
              <div className="mt-6 flex flex-wrap gap-2 justify-center">
                {[
                  "Show me deforestation in the Amazon since 2000",
                  "Predict Arctic sea ice in 2030",
                  "Show me urban growth in Lagos since 2000",
                  "Create a scenario: carbon price $50/ton"
                ].map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(suggestion)}
                    className="px-3 py-1.5 text-xs bg-surface-raised rounded-full hover:bg-white/10 transition-colors"
                  >
                    {suggestion}
                  </button>
                )) }
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div key={message.id} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex flex-col max-w-[80%] ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`flex items-end gap-2 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`relative max-w-[80%] ${message.role === 'user' ? 'text-right' : ''}`}>
                    <div className={`px-4 py-2 rounded-2xl ${message.role === 'user' ? 'bg-brand-500 text-[#04121d] rounded-tr-none' : 'bg-surface-raised rounded-tr-none'}`}>
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                    <div className="flex items-center gap-1 mt-1 opacity-60">
                      <span className="text-xs text-ink-faint">
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {message.actions && message.actions.length > 0 && (
                        <button
                          onClick={() => message.actions?.forEach(handleActionClick)}
                          className="text-xs text-brand-300 hover:underline"
                        >
                          Execute {message.actions.length} action{message.actions.length > 1 ? 's' : ''}
                        </button>
                      )}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleFeedback(message.id, true)}
                          className="p-1 rounded hover:bg-white/10"
                          aria-label="Helpful"
                        >
                          <ThumbsUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleFeedback(message.id, false)}
                          className="p-1 rounded hover:bg-white/10"
                          aria-label="Not helpful"
                        >
                          <ThumbsDown className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleCopy(message.content)}
                          className="p-1 rounded hover:bg-white/10"
                          aria-label="Copy"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

    <div className="p-4 border-t border-line">
      <div className="flex items-end gap-2">
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          placeholder="Ask about Earth's changes..."
          rows={1}
          className="textarea flex-1 resize-none min-h-[44px] max-h-32"
          disabled={sending}
        />
        <div className="flex items-center gap-1">
          <button
            onClick={() => setVoiceActive(!voiceActive)}
            className={`p-2.5 rounded-lg transition-colors ${voiceActive ? 'bg-brand-500/10 text-brand-200' : 'text-ink-faint hover:bg-white/5'}`}
            aria-label={voiceActive ? 'Stop voice input' : 'Start voice input'}
            disabled={sending}
          >
            {voiceListening ? <Mic className="w-5 h-5 animate-pulse text-red-500" /> : <MicIcon className="w-5 h-5" />}
          </button>
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="btn btn-primary p-2.5"
            aria-label="Send message"
          >
            {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  </div>
  </div>
  );
}