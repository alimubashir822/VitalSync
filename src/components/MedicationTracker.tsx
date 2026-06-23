'use client';

import React, { startTransition, useOptimistic, useState } from 'react';
import { toggleMedicationAction } from '@/app/actions/patient';
import { Pill, CheckCircle2, Circle, Clock } from 'lucide-react';

interface MedicationItem {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  instructions: string | null;
  scheduleTime: string;
  lastTakenAt: string | null;
}

interface MedicationTrackerProps {
  medications: MedicationItem[];
}

export default function MedicationTracker({ medications }: MedicationTrackerProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Helper to determine if taken today
  const isTakenToday = (lastTakenStr: string | null) => {
    if (!lastTakenStr) return false;
    const lastTaken = new Date(lastTakenStr);
    const today = new Date();
    return lastTaken.toDateString() === today.toDateString();
  };

  const handleToggle = async (medId: string) => {
    setLoadingId(medId);
    await toggleMedicationAction(medId);
    setLoadingId(null);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
      <div className="border-b border-slate-800 pb-4 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Pill className="h-5 w-5 text-emerald-400" />
            Medication Schedule
          </h3>
          <p className="text-xs text-slate-400 mt-1">Check off medications once you take your daily dose.</p>
        </div>
      </div>

      {medications.length === 0 ? (
        <div className="p-6 text-center bg-slate-950/40 rounded-xl border border-slate-950">
          <Pill className="h-8 w-8 text-slate-700 mx-auto mb-2 animate-bounce" />
          <p className="text-sm text-slate-500">No active medications scheduled.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {medications.map((med) => {
            const completed = isTakenToday(med.lastTakenAt);
            const isLoading = loadingId === med.id;

            return (
              <div
                key={med.id}
                onClick={() => !isLoading && handleToggle(med.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer select-none flex items-center justify-between group ${
                  completed
                    ? 'bg-emerald-950/10 border-emerald-900/30'
                    : 'bg-slate-950/60 border-slate-900 hover:border-slate-800'
                } ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <button
                    disabled={isLoading}
                    className={`focus:outline-none shrink-0 ${
                      completed ? 'text-emerald-400' : 'text-slate-600 group-hover:text-slate-400'
                    }`}
                  >
                    {completed ? (
                      <CheckCircle2 className="h-5 w-5 fill-current text-slate-950 stroke-emerald-400" />
                    ) : (
                      <Circle className="h-5 w-5" />
                    )}
                  </button>

                  <div className="min-w-0">
                    <span
                      className={`block font-semibold text-sm transition-all ${
                        completed ? 'line-through text-slate-500' : 'text-white'
                      }`}
                    >
                      {med.name} - {med.dosage}
                    </span>
                    {med.instructions && (
                      <span className="block text-xs text-slate-500 mt-0.5 truncate max-w-[260px]">
                        {med.instructions}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 py-1 px-2.5 rounded-lg shrink-0 text-[10px] font-bold text-slate-400">
                  <Clock className="h-3.5 w-3.5 text-emerald-500" />
                  {med.scheduleTime}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
