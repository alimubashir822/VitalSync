'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, Heart, Activity, Thermometer, ShieldAlert, CheckCircle, ChevronRight, User } from 'lucide-react';

interface PatientItem {
  id: string;
  name: string;
  email: string;
  dateOfBirth: string;
  chronicConditions: string;
  riskScore: number;
  latestBP?: string;
  latestGlucose?: string;
  latestHR?: string;
  activeAlertsCount: number;
}

interface ClinicalPatientListProps {
  patients: PatientItem[];
  portal: 'doctor' | 'care-team';
}

export default function ClinicalPatientList({ patients, portal }: ClinicalPatientListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCondition, setSelectedCondition] = useState<string>('ALL');
  const [selectedTriage, setSelectedTriage] = useState<string>('ALL');

  // Helper to determine patient triage classification
  const getTriageClass = (score: number, alertsCount: number) => {
    if (score >= 75 || alertsCount > 0) return 'HIGH';
    if (score >= 50) return 'REVIEW';
    return 'STABLE';
  };

  const filteredPatients = patients.filter((patient) => {
    const matchesSearch =
      patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCondition =
      selectedCondition === 'ALL' ||
      patient.chronicConditions.toLowerCase().includes(selectedCondition.toLowerCase());

    const triage = getTriageClass(patient.riskScore, patient.activeAlertsCount);
    const matchesTriage =
      selectedTriage === 'ALL' ||
      (selectedTriage === 'HIGH' && triage === 'HIGH') ||
      (selectedTriage === 'REVIEW' && triage === 'REVIEW') ||
      (selectedTriage === 'STABLE' && triage === 'STABLE');

    return matchesSearch && matchesCondition && matchesTriage;
  });

  return (
    <div className="space-y-6">
      {/* Search and Filters Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-slate-900 border border-slate-800 p-4 rounded-xl items-center">
        {/* Search Input */}
        <div className="md:col-span-6 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search patients by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 focus:border-indigo-500 text-white placeholder-slate-700 text-xs outline-none transition-colors"
          />
        </div>

        {/* Condition Filter */}
        <div className="md:col-span-3">
          <select
            value={selectedCondition}
            onChange={(e) => setSelectedCondition(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg bg-slate-950 border border-slate-800 focus:border-indigo-500 text-white text-xs outline-none"
          >
            <option value="ALL">All Conditions</option>
            <option value="Hypertension">Hypertension</option>
            <option value="Diabetes">Diabetes</option>
            <option value="Cardiac">Cardiac Care</option>
          </select>
        </div>

        {/* Triage Status Filter */}
        <div className="md:col-span-3">
          <select
            value={selectedTriage}
            onChange={(e) => setSelectedTriage(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg bg-slate-950 border border-slate-800 focus:border-indigo-500 text-white text-xs outline-none"
          >
            <option value="ALL">All Triage States</option>
            <option value="HIGH">High Attention</option>
            <option value="REVIEW">Needs Review</option>
            <option value="STABLE">Stable</option>
          </select>
        </div>
      </div>

      {/* Grid of Patients */}
      {filteredPatients.length === 0 ? (
        <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-xl">
          <User className="h-10 w-10 text-slate-700 mx-auto mb-3" />
          <p className="text-sm text-slate-400">No patient records match the active filter criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPatients.map((patient) => {
            const triage = getTriageClass(patient.riskScore, patient.activeAlertsCount);

            return (
              <Link
                key={patient.id}
                href={`/${portal}/patients/${patient.id}`}
                className="p-5 rounded-2xl border bg-slate-900 border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4 group text-left"
              >
                {/* Upper Details */}
                <div className="flex justify-between items-start gap-4">
                  <div className="min-w-0">
                    <span className="text-xs text-slate-500 block">DOB: {patient.dateOfBirth}</span>
                    <h4 className="font-bold text-white group-hover:text-indigo-400 transition-colors truncate mt-0.5">
                      {patient.name}
                    </h4>
                    <span className="inline-block text-[10px] text-slate-400 mt-1 bg-slate-950 px-2 py-0.5 rounded border border-slate-850">
                      {patient.chronicConditions}
                    </span>
                  </div>

                  {/* Triage Badge */}
                  <div className="text-right flex flex-col items-end shrink-0 gap-1.5">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      triage === 'HIGH' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                      triage === 'REVIEW' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                      'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}>
                      {triage === 'HIGH' ? 'High Risk' : triage === 'REVIEW' ? 'Needs Review' : 'Stable'}
                    </span>
                    <span className="text-xs text-slate-400">Score: {patient.riskScore}</span>
                  </div>
                </div>

                {/* Latest Telemetry Stats */}
                <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded-lg bg-slate-950 border border-slate-950/60 text-xs text-slate-500">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-600 font-bold uppercase flex items-center gap-1">
                      <Activity className="h-3 w-3 text-rose-500" /> BP
                    </span>
                    <span className="font-semibold text-slate-300 mt-1 truncate">
                      {patient.latestBP || '--/--'}
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-600 font-bold uppercase flex items-center gap-1">
                      <Thermometer className="h-3 w-3 text-cyan-500" /> Gluc
                    </span>
                    <span className="font-semibold text-slate-300 mt-1 truncate">
                      {patient.latestGlucose ? `${patient.latestGlucose} mg/dL` : '---'}
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-600 font-bold uppercase flex items-center gap-1">
                      <Heart className="h-3 w-3 text-purple-500" /> HR
                    </span>
                    <span className="font-semibold text-slate-300 mt-1 truncate">
                      {patient.latestHR ? `${patient.latestHR} BPM` : '---'}
                    </span>
                  </div>
                </div>

                {/* Footer status / Alerts */}
                <div className="flex justify-between items-center text-xs border-t border-slate-800/80 pt-3">
                  <div className="flex items-center gap-1 text-slate-400">
                    {patient.activeAlertsCount > 0 ? (
                      <>
                        <ShieldAlert className="h-4 w-4 text-rose-500 animate-pulse" />
                        <span className="text-rose-400 font-bold">{patient.activeAlertsCount} Active Alerts</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 text-emerald-400" />
                        <span className="text-emerald-400 font-medium">Compliance Stable</span>
                      </>
                    )}
                  </div>

                  <span className="text-[10px] text-slate-500 flex items-center gap-0.5 group-hover:text-indigo-400 transition-colors">
                    View Profile <ChevronRight className="h-3 w-3 transform group-hover:translate-x-0.5 transition-all" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
