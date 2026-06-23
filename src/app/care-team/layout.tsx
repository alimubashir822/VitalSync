import React from 'react';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Activity, LogOut, Users } from 'lucide-react';
import { logoutAction } from '@/app/actions/auth';
import MobileMenu from '@/components/MobileMenu';
import Link from 'next/link';

export default async function CareTeamLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session || session.role !== 'CARE_TEAM') {
    redirect('/login');
  }

  const menuLinks = [
    { label: 'Care Team Dashboard', href: '/care-team/dashboard', type: 'CARE_TEAM' as const },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row font-sans">
      {/* Mobile Top Navigation */}
      <MobileMenu
        userName={session.name}
        userEmail={session.email}
        role={session.role}
        links={menuLinks}
      />

      {/* Desktop Sidebar Navigation (hidden on mobile) */}
      <aside className="hidden md:flex w-64 bg-slate-900 border-r border-slate-800 flex-col justify-between shrink-0">
        <div className="p-6">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-8">
            <div className="h-8 w-8 rounded-lg bg-amber-500 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.3)]">
              <Activity className="h-5 w-5 text-slate-950" />
            </div>
            <span className="font-bold text-lg text-white">VitalSync <span className="text-amber-400 text-xs font-semibold px-1 rounded bg-amber-950 border border-amber-800">RN</span></span>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <Link
              href="/care-team/dashboard"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-amber-400 bg-slate-950 border border-amber-900/30"
            >
              <Users className="h-4 w-4" />
              Care Team Dashboard
            </Link>
          </nav>
        </div>

        {/* User Info & Logout */}
        <div className="p-6 border-t border-slate-800 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-semibold">
              {session.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <span className="block text-sm font-semibold text-white truncate">{session.name}</span>
              <span className="block text-xs text-slate-400 truncate">Care Team Staff</span>
            </div>
          </div>

          <form action={logoutAction}>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-slate-950 hover:bg-rose-950/20 border border-slate-800 hover:border-rose-900/40 text-sm text-slate-400 hover:text-rose-400 transition-all font-medium"
            >
              <LogOut className="h-4 w-4" />
              Log Out
            </button>
          </form>

          <div className="text-[10px] text-slate-500 text-center pt-2">
            Healthcare system by <a href="https://www.medclinicx.com/" target="_blank" rel="noopener noreferrer" className="hover:text-slate-300 underline font-medium text-amber-500">Med Clinic X</a>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 flex flex-col p-4 sm:p-6 md:p-10 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
