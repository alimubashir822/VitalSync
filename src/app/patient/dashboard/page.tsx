import React from 'react';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import VitalsChart from '@/components/VitalsChart';
import VitalLogForm from '@/components/VitalLogForm';
import MedicationTracker from '@/components/MedicationTracker';
import AiPatientAssistant from '@/components/AiPatientAssistant';
import DigitalCareJourney from '@/components/DigitalCareJourney';
import VoiceAssistantSimulator from '@/components/VoiceAssistantSimulator';
import { Heart, Activity, Thermometer, ShieldAlert, Sparkles, Plus, Check, ClipboardList, Footprints, Moon, Droplets } from 'lucide-react';

export default async function PatientDashboardPage() {
  const session = await getSession();

  if (!session || !session.patientId) {
    redirect('/login');
  }

  // 1. Fetch Patient profile & medications & care plans
  const patient = await prisma.patient.findUnique({
    where: { id: session.patientId },
    include: {
      user: true,
      medications: {
        where: { isActive: true },
      },
      carePlans: {
        where: { isActive: true },
        take: 1,
      },
      alerts: {
        where: { status: 'ACTIVE' },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!patient) {
    redirect('/login');
  }

  // 2. Fetch Vitals telemetry history
  const bpRecords = await prisma.bloodPressureRecord.findMany({
    where: { patientId: patient.id },
    orderBy: { timestamp: 'asc' },
    take: 15,
  });

  const glucoseRecords = await prisma.glucoseRecord.findMany({
    where: { patientId: patient.id },
    orderBy: { timestamp: 'asc' },
    take: 15,
  });

  const hrRecords = await prisma.heartRateRecord.findMany({
    where: { patientId: patient.id },
    orderBy: { timestamp: 'asc' },
    take: 15,
  });

  // Latest Vitals
  const latestBP = bpRecords[bpRecords.length - 1];
  const latestGlucose = glucoseRecords[glucoseRecords.length - 1];
  const latestHR = hrRecords[hrRecords.length - 1];

  // AI Health Summary logic
  let aiSummary = 'Your readings are stable today.';
  let aiSummaryColor = 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5';
  const activeAlerts = patient.alerts;

  if (activeAlerts.length > 0) {
    const critical = activeAlerts.some((a) => a.severity === 'CRITICAL');
    if (critical) {
      aiSummary = `Critical Health Summary: Abnormal reading detected recently (${activeAlerts[0].type}). Please review the care plan instructions and contact support.`;
      aiSummaryColor = 'text-rose-400 border-rose-500/20 bg-rose-500/5';
    } else {
      aiSummary = 'Health Summary Warning: Vitals indicate slight elevations. Ensure you are taking medications on schedule.';
      aiSummaryColor = 'text-amber-400 border-amber-500/20 bg-amber-500/5';
    }
  }

  // Formatting helper
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const chartBP = bpRecords.map((r) => ({
    date: formatDate(r.timestamp),
    systolic: r.systolic,
    diastolic: r.diastolic,
    label: `${r.systolic}/${r.diastolic}`,
  }));

  const chartGlucose = glucoseRecords.map((r) => ({
    date: formatDate(r.timestamp),
    value: r.value,
    label: `${r.value} mg/dL`,
  }));

  const chartHR = hrRecords.map((r) => ({
    date: formatDate(r.timestamp),
    value: r.bpm,
    label: `${r.bpm} BPM`,
  }));

  // Map database meds to format required by component
  const componentMeds = patient.medications.map((m) => ({
    id: m.id,
    name: m.name,
    dosage: m.dosage,
    frequency: m.frequency,
    instructions: m.instructions,
    scheduleTime: m.scheduleTime,
    lastTakenAt: m.lastTakenAt ? m.lastTakenAt.toISOString() : null,
  }));

  return (
    <div className="space-y-8 max-w-7xl mx-auto w-full">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-900/40 border border-slate-900 p-6 rounded-2xl">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            Good Morning, {patient.user.name} 👋
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Primary Care Plan: <span className="font-semibold text-white">{patient.chronicConditions} Management</span>
          </p>
        </div>

        {/* Detailed Health Stability Score Display */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center bg-slate-950 p-4 rounded-xl border border-slate-850">
          <div className="flex items-center gap-3">
            <div className={`h-12 w-12 rounded-lg flex items-center justify-center font-extrabold text-lg text-slate-950 ${
              patient.riskScore >= 75 ? 'bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.3)]' :
              patient.riskScore >= 50 ? 'bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)]' :
              'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
            }`}>
              {100 - patient.riskScore}
            </div>
            <div>
              <span className="block text-xs text-slate-500 font-bold uppercase tracking-wider">Stability Score</span>
              <span className="text-xs font-semibold text-slate-300">RPM Health Index</span>
            </div>
          </div>
          <div className="border-t md:border-t-0 md:border-l border-slate-850 pt-2 md:pt-0 md:pl-4 space-y-1 text-[10px]">
            <span className="text-emerald-400 block font-medium flex items-center gap-1">
              ✓ Regular monitoring logs
            </span>
            {patient.riskScore >= 75 ? (
              <span className="text-rose-400 block font-medium flex items-center gap-1">
                ⚠ BP trend elevated
              </span>
            ) : patient.riskScore >= 50 ? (
              <span className="text-amber-400 block font-medium flex items-center gap-1">
                ⚠ Glucose variance detected
              </span>
            ) : (
              <span className="text-emerald-400 block font-medium flex items-center gap-1">
                ✓ Medications adherence stable
              </span>
            )}
          </div>
        </div>
      </div>

      {/* AI Health Summary Highlight */}
      <div className={`p-4 border rounded-xl flex items-start gap-3.5 transition-all duration-300 ${aiSummaryColor}`}>
        <div className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0 border border-current bg-white/5">
          <Sparkles className="h-4 w-4" />
        </div>
        <div className="text-sm">
          <span className="font-bold block mb-0.5">AI Insights Engine</span>
          <p className="opacity-90">{aiSummary}</p>
        </div>
      </div>

      {/* Visual Chronic Journey steppers */}
      <DigitalCareJourney condition={patient.chronicConditions} riskScore={patient.riskScore} />

      {/* Vitals Key Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Heart Rate Card */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between group">
          <div className="space-y-2">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">Heart Rate</span>
            <span className="text-3xl font-extrabold text-white flex items-baseline gap-1.5">
              {latestHR ? latestHR.bpm : '--'} <span className="text-xs text-slate-400 font-normal">BPM</span>
            </span>
            <span className="text-[10px] text-slate-400 block">
              {latestHR ? `Last log: ${formatDate(latestHR.timestamp)}` : 'No readings logged'}
            </span>
          </div>
          <div className="h-12 w-12 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center group-hover:scale-105 transition-all">
            <Heart className="h-6 w-6 fill-current animate-pulse text-purple-500" />
          </div>
        </div>

        {/* Blood Pressure Card */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between group">
          <div className="space-y-2">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">Blood Pressure</span>
            <span className="text-3xl font-extrabold text-white flex items-baseline gap-1.5">
              {latestBP ? `${latestBP.systolic}/${latestBP.diastolic}` : '--/--'}{' '}
              <span className="text-xs text-slate-400 font-normal">mmHg</span>
            </span>
            <span className="text-[10px] text-slate-400 block">
              {latestBP ? `Last log: ${formatDate(latestBP.timestamp)}` : 'No readings logged'}
            </span>
          </div>
          <div className="h-12 w-12 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center group-hover:scale-105 transition-all">
            <Activity className="h-6 w-6 text-rose-500" />
          </div>
        </div>

        {/* Glucose Card */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between group">
          <div className="space-y-2">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">Glucose Monitoring</span>
            <span className="text-3xl font-extrabold text-white flex items-baseline gap-1.5">
              {latestGlucose ? latestGlucose.value : '--'}{' '}
              <span className="text-xs text-slate-400 font-normal">mg/dL</span>
            </span>
            <span className="text-[10px] text-slate-400 block">
              {latestGlucose ? `${latestGlucose.isFasting ? 'Fasting' : 'Post-Meal'} • ${formatDate(latestGlucose.timestamp)}` : 'No readings logged'}
            </span>
          </div>
          <div className="h-12 w-12 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center group-hover:scale-105 transition-all">
            <Thermometer className="h-6 w-6 text-cyan-500" />
          </div>
        </div>
      </div>

      {/* AI Lifestyle & Wellness Coaching Indicators */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-900/20 border border-slate-900/60 p-4 rounded-xl">
        <div className="p-3 bg-slate-900/60 border border-slate-850 rounded-xl flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-orange-500/10 text-orange-400 flex items-center justify-center">
            <Footprints className="h-4.5 w-4.5" />
          </div>
          <div className="min-w-0">
            <span className="block text-[9px] text-slate-500 font-bold uppercase">Daily Steps</span>
            <span className="text-xs font-bold text-white block truncate">6,200 steps</span>
          </div>
        </div>
        <div className="p-3 bg-slate-900/60 border border-slate-850 rounded-xl flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
            <Moon className="h-4.5 w-4.5" />
          </div>
          <div className="min-w-0">
            <span className="block text-[9px] text-slate-500 font-bold uppercase">Sleep Log</span>
            <span className="text-xs font-bold text-white block truncate">7.2 hours</span>
          </div>
        </div>
        <div className="p-3 bg-slate-900/60 border border-slate-850 rounded-xl flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
            <Droplets className="h-4.5 w-4.5" />
          </div>
          <div className="min-w-0">
            <span className="block text-[9px] text-slate-500 font-bold uppercase">Hydration</span>
            <span className="text-xs font-bold text-white block truncate">6 / 8 glasses</span>
          </div>
        </div>
        <div className="p-3 bg-slate-900/60 border border-slate-850 rounded-xl flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <Check className="h-4.5 w-4.5" />
          </div>
          <div className="min-w-0">
            <span className="block text-[9px] text-slate-500 font-bold uppercase">Med Adherence</span>
            <span className="text-xs font-bold text-white block truncate">94% score</span>
          </div>
        </div>
      </div>

      {/* Main Grid content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (Charts and Logger) */}
        <div className="lg:col-span-8 space-y-8">
          {/* SVG Vitals Trend Chart */}
          <VitalsChart bpData={chartBP} glucoseData={chartGlucose} hrData={chartHR} />

          {/* Vitals Form Logger */}
          <VitalLogForm />
        </div>

        {/* Right Column (Meds, AI, Actions) */}
        <div className="lg:col-span-4 space-y-8">
          {/* Active Alerts warning box if any */}
          {activeAlerts.length > 0 && (
            <div className="p-4 rounded-2xl border border-rose-900/50 bg-rose-950/20 text-rose-300 space-y-2">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-rose-500 animate-bounce" />
                <span className="font-bold text-sm">Active Clinical Alert Triggered</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {activeAlerts[0].message}
              </p>
            </div>
          )}

          {/* Voice check-in simulator */}
          <VoiceAssistantSimulator />

          {/* Medication Compliance checklist */}
          <MedicationTracker medications={componentMeds} />

          {/* AI Clinical chatbot assistant */}
          <AiPatientAssistant />

          {/* Care plan objectives list */}
          {patient.carePlans.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ClipboardList className="h-4.5 w-4.5 text-emerald-400" />
                Active Care Instructions
              </h3>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-950/60 text-xs text-slate-400 space-y-2 leading-relaxed">
                <span className="block font-bold text-slate-200 text-sm">
                  {patient.carePlans[0].title}
                </span>
                <span className="block italic text-emerald-400">
                  Goal: {patient.carePlans[0].goal}
                </span>
                <p className="whitespace-pre-line border-t border-slate-800/80 pt-2 mt-2">
                  {patient.carePlans[0].instructions}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
