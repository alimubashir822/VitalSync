'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X, LogOut, Shield, Heart, Users, ChartBar, Activity } from 'lucide-react';
import { logoutAction } from '@/app/actions/auth';

interface MenuLink {
  label: string;
  href: string;
  type: 'PATIENT' | 'DOCTOR' | 'CARE_TEAM' | 'ADMIN';
}

interface MobileMenuProps {
  userName: string;
  userEmail: string;
  role: 'PATIENT' | 'DOCTOR' | 'CARE_TEAM' | 'ADMIN';
  links: MenuLink[];
}

export default function MobileMenu({ userName, userEmail, role, links }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const getThemeDetails = () => {
    switch (role) {
      case 'PATIENT':
        return {
          bgClass: 'bg-emerald-500',
          badgeText: 'AI',
          badgeClass: 'text-emerald-400 bg-emerald-950 border-emerald-800',
          iconColor: 'text-emerald-400',
        };
      case 'DOCTOR':
        return {
          bgClass: 'bg-indigo-600',
          badgeText: 'MD',
          badgeClass: 'text-indigo-400 bg-indigo-950 border-indigo-850',
          iconColor: 'text-indigo-400',
        };
      case 'CARE_TEAM':
        return {
          bgClass: 'bg-amber-500',
          badgeText: 'RN',
          badgeClass: 'text-amber-400 bg-amber-950 border-amber-800',
          iconColor: 'text-amber-400',
        };
      default:
        return {
          bgClass: 'bg-purple-600',
          badgeText: 'SYS',
          badgeClass: 'text-purple-400 bg-purple-950 border-purple-800',
          iconColor: 'text-purple-400',
        };
    }
  };

  const theme = getThemeDetails();

  return (
    <div className="md:hidden w-full bg-slate-900 border-b border-slate-800 shrink-0 sticky top-0 z-50">
      {/* Compact Top Header */}
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`h-8 w-8 rounded-lg ${theme.bgClass} flex items-center justify-center shadow-md`}>
            <Activity className="h-5 w-5 text-slate-950" />
          </div>
          <span className="font-bold text-base text-white">
            VitalSync <span className={`text-[10px] font-semibold px-1 rounded border ${theme.badgeClass}`}>{theme.badgeText}</span>
          </span>
        </div>

        {/* Hamburger Toggler */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-white transition-all focus:outline-none"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Slide-down Drawer Panel */}
      {isOpen && (
        <div className="border-t border-slate-800/80 bg-slate-950/95 backdrop-blur-xl px-6 py-6 space-y-6 absolute top-full left-0 right-0 shadow-2xl border-b border-slate-800 max-h-[calc(100vh-68px)] overflow-y-auto">
          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {links.map((link) => {
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all border ${
                    role === 'PATIENT' ? 'text-emerald-400 bg-emerald-950/10 border-emerald-900/20' :
                    role === 'DOCTOR' ? 'text-indigo-400 bg-indigo-950/10 border-indigo-900/20' :
                    role === 'CARE_TEAM' ? 'text-amber-400 bg-amber-950/10 border-amber-900/20' :
                    'text-purple-400 bg-purple-950/10 border-purple-900/20'
                  }`}
                >
                  {role === 'PATIENT' && <Heart className="h-4 w-4" />}
                  {role === 'DOCTOR' && <Users className="h-4 w-4" />}
                  {role === 'CARE_TEAM' && <Users className="h-4 w-4" />}
                  {role === 'ADMIN' && <ChartBar className="h-4 w-4" />}
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* User Status Card */}
          <div className="p-4 bg-slate-900 rounded-xl border border-slate-850 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 text-sm font-bold">
                {userName.charAt(0)}
              </div>
              <div className="min-w-0">
                <span className="block text-sm font-semibold text-white truncate">{userName}</span>
                <span className="block text-[10px] text-slate-500 truncate">{userEmail}</span>
              </div>
            </div>

            {/* Logout Trigger */}
            <form action={logoutAction} onSubmit={() => setIsOpen(false)}>
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-slate-950 hover:bg-rose-950/20 border border-slate-800 hover:border-rose-900/40 text-xs text-slate-400 hover:text-rose-400 transition-all font-semibold"
              >
                <LogOut className="h-4 w-4" />
                Log Out
              </button>
            </form>
          </div>

          <div className="flex flex-col items-center gap-1 justify-center text-[10px] text-slate-600">
            <div className="flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-emerald-500" />
              Secured HIPAA Session Connection
            </div>
            <span className="block mt-1">
              Healthcare system by <a href="https://www.medclinicx.com/" target="_blank" rel="noopener noreferrer" className="hover:text-slate-400 underline">Med Clinic X</a>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
