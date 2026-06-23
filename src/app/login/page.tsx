'use client';

import React, { useState } from 'react';
import { loginAction } from '@/app/actions/auth';
import { Activity, Heart, ArrowRight, ShieldCheck, Mail, Lock, AlertCircle } from 'lucide-react';

const DEMO_ACCOUNTS = [
  {
    roleName: 'Sarah Jenkins (Patient - Hypertension)',
    email: 'sarah.jenkins@vitalsync.com',
    description: 'Track blood pressure, alerts, and log daily vitals.',
    badge: 'Hypertension',
    color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  },
  {
    roleName: 'John Smith (Patient - Diabetes)',
    email: 'john.smith@vitalsync.com',
    description: 'Track daily glucose, fasting logs, and medications.',
    badge: 'Diabetes',
    color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  },
  {
    roleName: 'Dr. Robert Chen (Cardiologist)',
    email: 'doctor.chen@vitalsync.com',
    description: 'Review patient list, analyze vitals, and generate AI care plans.',
    badge: 'Doctor Portal',
    color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  },
  {
    roleName: 'Nurse Emily Jackson (Care Team)',
    email: 'nurse.emily@vitalsync.com',
    description: 'Triage patient alerts, secure messaging, and review vitals.',
    badge: 'Care Team',
    color: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  },
  {
    roleName: 'Chief Admin Officer',
    email: 'admin@vitalsync.com',
    description: 'System audit logs, organization settings, and clinic analytics.',
    badge: 'Admin Panel',
    color: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  },
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);

    const res = await loginAction(null, formData);
    if (res && res.error) {
      setError(res.error);
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
    // Pre-fill and automatically submit
    setTimeout(() => {
      const form = document.getElementById('login-form') as HTMLFormElement;
      if (form) form.requestSubmit();
    }, 100);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-sans relative overflow-hidden">
      {/* Background Gradient Accents */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-500/5 blur-[140px] pointer-events-none" />

      {/* Main Header / Branding */}
      <header className="max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between border-b border-slate-900">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)]">
            <Activity className="h-6 w-6 text-slate-950" />
          </div>
          <div>
            <span className="font-bold text-xl tracking-tight text-white flex items-center gap-1">
              VitalSync <span className="text-emerald-400 font-medium text-sm px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-800">AI</span>
            </span>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2 text-slate-400 text-sm">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          HIPAA Compliant & Secure Healthcare Platform
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 flex flex-col items-center justify-center max-w-7xl mx-auto w-full px-6 py-12 grid md:grid-cols-12 gap-12 items-center">
        {/* Left Side: Product Intro */}
        <div className="md:col-span-6 space-y-6 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-sm text-emerald-400 font-medium">
            <Heart className="h-4 w-4 fill-current animate-pulse text-rose-500" />
            Chronic Care Intelligence Platform
          </div>
          <h1 className="text-4xl lg:text-5xl font-extrabold text-white leading-tight">
            Connecting Patients, Wearables, and Care Teams
          </h1>
          <p className="text-lg text-slate-400 leading-relaxed max-w-xl">
            VitalSync AI continuously monitors chronic conditions, flags cardiac and hypertensive risks in real-time, and assists clinical teams with AI decision support.
          </p>

          {/* Core Specs Grid */}
          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-900">
              <span className="block text-2xl font-bold text-emerald-400">94%</span>
              <span className="text-sm text-slate-400">Average Patient Adherence</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-900">
              <span className="block text-2xl font-bold text-indigo-400">Real-Time</span>
              <span className="text-sm text-slate-400">Alert Engine Processing</span>
            </div>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="md:col-span-6 w-full max-w-lg mx-auto space-y-6">
          <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-900 rounded-2xl p-8 shadow-2xl">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white">Sign In to VitalSync</h2>
              <p className="text-slate-400 text-sm mt-1">Access your patient health record or clinical practice dashboard.</p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-lg bg-rose-950/30 border border-rose-900/50 text-rose-300 text-sm flex items-start gap-3">
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form id="login-form" onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 h-5 w-5 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="name@vitalsync.com"
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-white placeholder-slate-600 transition-colors text-sm outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 h-5 w-5 text-slate-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-white placeholder-slate-600 transition-colors text-sm outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.2)] disabled:opacity-50"
              >
                {loading ? 'Authenticating...' : 'Sign In'}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            {/* Demo Quick Access Section */}
            <div className="mt-8 pt-6 border-t border-slate-900">
              <span className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 text-center">
                Demo Quick Access (Seeded Profiles)
              </span>
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {DEMO_ACCOUNTS.map((acc) => (
                  <button
                    key={acc.email}
                    onClick={() => handleQuickLogin(acc.email)}
                    disabled={loading}
                    className="w-full text-left p-3 rounded-lg border border-slate-900 bg-slate-950/40 hover:bg-slate-900/50 hover:border-slate-800 transition-all flex justify-between items-center group"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white group-hover:text-emerald-400 transition-colors">
                          {acc.roleName}
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded border ${acc.color}`}>
                          {acc.badge}
                        </span>
                      </div>
                      <span className="block text-xs text-slate-500 truncate max-w-[280px]">
                        {acc.description}
                      </span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-600 group-hover:text-emerald-400 shrink-0 transform group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto w-full px-6 py-6 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
        <div>
          &copy; {new Date().getFullYear()} VitalSync AI, Inc. All rights reserved. • Healthcare system by <a href="https://www.medclinicx.com/" target="_blank" rel="noopener noreferrer" className="hover:text-slate-300 underline font-semibold text-emerald-400">Med Clinic X</a>
        </div>
        <div className="flex gap-4">
          <a href="#" className="hover:text-slate-300">Privacy Policy</a>
          <a href="#" className="hover:text-slate-300">Terms of Service</a>
          <a href="#" className="hover:text-slate-300">HIPAA & Security</a>
        </div>
      </footer>
    </div>
  );
}
