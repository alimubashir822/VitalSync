import React from 'react';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { ShieldCheck, Database, FileSpreadsheet, Lock, Activity, Users, Clock } from 'lucide-react';

export default async function AdminDashboardPage() {
  const session = await getSession();

  if (!session || session.role !== 'ADMIN') {
    redirect('/login');
  }

  // 1. Fetch statistics
  const totalPatients = await prisma.patient.count();
  const totalProviders = await prisma.provider.count();
  const totalAlerts = await prisma.alert.count({ where: { status: 'ACTIVE' } });

  const stablePatients = await prisma.patient.count({
    where: { riskScore: { lt: 50 } },
  });
  const highRiskPatients = await prisma.patient.count({
    where: { riskScore: { gte: 75 } },
  });

  const stablePercent = totalPatients > 0 ? Math.round((stablePatients / totalPatients) * 100) : 100;
  const highRiskPercent = totalPatients > 0 ? Math.round((highRiskPatients / totalPatients) * 100) : 0;
  const reviewPercent = 100 - stablePercent - highRiskPercent;

  // 2. Fetch Audit Logs
  const auditLogs = await prisma.auditLog.findMany({
    include: {
      user: true,
    },
    orderBy: {
      timestamp: 'desc',
    },
    take: 20,
  });

  // SVG parameters for Risk Distribution chart
  const barWidth = 60;
  const chartHeight = 160;
  const maxValue = Math.max(stablePatients, highRiskPatients, totalPatients - stablePatients - highRiskPatients, 1);
  const getBarHeight = (val: number) => (val / maxValue) * (chartHeight - 20);

  return (
    <div className="space-y-8 max-w-7xl mx-auto w-full">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            System Administration & Audit Logs
          </h1>
          <p className="text-slate-400 text-sm">
            Operational status: <span className="text-emerald-400 font-semibold">Online & HIPAA Compliant</span>
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-850">
          <ShieldCheck className="h-4 w-4 text-purple-500" />
          Platform Security Center
        </div>
      </div>

      {/* Population Health stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">Monitor Population</span>
          <span className="text-3xl font-extrabold text-white block">{totalPatients}</span>
          <span className="text-[10px] text-slate-400 block">Total Active Chronic Cases</span>
        </div>

        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">Stable Cases</span>
          <span className="text-3xl font-extrabold text-emerald-400 block">{stablePercent}%</span>
          <span className="text-[10px] text-slate-400 block">{stablePatients} Patients • Target Scope</span>
        </div>

        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">High Risk Cases</span>
          <span className="text-3xl font-extrabold text-rose-400 block">{highRiskPercent}%</span>
          <span className="text-[10px] text-slate-400 block">{highRiskPatients} Patients • Active Triage</span>
        </div>

        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">Staff Allocation</span>
          <span className="text-3xl font-extrabold text-indigo-400 block">{totalProviders}</span>
          <span className="text-[10px] text-slate-400 block">MDs & Care Coordinators</span>
        </div>
      </div>

      {/* Main Grid content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Audit logs table (col-span-8) */}
        <div className="lg:col-span-8 space-y-4">
          <div>
            <h2 className="text-lg font-bold text-white">HIPAA Security Audit Logs</h2>
            <p className="text-xs text-slate-400 mt-1">Real-time user authorization access and clinical action tracking records.</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-bold">
                    <th className="p-4">Timestamp</th>
                    <th className="p-4">User</th>
                    <th className="p-4">Action</th>
                    <th className="p-4">Target Resource</th>
                    <th className="p-4">Detail</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-850/30 transition-colors text-slate-300">
                      <td className="p-4 whitespace-nowrap text-slate-500 font-mono">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="p-4">
                        <span className="font-semibold text-white block">{log.user?.name || 'System'}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{log.user?.role || 'SYSTEM'}</span>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px] font-bold text-slate-400">
                          {log.action}
                        </span>
                      </td>
                      <td className="p-4 font-mono text-slate-400">{log.resource}</td>
                      <td className="p-4 text-slate-400">{log.details || 'N/A'}</td>
                    </tr>
                  ))}
                  {auditLogs.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-500">
                        No security logs generated.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Population graphs (col-span-4) */}
        <div className="lg:col-span-4 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-white">Population Demographics</h2>
            <p className="text-xs text-slate-400 mt-1">Health stability segment distribution across clinic caseloads.</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Stability Case Triage</h3>

            {/* Custom SVG Bar Chart */}
            <div className="h-[200px] flex items-end justify-around border-b border-slate-800 pb-4 relative">
              {/* Stable Bar */}
              <div className="flex flex-col items-center gap-2">
                <span className="text-xs font-bold text-emerald-400">{stablePatients}</span>
                <div
                  style={{ height: `${getBarHeight(stablePatients)}px` }}
                  className="w-12 bg-emerald-500 rounded-t-lg shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                />
                <span className="text-[10px] text-slate-500 font-bold uppercase">Stable</span>
              </div>

              {/* Review Bar */}
              <div className="flex flex-col items-center gap-2">
                <span className="text-xs font-bold text-amber-400">
                  {totalPatients - stablePatients - highRiskPatients}
                </span>
                <div
                  style={{ height: `${getBarHeight(totalPatients - stablePatients - highRiskPatients)}px` }}
                  className="w-12 bg-amber-500 rounded-t-lg shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                />
                <span className="text-[10px] text-slate-500 font-bold uppercase">Review</span>
              </div>

              {/* High Risk Bar */}
              <div className="flex flex-col items-center gap-2">
                <span className="text-xs font-bold text-rose-400">{highRiskPatients}</span>
                <div
                  style={{ height: `${getBarHeight(highRiskPatients)}px` }}
                  className="w-12 bg-rose-500 rounded-t-lg shadow-[0_0_15px_rgba(244,63,94,0.2)] animate-pulse"
                />
                <span className="text-[10px] text-slate-500 font-bold uppercase">High Risk</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-950/60 text-xs text-slate-400 leading-relaxed space-y-2">
              <span className="block font-bold text-slate-200">HIPAA Security Notice</span>
              <p className="text-[10px] text-slate-500">
                All patient identifiers (DOB, emergency contacts, vital records) are logged and monitored. Access logs are archived and immutable in compliance with national health privacy specifications.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
