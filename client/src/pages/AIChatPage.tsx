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
    <div className="flex h-full flex-col bg-white dark:bg-slate-950">
      <div className="border-b border-slate-200 p-4 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-pink-600">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-slate-900 dark:text-white">Chronos AI Oracle</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Ask about Earth's changes over time</p>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.length === 0 && (
          <div className="py-16 text-center text-slate-500 dark:text-slate-400">
            <MessageSquare className="mx-auto mb-4 h-12 w-12 opacity-50" />
            <p className="text-lg font-medium">Welcome to Chronos AI</p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setInput(suggestion)}
                  className="rounded-full bg-slate-100 px-3 py-1.5 text-xs transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700"
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
                  ? 'bg-brand-600 text-white'
                  : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100'
              }`}
            >
              {message.content}
            </p>
          </div>
        ))}
      </div>

      <div className="border-t border-slate-200 p-4 dark:border-slate-800">
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
            className="max-h-32 min-h-[44px] flex-1 resize-none rounded-lg border border-slate-200 bg-slate-100 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-800"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="rounded-lg bg-brand-600 p-2.5 text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Send message"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
