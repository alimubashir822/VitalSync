'use client';

import React, { useState } from 'react';
import { generateAiCarePlanAction } from '@/app/actions/clinical';
import { Sparkles, ClipboardCheck, ClipboardList, CheckCircle } from 'lucide-react';

interface CarePlanItem {
  id: string;
  title: string;
  goal: string;
  instructions: string;
  createdAt: string;
}

interface ClinicalCarePlanManagerProps {
  patientId: string;
  activePlan: CarePlanItem | null;
}

export default function ClinicalCarePlanManager({ patientId, activePlan }: ClinicalCarePlanManagerProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setSuccess(null);
    setError(null);

    const res = await generateAiCarePlanAction(patientId);
    setLoading(false);

    if (res.error) {
      setError(res.error);
    } else {
      setSuccess(res.success || 'Plan activated.');
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
      <div className="border-b border-slate-800 pb-4 flex justify-between items-start">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <ClipboardList className="h-4.5 w-4.5 text-indigo-400" />
            Chronic Care Plan
          </h3>
          <p className="text-xs text-slate-400 mt-1">Manage target guidelines and telemetry schedule thresholds.</p>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all disabled:opacity-50 shadow-[0_0_15px_rgba(79,70,229,0.2)]"
        >
          <Sparkles className="h-3.5 w-3.5" />
          {loading ? 'Analyzing...' : 'Generate AI Plan'}
        </button>
      </div>

      {success && (
        <div className="p-4 rounded-lg bg-emerald-950/30 border border-emerald-900/50 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle className="h-4 w-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-lg bg-rose-950/30 border border-rose-900/50 text-rose-400 text-xs">
          {error}
        </div>
      )}

      {activePlan ? (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-950/60 space-y-3">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Plan Title</span>
              <span className="block text-sm font-bold text-white mt-0.5">{activePlan.title}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Clinical Goal</span>
              <span className="block text-xs text-emerald-400 mt-0.5 font-medium">{activePlan.goal}</span>
            </div>
            <div className="border-t border-slate-900 pt-3">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Dosing & Telemetry Instructions</span>
              <p className="text-xs text-slate-400 mt-1.5 whitespace-pre-line leading-relaxed">
                {activePlan.instructions}
              </p>
            </div>
          </div>

          <div className="flex justify-between items-center text-[10px] text-slate-500 px-1">
            <span>Activated via AI Engine</span>
            <span>Date: {new Date(activePlan.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      ) : (
        <div className="p-6 text-center bg-slate-950/40 border border-slate-950 rounded-xl space-y-3">
          <ClipboardCheck className="h-8 w-8 text-slate-800 mx-auto animate-pulse" />
          <p className="text-xs text-slate-500">No active chronic care plan currently provisioned.</p>
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50"
          >
            Create First Care Plan
          </button>
        </div>
      )}
    </div>
  );
}
