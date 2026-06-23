'use client';

import React, { useState } from 'react';
import { Calendar, Activity, TrendingUp } from 'lucide-react';

interface ChartDataPoint {
  date: string;
  value: number; // For BP, we can map systolic, or we can take value
  value2?: number; // For BP diastolic
  label: string;
}

interface VitalsChartProps {
  bpData: { date: string; systolic: number; diastolic: number; label: string }[];
  glucoseData: { date: string; value: number; label: string }[];
  hrData: { date: string; value: number; label: string }[];
}

export default function VitalsChart({ bpData, glucoseData, hrData }: VitalsChartProps) {
  const [activeTab, setActiveTab] = useState<'BP' | 'GLUCOSE' | 'HR'>('BP');

  // Helper to build SVG paths
  const renderLineChart = (points: { x: number; y: number }[], height: number) => {
    if (points.length === 0) return '';
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      // Draw bezier curves instead of straight lines for a premium, smooth look
      const cpX1 = points[i - 1].x + (points[i].x - points[i - 1].x) / 2;
      const cpY1 = points[i - 1].y;
      const cpX2 = points[i - 1].x + (points[i].x - points[i - 1].x) / 2;
      const cpY2 = points[i].y;
      path += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${points[i].x} ${points[i].y}`;
    }
    return path;
  };

  const getChartDetails = () => {
    let dataset: { date: string; val1: number; val2?: number; label: string }[] = [];
    let title = '';
    let unit = '';
    let strokeColor1 = '#10b981'; // emerald
    let strokeColor2 = '#6366f1'; // indigo
    let fillColor1 = 'rgba(16, 185, 129, 0.05)';
    let fillColor2 = 'rgba(99, 102, 241, 0.05)';

    if (activeTab === 'BP') {
      dataset = bpData.map((d) => ({ date: d.date, val1: d.systolic, val2: d.diastolic, label: d.label }));
      title = 'Blood Pressure Trend';
      unit = 'mmHg';
      strokeColor1 = '#f43f5e'; // rose-500 for systolic
      strokeColor2 = '#3b82f6'; // blue-500 for diastolic
    } else if (activeTab === 'GLUCOSE') {
      dataset = glucoseData.map((d) => ({ date: d.date, val1: d.value, label: d.label }));
      title = 'Glucose Levels';
      unit = 'mg/dL';
      strokeColor1 = '#06b6d4'; // cyan
    } else {
      dataset = hrData.map((d) => ({ date: d.date, val1: d.value, label: d.label }));
      title = 'Heart Rate';
      unit = 'BPM';
      strokeColor1 = '#a855f7'; // purple
    }

    if (dataset.length === 0) {
      return { dataset, title, unit, svgElements: null };
    }

    // Geometry parameters
    const svgWidth = 600;
    const svgHeight = 220;
    const padding = 30;

    const xMin = padding;
    const xMax = svgWidth - padding;
    const yMin = padding;
    const yMax = svgHeight - padding;

    // Find min and max values to scale
    const allValues = dataset.flatMap((d) => [d.val1, d.val2].filter((v) => v !== undefined) as number[]);
    const maxVal = Math.max(...allValues, 100) * 1.1; // pad max
    const minVal = Math.max(0, Math.min(...allValues, 60) * 0.9); // pad min

    const getX = (index: number) => {
      if (dataset.length <= 1) return xMin + (xMax - xMin) / 2;
      return xMin + (index / (dataset.length - 1)) * (xMax - xMin);
    };

    const getY = (val: number) => {
      return yMax - ((val - minVal) / (maxVal - minVal)) * (yMax - yMin);
    };

    const points1 = dataset.map((d, i) => ({ x: getX(i), y: getY(d.val1) }));
    const points2 = dataset.filter((d) => d.val2 !== undefined).map((d, i) => ({ x: getX(i), y: getY(d.val2!) }));

    const path1 = renderLineChart(points1, svgHeight);
    const path2 = points2.length > 0 ? renderLineChart(points2, svgHeight) : '';

    // Area Fills
    const fillPath1 = path1 ? `${path1} L ${points1[points1.length - 1].x} ${yMax} L ${points1[0].x} ${yMax} Z` : '';
    const fillPath2 = path2 ? `${path2} L ${points2[points2.length - 1].x} ${yMax} L ${points2[0].x} ${yMax} Z` : '';

    return {
      dataset,
      title,
      unit,
      svgElements: (
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-full">
          {/* Gradients */}
          <defs>
            <linearGradient id="area-grad-1" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={strokeColor1} stopOpacity="0.2"/>
              <stop offset="100%" stopColor={strokeColor1} stopOpacity="0.0"/>
            </linearGradient>
            <linearGradient id="area-grad-2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={strokeColor2} stopOpacity="0.15"/>
              <stop offset="100%" stopColor={strokeColor2} stopOpacity="0.0"/>
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0.25, 0.5, 0.75, 1.0].map((ratio, idx) => {
            const y = yMax - ratio * (yMax - yMin);
            const labelValue = Math.round(minVal + ratio * (maxVal - minVal));
            return (
              <g key={idx} className="opacity-20">
                <line x1={xMin} y1={y} x2={xMax} y2={y} stroke="#64748b" strokeWidth="1" strokeDasharray="3,3" />
                <text x={xMin - 5} y={y + 4} fill="#94a3b8" fontSize="12" fontWeight="bold" textAnchor="end">{labelValue}</text>
              </g>
            );
          })}

          {/* X axis labels */}
          {dataset.map((d, i) => {
            if (dataset.length > 8 && i % 2 !== 0) return null; // reduce label clutter
            return (
              <text key={i} x={getX(i)} y={yMax + 18} fill="#64748b" fontSize="11" fontWeight="bold" textAnchor="middle" className="opacity-80">
                {d.date}
              </text>
            );
          })}

          {/* Area under curves */}
          {fillPath2 && <path d={fillPath2} fill="url(#area-grad-2)" />}
          {fillPath1 && <path d={fillPath1} fill="url(#area-grad-1)" />}

          {/* Lines */}
          {path2 && <path d={path2} fill="none" stroke={strokeColor2} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-[0_2px_8px_rgba(59,130,246,0.3)]" />}
          {path1 && <path d={path1} fill="none" stroke={strokeColor1} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-[0_2px_8px_rgba(16,185,129,0.3)]" />}

          {/* Data Nodes */}
          {points2.map((p, i) => (
            <circle key={`node2-${i}`} cx={p.x} cy={p.y} r="4" fill="#0f172a" stroke={strokeColor2} strokeWidth="2.5" />
          ))}
          {points1.map((p, i) => (
            <circle key={`node1-${i}`} cx={p.x} cy={p.y} r="4" fill="#0f172a" stroke={strokeColor1} strokeWidth="2.5" />
          ))}
        </svg>
      ),
    };
  };

  const chartDetails = getChartDetails();

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
        <div>
          <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">Telemetry History</span>
          <h3 className="text-lg font-bold text-white flex items-center gap-2 mt-1">
            <TrendingUp className="h-5 w-5 text-emerald-400" />
            {chartDetails.title}
          </h3>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
          {(['BP', 'GLUCOSE', 'HR'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                activeTab === tab
                  ? 'bg-slate-800 text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {tab === 'BP' ? 'Blood Pressure' : tab === 'GLUCOSE' ? 'Glucose' : 'Heart Rate'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Chart SVG Plot */}
      <div className="relative h-[240px] flex items-center justify-center">
        {chartDetails.dataset.length === 0 ? (
          <div className="text-center space-y-2">
            <Activity className="h-8 w-8 text-slate-700 mx-auto animate-pulse" />
            <p className="text-sm text-slate-500">No diagnostic logs found for this vital metric.</p>
          </div>
        ) : (
          <div className="w-full h-full pr-4">{chartDetails.svgElements}</div>
        )}
      </div>

      {/* Legend & Details */}
      {chartDetails.dataset.length > 0 && (
        <div className="flex flex-wrap gap-6 text-xs text-slate-400 bg-slate-950/40 p-4 rounded-xl border border-slate-950">
          {activeTab === 'BP' ? (
            <>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-rose-500" />
                <span>Systolic (Target &lt; 130 mmHg)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-blue-500" />
                <span>Diastolic (Target &lt; 80 mmHg)</span>
              </div>
            </>
          ) : activeTab === 'GLUCOSE' ? (
            <>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-cyan-500" />
                <span>Glucose Levels (Fasting: 80 - 130 mg/dL)</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-purple-500" />
                <span>Heart Rate (Normal resting: 60 - 100 BPM)</span>
              </div>
            </>
          )}
          <div className="ml-auto flex items-center gap-1.5 text-slate-500">
            <Calendar className="h-3.5 w-3.5" />
            <span>Last 30 Days</span>
          </div>
        </div>
      )}
    </div>
  );
}
