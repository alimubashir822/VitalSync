import React from 'react';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import ClinicalPatientList from '@/components/ClinicalPatientList';
import { Activity, ShieldAlert, Heart, CheckCircle2, Star, Users, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default async function CareTeamDashboardPage() {
  const session = await getSession();

  if (!session || session.role !== 'CARE_TEAM' || !session.providerId) {
    redirect('/login');
  }

  // 1. Fetch Care Team Provider to locate orgId
  const provider = await prisma.provider.findUnique({
    where: { id: session.providerId },
    include: { org: true },
  });

  if (!provider || !provider.orgId) {
    redirect('/login');
  }

  // 2. Fetch Patients in the Organization
  const patientsData = await prisma.patient.findMany({
    where: { orgId: provider.orgId },
    include: {
      user: true,
      bloodPressureRecords: { orderBy: { timestamp: 'desc' }, take: 1 },
      glucoseRecords: { orderBy: { timestamp: 'desc' }, take: 1 },
      heartRateRecords: { orderBy: { timestamp: 'desc' }, take: 1 },
      alerts: { where: { status: 'ACTIVE' } },
    },
  });

  // 3. Fetch Active Alerts across Org
  const activeAlerts = await prisma.alert.findMany({
    where: {
      patient: { orgId: provider.orgId },
      status: 'ACTIVE',
    },
    include: {
      patient: {
        include: { user: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Formatted Patients list for ClinicalPatientList
  const formattedPatients = patientsData.map((p) => {
    const activeAlertsCount = p.alerts.length;
    const latestBP = p.bloodPressureRecords[0];
    const latestGlucose = p.glucoseRecords[0];
    const latestHR = p.heartRateRecords[0];

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
            Care Coordinator Triage Board
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Clinic: <span className="text-white font-medium">{provider.org?.name || 'VitalSync AI Medical Center'}</span>
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-850">
          <Star className="h-4 w-4 text-amber-500 fill-current" />
          Care Team Portal
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Patient List (col-span-8) */}
        <div className="lg:col-span-8 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-white">Triage Directory</h2>
            <p className="text-xs text-slate-400 mt-1">Review live vitals and triage status indicators for all clinic patients.</p>
          </div>

          <ClinicalPatientList patients={formattedPatients} portal="care-team" />
        </div>

        {/* Right Column: Active Emergency Alerts (col-span-4) */}
        <div className="lg:col-span-4 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-white">Live Alert Triage</h2>
            <p className="text-xs text-slate-400 mt-1">Emergency notifications requiring nurse or physician coordination.</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-rose-500 animate-pulse" />
              Incoming Alert Logs ({activeAlerts.length})
            </h3>

            <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
              {activeAlerts.map((alert) => (
                <Link
                  key={alert.id}
                  href={`/care-team/patients/${alert.patientId}`}
                  className={`block p-4 rounded-xl border bg-slate-950 hover:border-slate-800 transition-all text-xs space-y-2 text-left group ${
                    alert.severity === 'CRITICAL' ? 'border-rose-950/60' : 'border-amber-950/60'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white group-hover:text-indigo-400 transition-colors">
                      {alert.patient.user.name}
                    </span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                      alert.severity === 'CRITICAL' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                      'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {alert.severity}
                    </span>
                  </div>
                  <p className="text-slate-400 leading-relaxed">{alert.message}</p>
                  <div className="flex justify-between items-center text-[10px] text-slate-500 border-t border-slate-900 pt-2">
                    <span>Logged: {new Date(alert.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <span className="flex items-center gap-0.5 text-indigo-400 group-hover:underline">
                      Triage <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </Link>
              ))}

              {activeAlerts.length === 0 && (
                <div className="text-center py-8 text-slate-500 space-y-2">
                  <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto" />
                  <p className="text-xs">No active alert logs requiring triage.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
