import React from 'react';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import ClinicalPatientList from '@/components/ClinicalPatientList';
import { Activity, ShieldAlert, Heart, CheckCircle2, Star, Users } from 'lucide-react';

export default async function DoctorDashboardPage() {
  const session = await getSession();

  if (!session || session.role !== 'DOCTOR' || !session.providerId) {
    redirect('/login');
  }

  // 1. Fetch Patients assigned to this provider
  const patientsData = await prisma.patient.findMany({
    where: { primaryProviderId: session.providerId },
    include: {
      user: true,
      bloodPressureRecords: { orderBy: { timestamp: 'desc' }, take: 1 },
      glucoseRecords: { orderBy: { timestamp: 'desc' }, take: 1 },
      heartRateRecords: { orderBy: { timestamp: 'desc' }, take: 1 },
      alerts: { where: { status: 'ACTIVE' } },
    },
  });

  // Calculate Metrics
  let highAttentionCount = 0;
  let stableCount = 0;
  let reviewCount = 0;

  const formattedPatients = patientsData.map((p) => {
    const activeAlertsCount = p.alerts.length;
    const latestBP = p.bloodPressureRecords[0];
    const latestGlucose = p.glucoseRecords[0];
    const latestHR = p.heartRateRecords[0];

    // Evaluate Triage Category
    if (p.riskScore >= 75 || activeAlertsCount > 0) {
      highAttentionCount++;
    } else if (p.riskScore >= 50) {
      reviewCount++;
    } else {
      stableCount++;
    }

    return {
      id: p.id,
      name: p.user.name,
      email: p.user.email,
      dateOfBirth: p.dateOfBirth.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      chronicConditions: p.chronicConditions,
      riskScore: p.riskScore,
      latestBP: latestBP ? `${latestBP.systolic}/${latestBP.diastolic}` : undefined,
      latestGlucose: latestGlucose ? latestGlucose.value.toString() : undefined,
      latestHR: latestHR ? latestHR.bpm.toString() : undefined,
      activeAlertsCount,
    };
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto w-full">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/40 border border-slate-900 p-6 rounded-2xl">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            Welcome back, {session.name}
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Clinical Practice Dashboard • Cardiologist Specialist
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-850">
          <Star className="h-4 w-4 text-amber-400 fill-current" />
          Active Provider Portal
        </div>
      </div>

      {/* Triage Segments Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="block text-xs font-bold uppercase tracking-wider text-slate-500">Total Patients</span>
            <span className="text-3xl font-extrabold text-white">{patientsData.length}</span>
          </div>
          <div className="h-10 w-10 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl flex items-center justify-center">
            <Users className="h-5 w-5" />
          </div>
        </div>

        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="block text-xs font-bold uppercase tracking-wider text-slate-500">High Risk</span>
            <span className="text-3xl font-extrabold text-rose-400">{highAttentionCount}</span>
          </div>
          <div className="h-10 w-10 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-xl flex items-center justify-center">
            <ShieldAlert className="h-5 w-5 text-rose-500" />
          </div>
        </div>

        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="block text-xs font-bold uppercase tracking-wider text-slate-500">Needs Review</span>
            <span className="text-3xl font-extrabold text-amber-400">{reviewCount}</span>
          </div>
          <div className="h-10 w-10 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-xl flex items-center justify-center">
            <Activity className="h-5 w-5 text-amber-500" />
          </div>
        </div>

        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="block text-xs font-bold uppercase tracking-wider text-slate-500">Stable Status</span>
            <span className="text-3xl font-extrabold text-emerald-400">{stableCount}</span>
          </div>
          <div className="h-10 w-10 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl flex items-center justify-center">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          </div>
        </div>
      </div>

      {/* Patient List Title & Component */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-white">Patient Telemetry Directory</h2>
          <p className="text-xs text-slate-400 mt-1">Review live vitals and triage status indicators for your clinical roster.</p>
        </div>

        <ClinicalPatientList patients={formattedPatients} portal="doctor" />
      </div>
    </div>
  );
}
