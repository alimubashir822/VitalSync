'use client';

import React, { useState } from 'react';
import { Mic, MicOff, Volume2, HelpCircle } from 'lucide-react';

const SIMULATION_SCRIPTS = [
  {
    cmd: "Log my blood pressure reading",
    voiceResponse: "Setting Omron monitor link. Please log your systolic and diastolic levels in the telemetry panel.",
    targetForm: "BP",
  },
  {
    cmd: "Log my daily glucose",
    voiceResponse: "Insulin logger active. Please enter your fasting blood sugar value in the glucose logger tab.",
    targetForm: "GLUCOSE",
  },
  {
    cmd: "What is my next medication dose?",
    voiceResponse: "Your next dose is Lisinopril 10mg scheduled at 8:00 PM. Please take with a full glass of water.",
    targetForm: "MED",
  },
];

export default function VoiceAssistantSimulator() {
  const [isRecording, setIsRecording] = useState(false);
  const [scriptIdx, setScriptIdx] = useState<number | null>(null);
  const [audioPlayed, setAudioPlayed] = useState(false);

  const startSimulation = (idx: number) => {
    setIsRecording(true);
    setScriptIdx(idx);
    setAudioPlayed(false);

    // Simulate speech-to-text delay
    setTimeout(() => {
      setIsRecording(false);
      setAudioPlayed(true);

      // Speak if browser supports SpeechSynthesis
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(SIMULATION_SCRIPTS[idx].voiceResponse);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
      }
    }, 1800);
  };

  const resetAssistant = () => {
    setIsRecording(false);
    setScriptIdx(null);
    setAudioPlayed(false);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Volume2 className="h-4.5 w-4.5 text-indigo-400" />
          Elderly Voice Check-in
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Click any common command to simulate hands-free telemetry logs and schedules check-in.
        </p>
      </div>

      {/* Mic Status Widget */}
      <div className="flex flex-col items-center justify-center p-6 bg-slate-950/80 rounded-xl border border-slate-950/60 relative overflow-hidden">
        {/* Waveform Animation */}
        {isRecording && (
          <div className="absolute inset-0 flex items-center justify-center gap-1 opacity-20 pointer-events-none">
            {[1, 2, 3, 4, 5, 4, 3, 2, 1].map((h, i) => (
              <span
                key={i}
                style={{ height: `${h * 12}px` }}
                className="w-1.5 bg-indigo-500 rounded-full animate-bounce"
              />
            ))}
          </div>
        )}

        <button
          onClick={() => scriptIdx === null && startSimulation(0)}
          className={`h-16 w-16 rounded-full flex items-center justify-center border transition-all ${
            isRecording ? 'bg-rose-500 border-rose-400 animate-pulse text-slate-950' :
            scriptIdx !== null ? 'bg-indigo-600 border-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.3)]' :
            'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 shadow-inner'
          }`}
        >
          {isRecording ? (
            <Mic className="h-7 w-7 stroke-[2.5]" />
          ) : (
            <Mic className="h-7 w-7" />
          )}
        </button>

        <span className="block text-xs font-bold uppercase tracking-wider text-slate-500 mt-4 text-center">
          {isRecording ? 'Listening for speech...' :
           scriptIdx !== null ? 'Voice Assistant Active' :
           'Tap a command to speak'}
        </span>
      </div>

      {/* Script Options */}
      {scriptIdx === null ? (
        <div className="space-y-2">
          {SIMULATION_SCRIPTS.map((script, idx) => (
            <button
              key={idx}
              onClick={() => startSimulation(idx)}
              className="w-full p-2.5 rounded-lg border border-slate-950 bg-slate-950/40 hover:bg-slate-950/80 hover:border-slate-800 text-left text-xs text-slate-400 hover:text-white transition-all flex items-center justify-between group"
            >
              <span>Speak: &quot;{script.cmd}&quot;</span>
              <Mic className="h-3 w-3 text-slate-600 group-hover:text-emerald-400" />
            </button>
          ))}
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-950 space-y-3 text-xs leading-relaxed">
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase block">Spoken Command</span>
            <p className="text-white font-medium italic mt-0.5">&quot;{SIMULATION_SCRIPTS[scriptIdx].cmd}&quot;</p>
          </div>
          <div className="border-t border-slate-900 pt-3">
            <span className="text-[10px] text-indigo-400 font-bold uppercase block flex items-center gap-1.5">
              <Volume2 className="h-3.5 w-3.5" /> VitalSync Voice Response
            </span>
            <p className="text-slate-400 mt-1">{SIMULATION_SCRIPTS[scriptIdx].voiceResponse}</p>
          </div>
          <div className="pt-2 flex justify-end">
            <button
              onClick={resetAssistant}
              className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-850 border border-slate-800 text-[10px] text-slate-400 font-bold"
            >
              Reset Assistant
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
