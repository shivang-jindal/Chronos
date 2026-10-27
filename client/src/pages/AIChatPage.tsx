import { useState } from 'react';
import { Sparkles, Send, MessageSquare } from 'lucide-react';
import { useChronosStore } from '../store/chronosStore';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const SUGGESTIONS = [
  'Show me deforestation in the Amazon since 2000',
  'Predict Arctic sea ice in 2030',
  'Show me urban growth in Lagos since 2000'
];

export function AIChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const { temporal } = useChronosStore();

  const handleSend = () => {
    const content = input.trim();
    if (!content) return;
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: 'user', content },
      {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `I can visualise "${content}" across ${temporal.startYear}–${temporal.endYear}. Connect an AI provider to get live answers; this workspace is running in preview mode.`
      }
    ]);
    setInput('');
  };

  return (
    <div className="flex h-full flex-col bg-surface">
      <div className="border-b border-line p-4 border-line">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-400 to-brand-600">
            <Sparkles className="h-5 w-5 text-[#04121d]" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-ink">Chronos AI Oracle</h1>
            <p className="text-xs text-ink-faint">Ask about Earth's changes over time</p>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.length === 0 && (
          <div className="py-16 text-center text-ink-faint">
            <MessageSquare className="mx-auto mb-4 h-12 w-12 opacity-50" />
            <p className="text-lg font-medium">Welcome to Chronos AI</p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setInput(suggestion)}
                  className="rounded-full bg-surface-raised px-3 py-1.5 text-xs transition-colors hover:bg-white/10"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <p
              className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                message.role === 'user'
                  ? 'bg-brand-500 text-[#04121d]'
                  : 'bg-surface-raised text-ink-muted'
              }`}
            >
              {message.content}
            </p>
          </div>
        ))}
      </div>

      <div className="border-t border-line p-4 border-line">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            rows={1}
            placeholder="Ask about Earth's changes..."
            className="max-h-32 min-h-[44px] flex-1 resize-none rounded-lg border border-line bg-surface-raised px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 border-line bg-surface-raised"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="rounded-lg bg-brand-500 p-2.5 text-[#04121d] transition-colors hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Send message"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
