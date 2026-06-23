'use client';

import React, { useState, useRef, useEffect } from 'react';
import { askAiAssistantAction } from '@/app/actions/ai';
import { Sparkles, Send, Bot, User, ArrowRight, CornerDownLeft } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const QUICK_PROMPTS = [
  'Explain my blood pressure trend',
  'What if my glucose level is low?',
  'Show my active medications schedule',
];

export default function AiPatientAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hello Sarah! I am your VitalSync AI Care Assistant. I analyze your logged vitals and explain trends to help you manage your chronic care goals. How can I help you today?',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMsg = textToSend;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    const history = messages.map((m) => ({ role: m.role, content: m.content }));
    const res = await askAiAssistantAction(userMsg, history);

    setLoading(false);
    if (res.response) {
      setMessages((prev) => [...prev, { role: 'assistant', content: res.response! }]);
    } else {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'I apologize, but I am unable to connect to the analysis engine right now. Please try again.' },
      ]);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col h-[460px]">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
            <Sparkles className="h-4 w-4 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">VitalSync Clinical Copilot</h3>
            <span className="block text-[10px] text-emerald-400 font-medium">Online • Decision Support Engine</span>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1 text-sm scrollbar-thin scrollbar-thumb-slate-800">
        {messages.map((msg, index) => {
          const isAi = msg.role === 'assistant';
          return (
            <div key={index} className={`flex gap-3 ${isAi ? '' : 'flex-row-reverse'}`}>
              <div
                className={`h-8 w-8 rounded-full border shrink-0 flex items-center justify-center ${
                  isAi
                    ? 'bg-indigo-950 border-indigo-800 text-indigo-400'
                    : 'bg-emerald-950 border-emerald-800 text-emerald-400'
                }`}
              >
                {isAi ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
              </div>

              <div
                className={`p-3.5 rounded-2xl max-w-[85%] leading-relaxed whitespace-pre-line ${
                  isAi
                    ? 'bg-slate-950 border border-slate-800/80 text-slate-300'
                    : 'bg-emerald-950/20 border border-emerald-900/30 text-white'
                }`}
              >
                {msg.content}
              </div>
            </div>
          );
        })}
        {loading && (
          <div className="flex gap-3">
            <div className="h-8 w-8 rounded-full border shrink-0 flex items-center justify-center bg-indigo-950 border-indigo-800 text-indigo-400">
              <Bot className="h-4 w-4 animate-bounce" />
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 text-slate-500 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-indigo-500 animate-ping" />
              <span>Analyzing vitals & compiling guidelines...</span>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Suggestions Box */}
      {messages.length === 1 && (
        <div className="flex flex-wrap gap-2 pb-3">
          {QUICK_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              onClick={() => handleSendMessage(prompt)}
              className="text-xs px-3 py-1.5 rounded-full border border-slate-800 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white transition-all text-left flex items-center gap-1"
            >
              {prompt}
              <ArrowRight className="h-3 w-3 shrink-0" />
            </button>
          ))}
        </div>
      )}

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(input);
        }}
        className="relative flex items-center"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your vitals, trends, or medication instructions..."
          className="w-full pl-4 pr-12 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 text-white placeholder-slate-700 text-xs outline-none"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="absolute right-2 top-2 p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-all disabled:opacity-30 disabled:hover:bg-indigo-600"
        >
          <Send className="h-3.5 w-3.5" />
        </button>
      </form>
    </div>
  );
}
