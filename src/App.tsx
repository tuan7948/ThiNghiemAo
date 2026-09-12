/**
 * Virtual Chemistry Laboratory for High School Grade 10 (GDPT 2018)
 * Experiment: Zinc (Zn) reacting with Hydrochloric Acid (HCl)
 * Focus: Reaction Rate, Effervescence of H2, Effect of Concentration & Temperature
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  LabChemicalState, 
  SafetyState, 
  SafetyAlert, 
  DataPoint, 
  HClConcentration, 
  ZnForm 
} from './types.ts';
import { ShelfPanel } from './components/ShelfPanel.tsx';
import { Workbench } from './components/Workbench.tsx';
import { InfoPanel } from './components/InfoPanel.tsx';
import { SafetyBanner } from './components/SafetyBanner.tsx';
import { TheoryGuideModal } from './components/TheoryGuideModal.tsx';
import { QuizModal } from './components/QuizModal.tsx';
import { labAudio } from './utils/audio.ts';
import { FlaskConical, Shield, HelpCircle, Sparkles, GraduationCap } from 'lucide-react';

const INITIAL_LAB_STATE: LabChemicalState = {
  hasZn: false,
  znForm: 'granule',
  znMass: 1.0,
  initialZnMass: 1.0,
  hasHCl: false,
  hclVolume: 10,
  hclConcentration: 1.0,
  initialHClMoles: 0.01,
  remainingHClMoles: 0.01,
  temperature: 25.0,
  targetBurnerTemp: 60,
  isBurnerOn: false,
  isBurnerUnderTube: false,
  isStirring: false,
  reactionProgress: 0,
  gasVolumeH2: 0,
  reactionRate: 0,
  bubblesPerSec: 0,
  timeElapsed: 0,
  isReactionFinished: false,
};

export default function App() {
  const [state, setState] = useState<LabChemicalState>(INITIAL_LAB_STATE);
  const [safetyState, setSafetyState] = useState<SafetyState>({
    goggles: false,
    gloves: false,
    labCoat: true,
    exhaustFan: true,
  });
  const [alerts, setAlerts] = useState<SafetyAlert[]>([]);
  const [historyData, setHistoryData] = useState<DataPoint[]>([]);
  const [popEffectTrigger, setPopEffectTrigger] = useState(false);
  const [showTheoryModal, setShowTheoryModal] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);

  const addAlert = useCallback((type: 'danger' | 'warning' | 'info' | 'success', title: string, message: string, ruleCode?: string) => {
    const newAlert: SafetyAlert = {
      id: Math.random().toString(36).substring(2, 9),
      type,
      title,
      message,
      ruleCode,
      time: new Date().toLocaleTimeString('vi-VN', { minute: '2-digit', second: '2-digit' }),
    };

    setAlerts((prev) => [newAlert, ...prev.slice(0, 2)]);
    if (type === 'danger' || type === 'warning') {
      labAudio.playSafetyWarning();
    }
  }, []);

  const dismissAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const toggleSafety = (key: keyof SafetyState) => {
    setSafetyState((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      labAudio.playClick();
      return next;
    });
  };

  // Add HCl to tube handler
  const handleAddHCl = () => {
    if (state.hasHCl) return;

    // Safety checks
    if (!safetyState.goggles || !safetyState.gloves) {
      if (state.hclConcentration >= 2.0) {
        addAlert(
          'danger',
          'Vi Phạm An Toàn: Thiếu Bảo Hộ Acid Đặc',
          `Bạn đang rót dung dịch HCl nồng độ cao (${state.hclConcentration}M) mà chưa đeo Kính bảo hộ hoặc Găng tay! Hãy trang bị ngay trên kệ dụng cụ.`,
          'QCVN 05:2020/BCT - An toàn hóa chất'
        );
      } else {
        addAlert(
          'warning',
          'Khuyến Cáo Bảo Hộ Thí Nghiệm',
          'Nên đeo kính bảo hộ và găng tay cao su trước khi thao tác với dung dịch acid để tránh nguy cơ văng bắn.',
          'Nội quy phòng thí nghiệm Hóa học GDPT'
        );
      }
    }

    labAudio.playPourLiquid();

    setState((prev) => {
      const molesHCl = (prev.hclVolume / 1000) * prev.hclConcentration;
      return {
        ...prev,
        hasHCl: true,
        initialHClMoles: molesHCl,
        remainingHClMoles: molesHCl,
      };
    });
  };

  // Add Zn to tube handler
  const handleAddZn = () => {
    if (state.hasZn) return;
    labAudio.playMetalClink();

    setState((prev) => ({
      ...prev,
      hasZn: true,
      initialZnMass: prev.znMass,
    }));
  };

  // Toggle Burner state
  const handleToggleBurner = () => {
    setState((prev) => {
      const nextBurner = !prev.isBurnerOn;
      if (nextBurner) {
        labAudio.playFlameIgnite();
      } else {
        labAudio.playClick();
      }
      return { ...prev, isBurnerOn: nextBurner };
    });
  };

  // Toggle Burner Position (move under test tube)
  const handleToggleBurnerPosition = () => {
    setState((prev) => {
      const nextUnder = !prev.isBurnerUnderTube;
      labAudio.playClick();

      // Check dry heating violation
      if (nextUnder && prev.isBurnerOn && !prev.hasHCl) {
        addAlert(
          'danger',
          'CẢNH BÁO NGUY HIỂM: Đun Ống Nghiệm Khô!',
          'Tuyệt đối không đun trực tiếp đáy ống nghiệm rỗng khi chưa có chất lỏng! Hiện tượng sốc nhiệt sẽ làm nứt vỡ thủy tinh gây nguy hiểm.',
          'An toàn thiết bị thủy tinh'
        );
      }

      return { ...prev, isBurnerUnderTube: nextUnder };
    });
  };

  // Drop handler from Drag and drop
  const handleDropItem = (itemType: string) => {
    if (itemType === 'hcl') handleAddHCl();
    else if (itemType === 'zn') handleAddZn();
    else if (itemType === 'burner') handleToggleBurnerPosition();
  };

  // Pop test for hydrogen gas
  const handlePerformPopTest = () => {
    if (state.gasVolumeH2 < 1.0) return;
    labAudio.playPopTest();
    setPopEffectTrigger(true);

    addAlert(
      'success',
      'Thử Tính Chất Khí H₂ Thành Công!',
      `Khí H₂ thu được (${state.gasVolumeH2.toFixed(1)} mL) cháy với ngọn lửa màu xanh nhạt và phát ra tiếng nổ "PỐP" đặc trưng của hỗn hợp nổ 2H₂ + O₂ ➔ 2H₂O.`,
      'Nhận biết khí Hydrogen'
    );

    setTimeout(() => {
      setPopEffectTrigger(false);
    }, 900);
  };

  // Reset experiment
  const handleReset = () => {
    labAudio.stopAll();
    labAudio.playClick();
    setState((prev) => ({
      ...INITIAL_LAB_STATE,
      hclConcentration: prev.hclConcentration,
      znForm: prev.znForm,
      znMass: prev.initialZnMass || 1.0,
      hclVolume: prev.hclVolume,
    }));
    setHistoryData([]);
    setPopEffectTrigger(false);
  };

  // Main Simulation Loop (10 ticks per second)
  useEffect(() => {
    const timer = setInterval(() => {
      setState((prev) => {
        // Temperature simulation
        let currentTemp = prev.temperature;
        if (prev.isBurnerOn && prev.isBurnerUnderTube) {
          // Heat up towards targetBurnerTemp
          if (currentTemp < prev.targetBurnerTemp) {
            currentTemp += 0.35;
          }
        } else {
          // Cool down towards ambient room temperature (25°C)
          if (currentTemp > 25.0) {
            currentTemp -= 0.15;
          }
        }

        // Safety warning for overheating
        if (currentTemp > 75.0 && prev.hasHCl) {
          if (Math.random() < 0.05) {
            addAlert(
              'warning',
              'Cảnh Báo Nhiệt Độ: Dung Dịch Quá Nóng!',
              'Nhiệt độ dung dịch đạt trên 75°C. Acid có thể sôi trào và bốc hơi kích ứng. Vui lòng hạ bớt đèn cồn ra ngoài!',
              'Kiểm soát nhiệt độ phản ứng'
            );
          }
        }

        // Check if reaction can happen (must have both Zn and HCl and remaining reactants)
        const isReactionPossible = prev.hasZn && prev.hasHCl && prev.znMass > 0.005 && prev.remainingHClMoles > 0.0005;

        if (!isReactionPossible) {
          const isFinished = (prev.hasZn && prev.hasHCl && (prev.znMass <= 0.005 || prev.remainingHClMoles <= 0.0005));
          labAudio.updateReactionBubbling(0);
          return {
            ...prev,
            temperature: currentTemp,
            reactionActive: false,
            reactionRate: 0,
            bubblesPerSec: 0,
            isReactionFinished: isFinished,
          };
        }

        // KINETICS CALCULATION (GDPT 2018 Chemistry Standards)
        // 1. Concentration factor: [HCl]^1.4
        const concFactor = Math.pow(prev.hclConcentration, 1.3);

        // 2. Surface area factor: Powder has ~3.2x higher rate than granule
        const surfaceFactor = prev.znForm === 'powder' ? 3.2 : 1.0;

        // 3. Temperature factor (van 't Hoff rule: gamma ~ 2.5 per 10 deg)
        const tempFactor = Math.pow(1.06, currentTemp - 25);

        // Relative reaction rate (0 to 100 scale)
        const rawRate = 14 * concFactor * surfaceFactor * tempFactor;
        const normalizedRate = Math.min(100, Math.max(2, rawRate));

        // Consume reactants per tick (dt = 0.1s)
        const dt = 0.1;
        // Moles reacted per second
        const molesReactedPerSec = (normalizedRate / 100) * 0.0006;
        const molesHClConsumed = molesReactedPerSec * dt * 2;
        const molesZnConsumed = molesReactedPerSec * dt;
        const gramsZnConsumed = molesZnConsumed * 65.38;

        const newRemainingHClMoles = Math.max(0, prev.remainingHClMoles - molesHClConsumed);
        const newZnMass = Math.max(0, prev.znMass - gramsZnConsumed);

        // Exothermic slight warming (+0.03°C from chemical reaction enthalpy)
        const exothermicTemp = currentTemp + (normalizedRate / 100) * 0.03;

        // Gas H2 evolved in mL (1 mol H2 = 24790 mL at standard conditions)
        const gasEvolvedMlThisTick = molesZnConsumed * 24790;
        const newTotalGasMl = prev.gasVolumeH2 + gasEvolvedMlThisTick;

        // Progress percentage based on limiting reactant
        const totalInitialZnMoles = prev.initialZnMass / 65.38;
        const theoreticalMaxZnMoles = Math.min(totalInitialZnMoles, prev.initialHClMoles / 2);
        const znMolesConsumedTotal = (prev.initialZnMass - newZnMass) / 65.38;
        const progress = Math.min(100, (znMolesConsumedTotal / theoreticalMaxZnMoles) * 100);

        // Bubbles per second
        const bubblesPerSec = normalizedRate * 0.6;

        // Audio bubbling feedback
        labAudio.updateReactionBubbling(normalizedRate);

        const newTimeElapsed = prev.timeElapsed + dt;

        return {
          ...prev,
          temperature: exothermicTemp,
          znMass: newZnMass,
          remainingHClMoles: newRemainingHClMoles,
          gasVolumeH2: newTotalGasMl,
          reactionRate: normalizedRate,
          bubblesPerSec,
          reactionProgress: progress,
          timeElapsed: newTimeElapsed,
          reactionActive: true,
          isReactionFinished: progress >= 99.5,
        };
      });
    }, 100);

    return () => clearInterval(timer);
  }, [addAlert]);

  // Record history points every 1 second for the rate chart
  useEffect(() => {
    if (!state.reactionActive && state.timeElapsed === 0) return;

    const chartInterval = setInterval(() => {
      setHistoryData((prev) => {
        // Keep max 60 points
        const nextPoint: DataPoint = {
          time: Math.round(state.timeElapsed),
          gasVolume: Number(state.gasVolumeH2.toFixed(1)),
          rate: Number(state.reactionRate.toFixed(1)),
          temp: Number(state.temperature.toFixed(1)),
        };
        return [...prev.slice(-59), nextPoint];
      });
    }, 1000);

    return () => clearInterval(chartInterval);
  }, [state.reactionActive, state.timeElapsed, state.gasVolumeH2, state.reactionRate, state.temperature]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-slate-950 font-['Be_Vietnam_Pro',sans-serif]">
      {/* Top Application Bar */}
      <header className="bg-slate-900/90 border-b border-slate-800 px-4 py-3 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
              <FlaskConical className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-slate-100 tracking-tight">
                  PHÒNG THÍ NGHIỆM ẢO: ZINC (Zn) + HYDROCHLORIC ACID (HCl)
                </h1>
                <span className="hidden md:inline-flex items-center gap-1 text-[11px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-medium">
                  <GraduationCap className="w-3.5 h-3.5" />
                  Hóa Học 10 GDPT 2018
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Khảo sát Tốc độ phản ứng, Khí H₂ & Các yếu tố ảnh hưởng: Nồng độ ($C_M$), Nhiệt độ ($T$), Diện tích bề mặt ($S$)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowTheoryModal(true)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Kiến thức bài học</span>
            </button>
            <button
              type="button"
              onClick={() => setShowQuizModal(true)}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/30"
            >
              <Sparkles className="w-4 h-4" />
              <span>Bài tập củng cố</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main 3-Column Experimental Layout (PC 3-cols, Mobile responsive stack) */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-4 flex flex-col lg:flex-row gap-4 items-stretch justify-center">
        {/* Left: Chemical shelf & Equipment */}
        <ShelfPanel
          hclConcentration={state.hclConcentration}
          setHclConcentration={(val: HClConcentration) => setState((prev) => ({ ...prev, hclConcentration: val }))}
          hclVolume={state.hclVolume}
          setHclVolume={(val: number) => setState((prev) => ({ ...prev, hclVolume: val }))}
          znForm={state.znForm}
          setZnForm={(form: ZnForm) => setState((prev) => ({ ...prev, znForm: form }))}
          znMass={state.znMass}
          setZnMass={(mass: number) => setState((prev) => ({ ...prev, znMass: mass, initialZnMass: mass }))}
          isBurnerOn={state.isBurnerOn}
          setIsBurnerOn={(on: boolean) => setState((prev) => ({ ...prev, isBurnerOn: on }))}
          isBurnerUnderTube={state.isBurnerUnderTube}
          setIsBurnerUnderTube={(under: boolean) => setState((prev) => ({ ...prev, isBurnerUnderTube: under }))}
          targetBurnerTemp={state.targetBurnerTemp}
          setTargetBurnerTemp={(temp: number) => setState((prev) => ({ ...prev, targetBurnerTemp: temp }))}
          hasHClInTube={state.hasHCl}
          hasZnInTube={state.hasZn}
          onAddHCl={handleAddHCl}
          onAddZn={handleAddZn}
          safetyState={safetyState}
          toggleSafety={toggleSafety}
          onPerformPopTest={handlePerformPopTest}
          reactionActive={state.reactionActive}
          gasVolumeH2={state.gasVolumeH2}
        />

        {/* Center: Interactive Workbench & Canvas test tube simulation */}
        <Workbench
          state={state}
          safetyState={safetyState}
          onDropItem={handleDropItem}
          onReset={handleReset}
          onAddHCl={handleAddHCl}
          onAddZn={handleAddZn}
          onToggleBurner={handleToggleBurner}
          onToggleBurnerPosition={handleToggleBurnerPosition}
          onPerformPopTest={handlePerformPopTest}
          onOpenTheory={() => setShowTheoryModal(true)}
          onOpenQuiz={() => setShowQuizModal(true)}
          popEffectTrigger={popEffectTrigger}
        />

        {/* Right: Info Panel & Microscopic View */}
        <InfoPanel
          state={state}
          historyData={historyData}
          onReset={handleReset}
        />
      </main>

      {/* Safety Alert Notifications */}
      <SafetyBanner alerts={alerts} onDismiss={dismissAlert} />

      {/* Theory Guide Modal */}
      <TheoryGuideModal isOpen={showTheoryModal} onClose={() => setShowTheoryModal(false)} />

      {/* Quiz Modal */}
      <QuizModal isOpen={showQuizModal} onClose={() => setShowQuizModal(false)} />
    </div>
  );
}
