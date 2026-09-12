import React, { useState } from 'react';
import { 
  Activity, 
  Thermometer, 
  Gauge, 
  Wind, 
  Scale, 
  Clock, 
  TrendingUp, 
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { LabChemicalState, DataPoint } from '../types.ts';
import { MicroscopicView } from './MicroscopicView.tsx';

interface InfoPanelProps {
  state: LabChemicalState;
  historyData: DataPoint[];
  onReset: () => void;
}

export const InfoPanel: React.FC<InfoPanelProps> = ({
  state,
  historyData,
  onReset
}) => {
  const [showMicroView, setShowMicroView] = useState(true);
  const [showChart, setShowChart] = useState(true);

  // Maximum time and volume for SVG chart scaling
  const maxTime = Math.max(30, Math.ceil(state.timeElapsed / 10) * 10);
  const maxGas = 50; // mL
  const chartW = 280;
  const chartH = 110;

  // Generate SVG path for real-time gas evolution curve
  const points = historyData.map((d) => {
    const x = (d.time / maxTime) * (chartW - 40) + 30;
    const y = chartH - 20 - (Math.min(maxGas, d.gasVolume) / maxGas) * (chartH - 30);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const pathD = points.length > 0 ? `M ${points.join(' L ')}` : '';

  return (
    <aside className="w-full lg:w-96 flex flex-col gap-3.5 bg-slate-900/90 backdrop-blur-md p-4 rounded-2xl border border-slate-800 shadow-xl overflow-y-auto max-h-[85vh] lg:max-h-[calc(100vh-5rem)]">
      {/* Header & Balanced Chemical Equation */}
      <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/80 shadow-inner">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span className="font-semibold text-slate-300 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            PHƯƠNG TRÌNH HÓA HỌC (GDPT 2018)
          </span>
          <span className="text-[10px] bg-red-500/10 text-red-300 border border-red-500/20 px-1.5 py-0.5 rounded font-mono">
            Tỏa nhiệt
          </span>
        </div>

        {/* Balanced equation display */}
        <div className="text-center py-2 px-1 bg-slate-950/70 rounded-lg border border-slate-800 my-1 font-mono text-sm sm:text-base font-bold text-cyan-300 tracking-wider">
          Zn<span className="text-xs text-slate-400 font-normal">(s)</span> + 2HCl<span className="text-xs text-slate-400 font-normal">(aq)</span> ➔ ZnCl₂<span className="text-xs text-slate-400 font-normal">(aq)</span> + H₂<span className="text-xs text-slate-400 font-normal">(g)</span>↑
        </div>

        <div className="flex justify-between items-center text-[11px] text-slate-400 pt-1">
          <span>Biến thiên enthalpy chuẩn:</span>
          <span className="font-mono text-red-400 font-semibold">
            Δ<sub>r</sub>H°<sub>298</sub> = -152.4 kJ/mol
          </span>
        </div>
      </div>

      {/* Real-time telemetry dashboard */}
      <div className="grid grid-cols-2 gap-2">
        {/* Temperature gauge */}
        <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60 flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400">
            <Thermometer className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400">Nhiệt độ dung dịch</div>
            <div className="font-mono font-bold text-sm text-slate-100">
              {state.temperature.toFixed(1)} °C
            </div>
            <div className="text-[9px] text-slate-400">
              {state.isBurnerUnderTube && state.isBurnerOn ? '🔥 Đang đun nóng' : 'Phòng 25°C'}
            </div>
          </div>
        </div>

        {/* Reaction rate / Gas evolution */}
        <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60 flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
            <Gauge className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400">Tốc độ thoát khí (v)</div>
            <div className="font-mono font-bold text-sm text-cyan-300">
              {state.reactionRate > 0 ? `${(state.reactionRate * 0.08).toFixed(2)} mL/s` : '0.00 mL/s'}
            </div>
            <div className="text-[9px] text-slate-400">
              {state.bubblesPerSec > 0 ? `~${state.bubblesPerSec.toFixed(0)} bọt/giây` : 'Không có bọt'}
            </div>
          </div>
        </div>

        {/* H2 Gas collected */}
        <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60 flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
            <Wind className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400">Thể tích H₂ thu được</div>
            <div className="font-mono font-bold text-sm text-sky-300">
              {state.gasVolumeH2.toFixed(1)} mL
            </div>
            <div className="text-[9px] text-slate-400">
              {(state.gasVolumeH2 / 24790).toFixed(4)} mol H₂ (25°C, 1 bar)
            </div>
          </div>
        </div>

        {/* Remaining Zinc mass */}
        <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60 flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
            <Scale className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400">Khối lượng Zn còn lại</div>
            <div className="font-mono font-bold text-sm text-amber-300">
              {state.znMass.toFixed(2)} g
            </div>
            <div className="text-[9px] text-slate-400">
              Tiến độ: {state.reactionProgress.toFixed(0)}%
            </div>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
        <div className="flex justify-between items-center text-xs mb-1.5">
          <span className="text-slate-300 font-medium flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            Thời gian phản ứng: <span className="font-mono text-cyan-400 font-bold ml-1">{state.timeElapsed.toFixed(1)}s</span>
          </span>
          <span className="text-xs font-mono text-emerald-400 font-bold">
            {state.reactionProgress.toFixed(0)}%
          </span>
        </div>
        <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
          <div 
            className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full transition-all duration-300"
            style={{ width: `${Math.min(100, state.reactionProgress)}%` }}
          />
        </div>
      </div>

      {/* Sub-microscopic view (Mô phỏng va chạm phân tử ion) */}
      <div>
        <MicroscopicView 
          temperature={state.temperature}
          hclConcentration={state.hclConcentration}
          znForm={state.znForm}
          reactionActive={state.reactionActive}
        />
      </div>

      {/* Real-time Reaction Rate Curve (Đồ thị thực nghiệm GDPT 2018) */}
      <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60 flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-200 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
            ĐỒ THỊ THỂ TÍCH H₂ THEO THỜI GIAN (V - t)
          </span>
          <button
            type="button"
            onClick={() => setShowChart(!showChart)}
            className="text-slate-400 hover:text-slate-200 p-0.5"
          >
            {showChart ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {showChart && (
          <div>
            <div className="relative bg-slate-950 rounded-lg p-2 border border-slate-800">
              <svg 
                viewBox={`0 0 ${chartW} ${chartH}`} 
                className="w-full h-24 overflow-visible"
              >
                {/* Axes */}
                <line x1="30" y1="10" x2="30" y2={chartH - 20} stroke="#475569" strokeWidth="1" />
                <line x1="30" y1={chartH - 20} x2={chartW - 5} y2={chartH - 20} stroke="#475569" strokeWidth="1" />

                {/* Grid lines */}
                <line x1="30" y1={(chartH - 20) / 2} x2={chartW - 5} y2={(chartH - 20) / 2} stroke="#334155" strokeDasharray="2,2" />

                {/* Axis Labels */}
                <text x="32" y="14" fill="#94a3b8" fontSize="8" fontFamily="monospace">V(mL)</text>
                <text x={chartW - 12} y={chartH - 24} fill="#94a3b8" fontSize="8" fontFamily="monospace">t(s)</text>

                {/* Plot line */}
                {pathD && (
                  <path 
                    d={pathD} 
                    fill="none" 
                    stroke="#38bdf8" 
                    strokeWidth="2.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                  />
                )}

                {/* Current point */}
                {points.length > 0 && (
                  <circle 
                    cx={points[points.length - 1].split(',')[0]} 
                    cy={points[points.length - 1].split(',')[1]} 
                    r="4" 
                    fill="#38bdf8" 
                    stroke="#ffffff" 
                    strokeWidth="1.5" 
                  />
                )}
              </svg>
            </div>
            <p className="text-[10px] text-slate-400 mt-1 leading-normal italic">
              * Độ dốc của đường cong tương ứng với tốc độ phản ứng tức thời. Ban đầu độ dốc lớn nhất do nồng độ acid cao nhất, sau đó thoải dần.
            </p>
          </div>
        )}
      </div>

      {/* Reset Button */}
      <button
        type="button"
        onClick={onReset}
        className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
      >
        <RotateCcw className="w-4 h-4 text-cyan-400" />
        <span>Làm Lại Thí Nghiệm (Khôi phục trạng thái ban đầu)</span>
      </button>
    </aside>
  );
};
