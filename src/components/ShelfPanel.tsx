import React from 'react';
import { 
  FlaskConical, 
  Flame, 
  Sparkles, 
  ShieldAlert, 
  CheckCircle2, 
  Plus, 
  Thermometer, 
  Info,
  Droplets,
  Layers
} from 'lucide-react';
import { HClConcentration, ZnForm, SafetyState } from '../types.ts';
import { labAudio } from '../utils/audio.ts';

interface ShelfPanelProps {
  hclConcentration: HClConcentration;
  setHclConcentration: (val: HClConcentration) => void;
  hclVolume: number;
  setHclVolume: (val: number) => void;
  znForm: ZnForm;
  setZnForm: (form: ZnForm) => void;
  znMass: number;
  setZnMass: (mass: number) => void;
  isBurnerOn: boolean;
  setIsBurnerOn: (on: boolean) => void;
  isBurnerUnderTube: boolean;
  setIsBurnerUnderTube: (under: boolean) => void;
  targetBurnerTemp: number;
  setTargetBurnerTemp: (temp: number) => void;
  hasHClInTube: boolean;
  hasZnInTube: boolean;
  onAddHCl: () => void;
  onAddZn: () => void;
  safetyState: SafetyState;
  toggleSafety: (key: keyof SafetyState) => void;
  onPerformPopTest: () => void;
  reactionActive: boolean;
  gasVolumeH2: number;
}

export const ShelfPanel: React.FC<ShelfPanelProps> = ({
  hclConcentration,
  setHclConcentration,
  hclVolume,
  setHclVolume,
  znForm,
  setZnForm,
  znMass,
  setZnMass,
  isBurnerOn,
  setIsBurnerOn,
  isBurnerUnderTube,
  setIsBurnerUnderTube,
  targetBurnerTemp,
  setTargetBurnerTemp,
  hasHClInTube,
  hasZnInTube,
  onAddHCl,
  onAddZn,
  safetyState,
  toggleSafety,
  onPerformPopTest,
  reactionActive,
  gasVolumeH2
}) => {

  const handleDragStart = (e: React.DragEvent, itemType: 'hcl' | 'zn' | 'burner') => {
    e.dataTransfer.setData('text/plain', itemType);
    labAudio.playClick();
  };

  return (
    <aside className="w-full lg:w-80 flex flex-col gap-4 bg-slate-900/90 backdrop-blur-md p-4 rounded-2xl border border-slate-800 shadow-xl overflow-y-auto max-h-[85vh] lg:max-h-[calc(100vh-5rem)]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <FlaskConical className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-100 text-sm tracking-wide">KỆ HÓA CHẤT & DỤNG CỤ</h2>
            <p className="text-xs text-slate-400">Chọn hoặc Kéo-Thả vào ống nghiệm</p>
          </div>
        </div>
      </div>

      {/* Safety Goggles & PPE Bar */}
      <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60 flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs font-medium text-slate-300">
          <span className="flex items-center gap-1.5 text-amber-400">
            <ShieldAlert className="w-3.5 h-3.5" />
            Trang bị Bảo Hộ Thí Nghiệm:
          </span>
          <span className="text-[11px] text-slate-400">
            {safetyState.goggles && safetyState.gloves ? 'Đã an toàn' : 'Cần đeo bảo hộ'}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => toggleSafety('goggles')}
            className={`text-xs px-2.5 py-1.5 rounded-lg font-medium flex items-center justify-between border transition-all ${
              safetyState.goggles 
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                : 'bg-slate-700/50 text-slate-400 border-slate-600 hover:border-slate-500'
            }`}
          >
            <span>Kính bảo hộ</span>
            {safetyState.goggles && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
          </button>
          <button
            type="button"
            onClick={() => toggleSafety('gloves')}
            className={`text-xs px-2.5 py-1.5 rounded-lg font-medium flex items-center justify-between border transition-all ${
              safetyState.gloves 
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                : 'bg-slate-700/50 text-slate-400 border-slate-600 hover:border-slate-500'
            }`}
          >
            <span>Găng tay cao su</span>
            {safetyState.gloves && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* 1. Chemical: HCl Acid */}
      <div 
        draggable
        onDragStart={(e) => handleDragStart(e, 'hcl')}
        className="group relative bg-slate-800/80 hover:bg-slate-800 p-4 rounded-xl border border-slate-700/70 hover:border-cyan-500/50 transition-all shadow-sm cursor-grab active:cursor-grabbing"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-14 bg-gradient-to-b from-cyan-400/20 to-cyan-600/30 rounded-lg border border-cyan-400/40 flex flex-col items-center justify-center p-1 relative shadow-inner">
              <span className="text-[10px] font-bold text-cyan-200">HCl</span>
              <Droplets className="w-4 h-4 text-cyan-300 my-0.5" />
              <div className="w-full bg-cyan-400/40 h-1.5 rounded-full overflow-hidden">
                <div className="w-3/4 h-full bg-cyan-300"></div>
              </div>
              <span className="absolute -top-1.5 -right-1.5 text-[9px] bg-red-600/90 text-white font-bold px-1 rounded shadow">
                Ăn mòn
              </span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-slate-100 text-sm">Dung dịch HCl</span>
                <span className="text-[11px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded font-mono">
                  Hydrochloric Acid
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Dung dịch trong suốt, không màu</p>
            </div>
          </div>
        </div>

        {/* Concentration selector (GDPT 2018 requirement: 0.5M, 1M, 2M) */}
        <div className="mt-3.5 pt-3 border-t border-slate-700/50">
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="text-slate-300 font-medium">Nồng độ ($C_M$):</span>
            <span className="font-mono text-cyan-400 font-bold text-sm">{hclConcentration} M</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {([0.5, 1.0, 2.0] as HClConcentration[]).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => {
                  setHclConcentration(c);
                  labAudio.playClick();
                }}
                disabled={hasHClInTube}
                className={`py-1 text-xs font-semibold rounded-lg border transition-all ${
                  hclConcentration === c
                    ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-sm shadow-cyan-500/20'
                    : 'bg-slate-700/40 text-slate-300 border-slate-600 hover:bg-slate-700 disabled:opacity-50'
                }`}
              >
                {c} M
              </button>
            ))}
          </div>

          {/* Volume selection */}
          <div className="flex justify-between items-center text-xs mt-3 mb-1">
            <span className="text-slate-300 font-medium">Thể tích rót:</span>
            <span className="font-mono text-cyan-300 font-semibold">{hclVolume} mL</span>
          </div>
          <input
            type="range"
            min="5"
            max="20"
            step="5"
            value={hclVolume}
            disabled={hasHClInTube}
            onChange={(e) => setHclVolume(Number(e.target.value))}
            className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-700 rounded-lg disabled:opacity-50"
          />

          {/* Action button */}
          <button
            type="button"
            onClick={onAddHCl}
            disabled={hasHClInTube}
            className={`w-full mt-3 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              hasHClInTube
                ? 'bg-slate-700/40 text-slate-400 cursor-not-allowed border border-slate-700'
                : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-600/30'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            {hasHClInTube ? 'Đã có HCl trong ống nghiệm' : 'Rót HCl vào ống nghiệm'}
          </button>
        </div>
      </div>

      {/* 2. Metal: Zinc (Zn) */}
      <div 
        draggable
        onDragStart={(e) => handleDragStart(e, 'zn')}
        className="group relative bg-slate-800/80 hover:bg-slate-800 p-4 rounded-xl border border-slate-700/70 hover:border-amber-500/50 transition-all shadow-sm cursor-grab active:cursor-grabbing"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-14 bg-gradient-to-b from-slate-400/30 to-slate-600/40 rounded-lg border border-slate-400/40 flex flex-col items-center justify-center p-1 relative shadow-inner">
              <span className="text-[11px] font-bold text-slate-200">Zn</span>
              <Layers className="w-4 h-4 text-slate-300 my-0.5" />
              <span className="text-[9px] text-slate-400">Kẽm</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-slate-100 text-sm">Kim loại Kẽm</span>
                <span className="text-[11px] bg-slate-700 text-amber-300 px-1.5 py-0.5 rounded font-mono">
                  Zinc (M = 65)
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Khảo sát ảnh hưởng bề mặt tiếp xúc</p>
            </div>
          </div>
        </div>

        {/* State of Zinc: Granule (Viên) vs Powder (Bột) */}
        <div className="mt-3.5 pt-3 border-t border-slate-700/50">
          <div className="text-xs text-slate-300 font-medium mb-1.5">
            Dạng kẽm (Diện tích bề mặt):
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={hasZnInTube}
              onClick={() => {
                setZnForm('granule');
                labAudio.playClick();
              }}
              className={`py-1.5 px-2 text-xs font-semibold rounded-lg border flex flex-col items-center gap-1 transition-all ${
                znForm === 'granule'
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm shadow-amber-500/20'
                  : 'bg-slate-700/40 text-slate-300 border-slate-600 hover:bg-slate-700 disabled:opacity-50'
              }`}
            >
              <span>Dạng viên / hạt</span>
              <span className={`text-[10px] ${znForm === 'granule' ? 'text-slate-900 font-medium' : 'text-slate-400'}`}>
                Bề mặt nhỏ hơn
              </span>
            </button>
            <button
              type="button"
              disabled={hasZnInTube}
              onClick={() => {
                setZnForm('powder');
                labAudio.playClick();
              }}
              className={`py-1.5 px-2 text-xs font-semibold rounded-lg border flex flex-col items-center gap-1 transition-all ${
                znForm === 'powder'
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm shadow-amber-500/20'
                  : 'bg-slate-700/40 text-slate-300 border-slate-600 hover:bg-slate-700 disabled:opacity-50'
              }`}
            >
              <span>Dạng bột mịn</span>
              <span className={`text-[10px] ${znForm === 'powder' ? 'text-slate-900 font-medium' : 'text-slate-400'}`}>
                Bề mặt rất lớn
              </span>
            </button>
          </div>

          {/* Mass */}
          <div className="flex justify-between items-center text-xs mt-3 mb-1">
            <span className="text-slate-300 font-medium">Khối lượng kẽm:</span>
            <span className="font-mono text-amber-300 font-semibold">{znMass.toFixed(1)} g</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="3.0"
            step="0.5"
            value={znMass}
            disabled={hasZnInTube}
            onChange={(e) => setZnMass(Number(e.target.value))}
            className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-700 rounded-lg disabled:opacity-50"
          />

          {/* Action button */}
          <button
            type="button"
            onClick={onAddZn}
            disabled={hasZnInTube}
            className={`w-full mt-3 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              hasZnInTube
                ? 'bg-slate-700/40 text-slate-400 cursor-not-allowed border border-slate-700'
                : 'bg-amber-600 hover:bg-amber-500 text-white shadow-md shadow-amber-600/30'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            {hasZnInTube ? 'Đã cho Zn vào ống nghiệm' : 'Cho Zn vào ống nghiệm'}
          </button>
        </div>
      </div>

      {/* 3. Heating Tool: Alcohol Burner (Đèn cồn) */}
      <div 
        draggable
        onDragStart={(e) => handleDragStart(e, 'burner')}
        className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/70 hover:border-orange-500/50 transition-all shadow-sm"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-14 rounded-lg border flex flex-col items-center justify-center p-1 relative shadow-inner transition-all ${
              isBurnerOn 
                ? 'bg-orange-500/20 border-orange-500/50 text-orange-400 animate-pulse' 
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}>
              <Flame className={`w-6 h-6 ${isBurnerOn ? 'text-orange-400 drop-shadow-[0_0_8px_rgba(249,115,22,0.8)]' : 'text-slate-500'}`} />
              <span className="text-[9px] font-medium mt-0.5">Đèn cồn</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-slate-100 text-sm">Đèn Cồn Gia Nhiệt</span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Tăng tốc độ chuyển động & va chạm hạt</p>
            </div>
          </div>
        </div>

        <div className="mt-3.5 pt-3 border-t border-slate-700/50 space-y-2.5">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                const next = !isBurnerOn;
                setIsBurnerOn(next);
                if (next) labAudio.playFlameIgnite();
                else labAudio.playClick();
              }}
              className={`py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                isBurnerOn 
                  ? 'bg-orange-600 hover:bg-orange-500 text-white shadow-md shadow-orange-600/40' 
                  : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              {isBurnerOn ? 'Tắt đèn cồn' : 'Bật lửa'}
            </button>

            <button
              type="button"
              onClick={() => {
                setIsBurnerUnderTube(!isBurnerUnderTube);
                labAudio.playClick();
              }}
              className={`py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-all ${
                isBurnerUnderTube
                  ? 'bg-amber-600/30 text-amber-300 border border-amber-500/50'
                  : 'bg-slate-700/60 text-slate-300 border border-slate-600 hover:bg-slate-700'
              }`}
            >
              <span>{isBurnerUnderTube ? 'Hạ đèn ra ngoài' : 'Đun dưới ống nghiệm'}</span>
            </button>
          </div>

          {/* Temperature slider if burner is on */}
          <div className="bg-slate-900/50 p-2.5 rounded-lg border border-slate-800">
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="text-slate-400 flex items-center gap-1">
                <Thermometer className="w-3.5 h-3.5 text-orange-400" />
                Mức nhiệt cấp:
              </span>
              <span className="font-mono text-orange-400 font-semibold">{targetBurnerTemp} °C</span>
            </div>
            <input
              type="range"
              min="40"
              max="80"
              step="5"
              value={targetBurnerTemp}
              onChange={(e) => setTargetBurnerTemp(Number(e.target.value))}
              disabled={!isBurnerOn}
              className="w-full accent-orange-500 cursor-pointer h-1.5 bg-slate-700 rounded-lg disabled:opacity-40"
            />
          </div>
        </div>
      </div>

      {/* 4. Hydrogen gas test (Que đóm thử khí H2) */}
      <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60 flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-200 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-sky-400" />
            Nhận biết khí $H_2$ sinh ra:
          </span>
          <span className="text-[11px] font-mono text-cyan-300">
            {gasVolumeH2.toFixed(1)} mL thu được
          </span>
        </div>
        <p className="text-[11px] text-slate-400">
          Đưa que đóm đang cháy đến miệng ống nghiệm để thử tính chất cháy của khí $H_2$.
        </p>
        <button
          type="button"
          onClick={onPerformPopTest}
          disabled={gasVolumeH2 < 1.0}
          className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            gasVolumeH2 >= 1.0
              ? 'bg-sky-600 hover:bg-sky-500 text-white shadow-md shadow-sky-600/30 animate-pulse'
              : 'bg-slate-700/30 text-slate-500 cursor-not-allowed border border-slate-700/50'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Đưa que đóm thử khí $H_2$ (Tiếng nổ "pốp")
        </button>
      </div>

      {/* GDPT Tip box */}
      <div className="bg-emerald-950/20 border border-emerald-500/30 p-3 rounded-xl flex items-start gap-2 text-xs text-emerald-200/90">
        <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-emerald-300">Gợi ý bài học:</strong> So sánh tốc độ thoát bọt khí giữa <span className="underline">HCl 0.5M</span> và <span className="underline">HCl 2M</span>, hoặc giữa <span className="underline">kẽm hạt</span> và <span className="underline">kẽm bột</span>!
        </p>
      </div>
    </aside>
  );
};
