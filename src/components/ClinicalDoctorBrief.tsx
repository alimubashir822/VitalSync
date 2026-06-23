'use client';

import React from 'react';
import { Sparkles, Pill, Activity, Calendar, ArrowRight, ShieldCheck } from 'lucide-react';

interface ClinicalDoctorBriefProps {
  patientName: string;
  condition: string;
  adherenceRate: number;
  missedDosesCount: number;
  bpTrend: string;
  glucoseTrend: string;
  isStable: boolean;
}

export default function ClinicalDoctorBrief({
  patientName,
  condition,
  adherenceRate,
  missedDosesCount,
  bpTrend,
  glucoseTrend,
  isStable,
}: ClinicalDoctorBriefProps) {
  return (
    <div className="bg-slate-900 border border-indigo-900/40 rounded-2xl p-6 relative overflow-hidden shadow-2xl">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-indigo-500/5 blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex justify-between items-start gap-4 border-b border-slate-800 pb-4">
        <div className="space-y-1">
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-400 uppercase bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
            <Sparkles className="h-3 w-3" />
            AI Appointment Brief
          </span>
          <h3 className="text-sm font-extrabold text-white mt-1">Pre-Appointment Clinical Insights</h3>
        </div>
        <div className="text-[10px] text-slate-500 flex items-center gap-1">
          <Calendar className="h-3.5 w-3.5" />
          Last 30 Days
        </div>
      </div>

      {/* Grid Specs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        {/* Vitals overview */}
        <div className="space-y-3">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1">
            <Activity className="h-3.5 w-3.5 text-rose-500" /> Telemetry Trends
          </span>
          <div className="space-y-2 bg-slate-950 p-3.5 rounded-xl border border-slate-950/60 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Blood Pressure</span>
              <span className={`font-semibold ${bpTrend.includes('Elevated') || bpTrend.includes('increase') ? 'text-rose-400' : 'text-slate-300'}`}>
                {bpTrend}
              </span>
            </div>
            <div className="flex justify-between border-t border-slate-900 pt-2">
              <span className="text-slate-400">Glucose Logs</span>
              <span className={`font-semibold ${glucoseTrend.includes('elevated') || glucoseTrend.includes('increase') ? 'text-amber-400' : 'text-slate-300'}`}>
                {glucoseTrend}
              </span>
            </div>
          </div>
        </div>

        {/* Med Adherence */}
        <div className="space-y-3">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1">
            <Pill className="h-3.5 w-3.5 text-emerald-500" /> Med Compliance
          </span>
          <div className="space-y-2 bg-slate-950 p-3.5 rounded-xl border border-slate-950/60 text-xs">
            <div className="flex justify-between items-baseline">
              <span className="text-slate-400">Adherence Score</span>
              <span className="text-sm font-extrabold text-white">{adherenceRate}%</span>
            </div>
            <div className="flex justify-between border-t border-slate-900 pt-2 text-[10px]">
              <span className="text-slate-400">Missed Doses</span>
              <span className={`font-bold ${missedDosesCount > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                {missedDosesCount} this month
              </span>
            </div>
          </div>
        </div>

        {/* Action / Flag summary */}
        <div className="space-y-3">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" /> Focus Items
          </span>
          <div className="p-3 bg-indigo-950/15 border border-indigo-900/30 rounded-xl text-xs space-y-1.5">
            <span className="block font-bold text-indigo-400 flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 stroke-[2.5]" /> Suggestion
            </span>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {isStable
                ? `Patient is stable. Maintain current dosage of Lisinopril and review targets in 30 days.`
                : `Vitals trend shows elevation. Review dosage limits, medication schedule, and check DASH sodium compliance.`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
