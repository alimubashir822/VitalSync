'use client';

import React from 'react';
import { Check, Clock, Calendar, ShieldAlert } from 'lucide-react';

interface MilestoneStep {
  label: string;
  status: 'COMPLETED' | 'ACTIVE' | 'PENDING';
  detail: string;
}

interface DigitalCareJourneyProps {
  condition: string;
  riskScore: number;
}

export default function DigitalCareJourney({ condition, riskScore }: DigitalCareJourneyProps) {
  // Generate milestones dynamically based on conditions
  const getMilestones = (): MilestoneStep[] => {
    const isDiabetes = condition.toLowerCase().includes('diabetes');
    const isHypertension = condition.toLowerCase().includes('hypertension');
    const isCardiac = condition.toLowerCase().includes('cardiac');

    if (isDiabetes) {
      return [
        { label: 'Dexcom CGM Synced', status: 'COMPLETED', detail: 'Telemetry link established successfully.' },
        { label: 'Glycemic Target Baseline', status: riskScore < 75 ? 'COMPLETED' : 'ACTIVE', detail: 'Glucose target level stabilized.' },
        { label: 'Dietary Carbs Protocol', status: riskScore < 50 ? 'COMPLETED' : 'ACTIVE', detail: 'Nutrition logs check-in review.' },
        { label: 'Endocrinology Follow-up', status: 'PENDING', detail: 'Scheduled in 15 days.' },
      ];
    }

    if (isHypertension) {
      return [
        { label: 'Smart BP Monitor Linked', status: 'COMPLETED', detail: 'Omron BP monitor synced.' },
        { label: 'BP Baseline Targets', status: riskScore < 70 ? 'COMPLETED' : 'ACTIVE', detail: 'Systolic under 130 mmHg achieved.' },
        { label: 'Medication Alignment', status: riskScore < 50 ? 'COMPLETED' : 'ACTIVE', detail: 'Lisinopril dosing compliance.' },
        { label: 'Cardiologist Check-in', status: 'PENDING', detail: 'Scheduled in 12 days.' },
      ];
    }

    // Default or Cardiac Care
    return [
      { label: 'Wearable ECG Synced', status: 'COMPLETED', detail: 'Apple Watch health telemetry configured.' },
      { label: 'Resting HR Stabilization', status: riskScore < 75 ? 'COMPLETED' : 'ACTIVE', detail: 'Resting rate target is 60-80 BPM.' },
      { label: 'Activity Logs Assessment', status: riskScore < 50 ? 'COMPLETED' : 'ACTIVE', detail: '30 mins daily cardio compliance.' },
      { label: 'Clinical Care Review', status: 'PENDING', detail: 'Scheduled in 14 days.' },
    ];
  };

  const steps = getMilestones();

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
      <div>
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Calendar className="h-4.5 w-4.5 text-emerald-400" />
          Chronic Care Journey Map
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Visual progress milestones for your active <span className="text-emerald-400 font-semibold">{condition}</span> protocol.
        </p>
      </div>

      {/* Stepper track */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-2 relative before:hidden md:before:block before:absolute before:top-[28px] before:left-[40px] before:right-[40px] before:h-[2px] before:bg-slate-800 z-0">
        {steps.map((step, idx) => {
          const isComp = step.status === 'COMPLETED';
          const isActive = step.status === 'ACTIVE';

          return (
            <div key={idx} className="flex md:flex-col items-start md:items-center gap-4 md:gap-3 text-left md:text-center relative z-10">
              {/* Milestone Node Pin */}
              <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 font-semibold text-xs border transition-all ${
                isComp ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]' :
                isActive ? 'bg-slate-950 text-indigo-400 border-indigo-500 animate-pulse shadow-[0_0_15px_rgba(99,102,241,0.2)]' :
                'bg-slate-950 text-slate-600 border-slate-800'
              }`}>
                {isComp ? (
                  <Check className="h-4.5 w-4.5 stroke-[3]" />
                ) : (
                  <span>{idx + 1}</span>
                )}
              </div>

              {/* Step details */}
              <div className="space-y-0.5 min-w-0">
                <span className={`block font-semibold text-xs transition-colors ${
                  isComp ? 'text-white' :
                  isActive ? 'text-indigo-400' :
                  'text-slate-500'
                }`}>
                  {step.label}
                </span>
                <p className="text-[10px] text-slate-500 leading-relaxed md:max-w-[140px] mx-auto">
                  {step.detail}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
