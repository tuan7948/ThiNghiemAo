import React from 'react';
import { AlertTriangle, ShieldX, X, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { SafetyAlert } from '../types.ts';

interface SafetyBannerProps {
  alerts: SafetyAlert[];
  onDismiss: (id: string) => void;
}

export const SafetyBanner: React.FC<SafetyBannerProps> = ({ alerts, onDismiss }) => {
  if (alerts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full px-4 sm:px-0">
      {alerts.map((alert) => {
        const isDanger = alert.type === 'danger';
        const isWarning = alert.type === 'warning';

        return (
          <div
            key={alert.id}
            className={`p-3.5 rounded-xl shadow-2xl border flex items-start gap-3 backdrop-blur-md transition-all animate-in slide-in-from-bottom-5 duration-300 ${
              isDanger
                ? 'bg-red-950/90 border-red-500/80 text-red-100 shadow-red-950/50'
                : isWarning
                ? 'bg-amber-950/90 border-amber-500/80 text-amber-100 shadow-amber-950/50'
                : 'bg-slate-900/90 border-slate-700 text-slate-100'
            }`}
          >
            <div className={`p-2 rounded-lg shrink-0 ${
              isDanger ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
            }`}>
              {isDanger ? <ShieldX className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            </div>

            <div className="flex-1 text-xs">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm tracking-tight">{alert.title}</h4>
                <span className="text-[10px] opacity-70 font-mono">{alert.time}</span>
              </div>
              <p className="mt-1 leading-relaxed opacity-90">{alert.message}</p>
              {alert.ruleCode && (
                <div className="mt-2 text-[10px] font-mono bg-black/30 px-2 py-0.5 rounded inline-block">
                  Quy tắc an toàn: {alert.ruleCode}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => onDismiss(alert.id)}
              className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
