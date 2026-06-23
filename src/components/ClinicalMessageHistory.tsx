'use client';

import React, { useState, useRef, useEffect } from 'react';
import { sendClinicalMessageAction } from '@/app/actions/clinical';
import { sendPatientMessageAction } from '@/app/actions/patient';
import { getSession } from '@/lib/auth';
import { MessageSquare, Send, Bot, User, Check, ShieldCheck } from 'lucide-react';

interface ChatMessage {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
}

interface ClinicalMessageHistoryProps {
  messages: ChatMessage[];
  currentUserId: string;
  targetUserId: string; // Patient or Doctor user ID
  targetName: string;
  role: 'PATIENT' | 'CLINICIAN';
}

export default function ClinicalMessageHistory({
  messages: initialMessages,
  currentUserId,
  targetUserId,
  targetName,
  role,
}: ClinicalMessageHistoryProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Sync prop changes
  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  // Scroll to bottom
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sending) return;

    const userText = input;
    setInput('');
    setSending(true);

    // Optimistic Update
    const tempMsg: ChatMessage = {
      id: Math.random().toString(),
      senderId: currentUserId,
      content: userText,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMsg]);

    let res;
    if (role === 'CLINICIAN') {
      res = await sendClinicalMessageAction(targetUserId, userText);
    } else {
      res = await sendPatientMessageAction(targetUserId, userText);
    }

    setSending(false);

    if (res && res.error) {
      alert(res.error);
      // Remove optimistic message if error
      setMessages((prev) => prev.filter((m) => m.id !== tempMsg.id));
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col h-[400px]">
      {/* Chat Header */}
      <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-xs font-bold text-slate-300">Secure Thread with {targetName}</span>
        </div>
        <div className="flex items-center gap-1 text-[9px] text-slate-500">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
          Encrypted
        </div>
      </div>

      {/* Messages Log */}
      <div className="flex-1 overflow-y-auto py-4 space-y-3.5 pr-1 text-xs scrollbar-thin scrollbar-thumb-slate-850">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-2 opacity-40">
            <MessageSquare className="h-8 w-8 text-slate-600" />
            <p className="text-[11px] text-slate-500">No secure health updates logged in this thread.</p>
          </div>
        ) : (
          messages.map((m) => {
            const isMe = m.senderId === currentUserId;
            return (
              <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`p-3 rounded-2xl max-w-[80%] leading-relaxed ${
                    isMe
                      ? 'bg-indigo-600 text-white rounded-br-none'
                      : 'bg-slate-950 border border-slate-800 text-slate-300 rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-line">{m.content}</p>
                  <span className={`block text-[8px] text-right mt-1 opacity-60`}>
                    {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={scrollRef} />
      </div>

      {/* Sending Form */}
      <form onSubmit={handleSend} className="relative flex items-center mt-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Send secure reply to ${targetName}...`}
          className="w-full pl-3 pr-10 py-2.5 rounded-lg bg-slate-950 border border-slate-850 focus:border-indigo-500 text-xs text-white placeholder-slate-700 outline-none"
        />
        <button
          type="submit"
          disabled={!input.trim() || sending}
          className="absolute right-1.5 p-1.5 text-indigo-400 hover:text-white disabled:opacity-30 disabled:hover:text-indigo-400"
        >
          <Send className="h-3.5 w-3.5" />
        </button>
      </form>
    </div>
  );
}
