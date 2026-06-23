'use client';

import React, { useState } from 'react';
import { logBloodPressureAction, logGlucoseAction, logHeartRateAction } from '@/app/actions/patient';
import { Heart, Activity, Thermometer, CheckCircle2, AlertTriangle, Plus, ClipboardList } from 'lucide-react';

export default function VitalLogForm() {
  const [activeForm, setActiveForm] = useState<'BP' | 'GLUCOSE' | 'HR'>('BP');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form Fields
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [pulse, setPulse] = useState('');

  const [glucose, setGlucose] = useState('');
  const [isFasting, setIsFasting] = useState(true);
  const [mealPhase, setMealPhase] = useState('BEFORE_MEAL');

  const [bpm, setBpm] = useState('');
  const [hrType, setHrType] = useState('RESTING');

  const [notes, setNotes] = useState('');

  const resetStatus = () => {
    setError(null);
    setSuccess(null);
  };

  const handleBPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetStatus();
    setLoading(true);

    const formData = new FormData();
    formData.append('systolic', systolic);
    formData.append('diastolic', diastolic);
    formData.append('heartRate', pulse);
    formData.append('notes', notes);

    const res = await logBloodPressureAction(null, formData);
    setLoading(false);
    if (res.error) {
      setError(res.error);
    } else {
      setSuccess(res.success || 'Blood pressure logged.');
      setSystolic('');
      setDiastolic('');
      setPulse('');
      setNotes('');
    }
  };

  const handleGlucoseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetStatus();
    setLoading(true);

    const formData = new FormData();
    formData.append('value', glucose);
    formData.append('isFasting', isFasting ? 'true' : 'false');
    formData.append('mealPhase', mealPhase);
    formData.append('notes', notes);

    const res = await logGlucoseAction(null, formData);
    setLoading(false);
    if (res.error) {
      setError(res.error);
    } else {
      setSuccess(res.success || 'Glucose levels logged.');
      setGlucose('');
      setNotes('');
    }
  };

  const handleHRSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetStatus();
    setLoading(true);

    const formData = new FormData();
    formData.append('bpm', bpm);
    formData.append('measurementType', hrType);
    formData.append('notes', notes);

    const res = await logHeartRateAction(null, formData);
    setLoading(false);
    if (res.error) {
      setError(res.error);
    } else {
      setSuccess(res.success || 'Heart rate logged.');
      setBpm('');
      setNotes('');
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Plus className="h-5 w-5 text-emerald-400" />
          Log New Vital Reading
        </h3>
        <p className="text-xs text-slate-400 mt-1">Keep your care team updated with your latest measurements.</p>
      </div>

      {/* Select Vital Category */}
      <div className="grid grid-cols-3 gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
        {(['BP', 'GLUCOSE', 'HR'] as const).map((type) => (
          <button
            key={type}
            onClick={() => {
              setActiveForm(type);
              resetStatus();
            }}
            className={`py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
              activeForm === type
                ? 'bg-slate-800 text-white shadow-md'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {type === 'BP' && (
              <>
                <Activity className="h-4 w-4 shrink-0" />
                <span>BP</span>
              </>
            )}
            {type === 'GLUCOSE' && (
              <>
                <Thermometer className="h-4 w-4 shrink-0" />
                <span>Glucose</span>
              </>
            )}
            {type === 'HR' && (
              <>
                <Heart className="h-4 w-4 shrink-0" />
                <span>Heart Rate</span>
              </>
            )}
          </button>
        ))}
      </div>

      {/* Success/Error Alerts */}
      {success && (
        <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-900/50 text-emerald-400 text-sm flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-900/50 text-rose-400 text-sm flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Forms Switcher */}
      {activeForm === 'BP' && (
        <form onSubmit={handleBPSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Systolic (Upper)
              </label>
              <input
                type="number"
                required
                min="50"
                max="250"
                placeholder="120"
                value={systolic}
                onChange={(e) => setSystolic(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 text-white placeholder-slate-700 text-sm outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Diastolic (Lower)
              </label>
              <input
                type="number"
                required
                min="30"
                max="150"
                placeholder="80"
                value={diastolic}
                onChange={(e) => setDiastolic(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 text-white placeholder-slate-700 text-sm outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Pulse (Optional)
            </label>
            <input
              type="number"
              min="30"
              max="220"
              placeholder="72 bpm"
              value={pulse}
              onChange={(e) => setPulse(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 text-white placeholder-slate-700 text-sm outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Symptoms / Notes
            </label>
            <textarea
              placeholder="How are you feeling today?"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 text-white placeholder-slate-700 text-sm outline-none resize-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-all disabled:opacity-50 text-sm flex items-center justify-center gap-2"
          >
            {loading ? 'Saving vital...' : 'Save Blood Pressure'}
          </button>
        </form>
      )}

      {activeForm === 'GLUCOSE' && (
        <form onSubmit={handleGlucoseSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Blood Sugar Level (mg/dL)
            </label>
            <input
              type="number"
              required
              min="20"
              max="600"
              placeholder="100"
              value={glucose}
              onChange={(e) => setGlucose(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 text-white placeholder-slate-700 text-sm outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 mt-4 px-1">
              <input
                type="checkbox"
                id="fasting-chk"
                checked={isFasting}
                onChange={(e) => setIsFasting(e.target.checked)}
                className="h-4 w-4 rounded border-slate-800 bg-slate-950 text-emerald-500 focus:ring-emerald-500"
              />
              <label htmlFor="fasting-chk" className="text-xs font-semibold uppercase tracking-wider text-slate-400 select-none cursor-pointer">
                Fasting Record
              </label>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Meal Phase
              </label>
              <select
                value={mealPhase}
                onChange={(e) => setMealPhase(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 text-white text-sm outline-none"
              >
                <option value="BEFORE_MEAL">Before Meal</option>
                <option value="AFTER_MEAL">After Meal</option>
                <option value="OTHER">Other / Overnight</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Dietary Notes
            </label>
            <textarea
              placeholder="Logged after breakfast, etc."
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 text-white placeholder-slate-700 text-sm outline-none resize-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-all disabled:opacity-50 text-sm flex items-center justify-center gap-2"
          >
            {loading ? 'Saving Vital...' : 'Save Glucose Reading'}
          </button>
        </form>
      )}

      {activeForm === 'HR' && (
        <form onSubmit={handleHRSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Heart Rate (BPM)
            </label>
            <input
              type="number"
              required
              min="30"
              max="220"
              placeholder="72"
              value={bpm}
              onChange={(e) => setBpm(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 text-white placeholder-slate-700 text-sm outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Activity Context
            </label>
            <select
              value={hrType}
              onChange={(e) => setHrType(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 text-white text-sm outline-none"
            >
              <option value="RESTING">Resting HR</option>
              <option value="ACTIVE">Post Exercise / Active</option>
              <option value="SLEEP">Overnight / Sleep</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Notes
            </label>
            <textarea
              placeholder="Felt steady, synced from smart watch, etc."
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 text-white placeholder-slate-700 text-sm outline-none resize-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-all disabled:opacity-50 text-sm flex items-center justify-center gap-2"
          >
            {loading ? 'Saving Vital...' : 'Save Heart Rate'}
          </button>
        </form>
      )}
    </div>
  );
}
