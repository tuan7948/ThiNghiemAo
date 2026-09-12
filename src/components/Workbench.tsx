import React, { useEffect, useRef, useState } from 'react';
import { 
  Flame, 
  RotateCcw, 
  Thermometer, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  HelpCircle, 
  ShieldCheck,
  Zap,
  Info
} from 'lucide-react';
import { LabChemicalState, SafetyState } from '../types.ts';
import { labAudio } from '../utils/audio.ts';

interface WorkbenchProps {
  state: LabChemicalState;
  safetyState: SafetyState;
  onDropItem: (itemType: string) => void;
  onReset: () => void;
  onAddHCl: () => void;
  onAddZn: () => void;
  onToggleBurner: () => void;
  onToggleBurnerPosition: () => void;
  onPerformPopTest: () => void;
  onOpenTheory: () => void;
  onOpenQuiz: () => void;
  popEffectTrigger: boolean;
}

export const Workbench: React.FC<WorkbenchProps> = ({
  state,
  safetyState,
  onDropItem,
  onReset,
  onAddHCl,
  onAddZn,
  onToggleBurner,
  onToggleBurnerPosition,
  onPerformPopTest,
  onOpenTheory,
  onOpenQuiz,
  popEffectTrigger
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isMuted, setIsMuted] = useState(labAudio.getMuted());
  const [collectMode, setCollectMode] = useState<'open' | 'water_displacement' | 'syringe'>('syringe');

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    labAudio.setMuted(next);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const itemType = e.dataTransfer.getData('text/plain');
    if (itemType) {
      onDropItem(itemType);
    }
  };

  // Canvas animation for test tube contents, effervescence, Zn dissolving and burner flame
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let time = 0;

    // Bubbles array
    interface Bubble {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      opacity: number;
    }

    const bubbles: Bubble[] = [];

    const render = () => {
      time += 0.03;
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // Geometric layout for the center stage
      const tubeCenterX = width * 0.45;
      const tubeWidth = 64;
      const tubeTopY = 40;
      const tubeBottomY = height - 160;
      const tubeRadius = tubeWidth / 2;

      // 1. Draw Lab Stand & Metal Clamp (Giá sắt & Kẹp ống nghiệm)
      const standPoleX = tubeCenterX + 85;
      const standBaseY = height - 50;

      // Stand Base
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.roundRect(standPoleX - 45, standBaseY, 110, 16, 4);
      ctx.fill();
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Stand Vertical Iron Rod
      ctx.fillStyle = '#64748b';
      ctx.fillRect(standPoleX + 10, 20, 10, standBaseY - 20);

      // Clamp Arm holding the test tube
      const clampY = tubeTopY + 70;
      ctx.fillStyle = '#475569';
      ctx.fillRect(tubeCenterX + 20, clampY, standPoleX - tubeCenterX - 10, 8);
      // Clamp screw knob
      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.arc(standPoleX + 15, clampY + 4, 7, 0, Math.PI * 2);
      ctx.fill();
      // Clamp jaws around glass tube
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(tubeCenterX, clampY + 4, tubeRadius + 4, -Math.PI * 0.4, Math.PI * 0.4);
      ctx.stroke();

      // 2. If Burner is under the tube, draw the Alcohol Burner (Đèn cồn)
      const burnerX = state.isBurnerUnderTube ? tubeCenterX : tubeCenterX - 110;
      const burnerY = height - 70;
      const burnerWidth = 60;
      const burnerHeight = 55;

      // Burner Glass Flask
      ctx.save();
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(burnerX - burnerWidth / 2, burnerY + burnerHeight);
      ctx.lineTo(burnerX + burnerWidth / 2, burnerY + burnerHeight);
      ctx.lineTo(burnerX + burnerWidth / 3, burnerY + 15);
      ctx.lineTo(burnerX - burnerWidth / 3, burnerY + 15);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Alcohol fluid inside burner
      ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
      ctx.beginPath();
      ctx.moveTo(burnerX - burnerWidth / 2 + 3, burnerY + burnerHeight - 2);
      ctx.lineTo(burnerX + burnerWidth / 2 - 3, burnerY + burnerHeight - 2);
      ctx.lineTo(burnerX + burnerWidth / 3.5, burnerY + 28);
      ctx.lineTo(burnerX - burnerWidth / 3.5, burnerY + 28);
      ctx.closePath();
      ctx.fill();

      // Burner metal wick holder & cotton wick
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(burnerX - 7, burnerY + 5, 14, 10);
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(burnerX - 3, burnerY - 4, 6, 9);

      // Burner Flame Animation if turned ON
      if (state.isBurnerOn) {
        const flameHeight = 35 + Math.sin(time * 12) * 5;
        const flameWiggle = Math.sin(time * 18) * 3;

        // Outer yellow flame
        const outerGrad = ctx.createRadialGradient(
          burnerX + flameWiggle,
          burnerY - flameHeight * 0.6,
          2,
          burnerX,
          burnerY,
          flameHeight
        );
        outerGrad.addColorStop(0, 'rgba(254, 240, 138, 0.95)');
        outerGrad.addColorStop(0.4, 'rgba(249, 115, 22, 0.85)');
        outerGrad.addColorStop(0.8, 'rgba(239, 68, 68, 0.6)');
        outerGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');

        ctx.fillStyle = outerGrad;
        ctx.beginPath();
        ctx.moveTo(burnerX - 12, burnerY - 3);
        ctx.quadraticCurveTo(burnerX - 16, burnerY - flameHeight * 0.5, burnerX + flameWiggle, burnerY - flameHeight);
        ctx.quadraticCurveTo(burnerX + 16, burnerY - flameHeight * 0.5, burnerX + 12, burnerY - 3);
        ctx.closePath();
        ctx.fill();

        // Inner blue-white core
        const innerGrad = ctx.createRadialGradient(
          burnerX,
          burnerY - 6,
          1,
          burnerX,
          burnerY - 12,
          15
        );
        innerGrad.addColorStop(0, '#ffffff');
        innerGrad.addColorStop(0.5, '#38bdf8');
        innerGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');

        ctx.fillStyle = innerGrad;
        ctx.beginPath();
        ctx.ellipse(burnerX, burnerY - 10, 5, 12, 0, 0, Math.PI * 2);
        ctx.fill();

        // Thermal convection heat haze waves rising if under tube
        if (state.isBurnerUnderTube) {
          ctx.strokeStyle = 'rgba(251, 191, 36, 0.2)';
          ctx.lineWidth = 1.5;
          for (let i = -1; i <= 1; i++) {
            ctx.beginPath();
            const waveX = tubeCenterX + i * 16;
            ctx.moveTo(waveX, burnerY - flameHeight - 5);
            ctx.bezierCurveTo(
              waveX + Math.sin(time * 8 + i) * 8,
              burnerY - flameHeight - 20,
              waveX - Math.sin(time * 8 + i) * 8,
              burnerY - flameHeight - 40,
              waveX,
              tubeBottomY + 10
            );
            ctx.stroke();
          }
        }
      }
      ctx.restore();

      // 3. Draw Liquid inside the Test Tube (if HCl added)
      if (state.hasHCl) {
        // Calculate liquid height based on volume (e.g. 5ml to 20ml)
        const liquidHeight = Math.min(180, 50 + (state.hclVolume / 20) * 110);
        const liquidTopY = tubeBottomY - liquidHeight;

        ctx.save();
        // Clip to inside of tube rounded bottom
        ctx.beginPath();
        ctx.moveTo(tubeCenterX - tubeRadius + 2, tubeTopY);
        ctx.lineTo(tubeCenterX - tubeRadius + 2, tubeBottomY - tubeRadius);
        ctx.arc(tubeCenterX, tubeBottomY - tubeRadius, tubeRadius - 2, Math.PI, 0, true);
        ctx.lineTo(tubeCenterX + tubeRadius - 2, tubeTopY);
        ctx.closePath();
        ctx.clip();

        // Liquid background color: starts clear cyan tint, becomes slightly denser as ZnCl2 forms
        const znCl2Progress = state.reactionProgress / 100;
        const liquidGrad = ctx.createLinearGradient(
          tubeCenterX - tubeRadius,
          liquidTopY,
          tubeCenterX + tubeRadius,
          tubeBottomY
        );

        // Subtly changing refraction index with ZnCl2 formation
        liquidGrad.addColorStop(0, `rgba(186, 230, 253, ${0.45 + znCl2Progress * 0.15})`);
        liquidGrad.addColorStop(1, `rgba(125, 211, 252, ${0.55 + znCl2Progress * 0.2})`);

        ctx.fillStyle = liquidGrad;
        ctx.fillRect(tubeCenterX - tubeRadius, liquidTopY, tubeWidth, liquidHeight + tubeRadius);

        // Meniscus surface curve
        ctx.fillStyle = 'rgba(224, 242, 254, 0.7)';
        ctx.beginPath();
        ctx.ellipse(tubeCenterX, liquidTopY, tubeRadius - 3, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Volume markings on glass
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 1;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.font = '8px monospace';
        for (let ml = 5; ml <= 20; ml += 5) {
          const markY = tubeBottomY - (50 + (ml / 20) * 110);
          ctx.beginPath();
          ctx.moveTo(tubeCenterX + tubeRadius - 8, markY);
          ctx.lineTo(tubeCenterX + tubeRadius - 2, markY);
          ctx.stroke();
          ctx.fillText(`${ml}mL`, tubeCenterX + tubeRadius + 4, markY + 3);
        }

        // 4. Draw Zinc metal at bottom of tube
        if (state.hasZn) {
          // Shrink size as reaction proceeds (1.0 -> 0)
          const remainingFactor = Math.max(0.08, state.znMass / state.initialZnMass);

          if (state.znForm === 'granule') {
            // Draw 2-3 metallic silver zinc granules
            const granuleCount = 2;
            for (let g = 0; g < granuleCount; g++) {
              const gx = tubeCenterX + (g === 0 ? -10 : 9);
              const gy = tubeBottomY - 14 - g * 3;
              const gRadius = (10 + g * 2) * Math.sqrt(remainingFactor);

              // Metallic silver sphere gradient
              const znGrad = ctx.createRadialGradient(
                gx - gRadius * 0.3,
                gy - gRadius * 0.3,
                1,
                gx,
                gy,
                gRadius
              );
              znGrad.addColorStop(0, '#f1f5f9');
              znGrad.addColorStop(0.5, '#94a3b8');
              znGrad.addColorStop(1, '#475569');

              ctx.fillStyle = znGrad;
              ctx.beginPath();
              ctx.ellipse(gx, gy, gRadius, gRadius * 0.75, g * 0.4, 0, Math.PI * 2);
              ctx.fill();
              ctx.strokeStyle = '#334155';
              ctx.lineWidth = 1;
              ctx.stroke();
            }
          } else {
            // Zinc Powder (Bột Zn): dispersed cluster of fine dark-grey particles along bottom
            const powderWidth = (tubeWidth - 14) * remainingFactor;
            ctx.fillStyle = 'rgba(100, 116, 139, 0.85)';
            ctx.beginPath();
            ctx.ellipse(tubeCenterX, tubeBottomY - 12, powderWidth / 2, 7 * remainingFactor, 0, 0, Math.PI * 2);
            ctx.fill();

            // Fine speckles
            ctx.fillStyle = '#cbd5e1';
            for (let sp = 0; sp < 25 * remainingFactor; sp++) {
              const sx = tubeCenterX - powderWidth / 2 + Math.random() * powderWidth;
              const sy = tubeBottomY - 18 + Math.random() * 12;
              ctx.fillRect(sx, sy, 1.5, 1.5);
            }
          }
        }

        // 5. Bubbles (H2 effervescence)
        if (state.reactionActive && state.reactionRate > 0) {
          // Spawn rate depends on reaction rate
          const spawnChance = Math.min(0.95, (state.reactionRate / 100) * 0.85 + 0.1);
          if (Math.random() < spawnChance) {
            const spawnX = tubeCenterX + (Math.random() - 0.5) * (tubeWidth - 20);
            const spawnY = tubeBottomY - 20 + Math.random() * 8;
            bubbles.push({
              x: spawnX,
              y: spawnY,
              vx: (Math.random() - 0.5) * 0.8,
              vy: -(1.5 + Math.random() * 2.5 * (state.reactionRate / 50)),
              size: 2 + Math.random() * 4.5,
              opacity: 0.95
            });
          }
        }

        // Animate bubbles rising
        for (let i = bubbles.length - 1; i >= 0; i--) {
          const b = bubbles[i];
          b.x += b.vx;
          b.y += b.vy;
          b.x += Math.sin(b.y * 0.08) * 0.4;

          // Reach liquid top or burst
          if (b.y < liquidTopY) {
            bubbles.splice(i, 1);
            continue;
          }

          ctx.beginPath();
          ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${b.opacity * 0.8})`;
          ctx.fill();
          ctx.strokeStyle = `rgba(186, 230, 253, ${b.opacity})`;
          ctx.lineWidth = 1;
          ctx.stroke();

          // Bubble highlight shine
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(b.x - b.size * 0.3, b.y - b.size * 0.3, b.size * 0.25, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }

      // 6. Draw Glass Test Tube Itself (Outer Shell with realistic specular reflections)
      ctx.save();
      ctx.lineWidth = 3;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';

      // Test tube outline with rounded bottom
      ctx.beginPath();
      // Lip of test tube (flanged rim)
      ctx.moveTo(tubeCenterX - tubeRadius - 4, tubeTopY);
      ctx.lineTo(tubeCenterX + tubeRadius + 4, tubeTopY);
      ctx.lineTo(tubeCenterX + tubeRadius + 2, tubeTopY + 4);
      ctx.lineTo(tubeCenterX + tubeRadius, tubeTopY + 6);
      ctx.lineTo(tubeCenterX + tubeRadius, tubeBottomY - tubeRadius);
      ctx.arc(tubeCenterX, tubeBottomY - tubeRadius, tubeRadius, 0, Math.PI, false);
      ctx.lineTo(tubeCenterX - tubeRadius, tubeTopY + 6);
      ctx.lineTo(tubeCenterX - tubeRadius - 2, tubeTopY + 4);
      ctx.closePath();
      ctx.stroke();

      // Glass specular white reflection strip along left edge
      const glassGleam = ctx.createLinearGradient(
        tubeCenterX - tubeRadius,
        tubeTopY,
        tubeCenterX - tubeRadius + 14,
        tubeTopY
      );
      glassGleam.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
      glassGleam.addColorStop(0.6, 'rgba(255, 255, 255, 0.1)');
      glassGleam.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.fillStyle = glassGleam;
      ctx.fillRect(tubeCenterX - tubeRadius + 2, tubeTopY + 6, 12, tubeBottomY - tubeTopY - 20);
      ctx.restore();

      // 7. Rubber Stopper & Gas Delivery System
      if (collectMode === 'syringe') {
        // Draw rubber stopper on top of tube
        ctx.fillStyle = '#475569';
        ctx.fillRect(tubeCenterX - tubeRadius + 2, tubeTopY - 14, tubeWidth - 4, 16);
        ctx.fillStyle = '#334155';
        ctx.fillRect(tubeCenterX - tubeRadius + 6, tubeTopY - 20, tubeWidth - 12, 8);

        // Glass delivery tube leading to gas syringe
        ctx.strokeStyle = 'rgba(186, 230, 253, 0.8)';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(tubeCenterX, tubeTopY - 18);
        ctx.lineTo(tubeCenterX, tubeTopY - 35);
        ctx.lineTo(tubeCenterX - 110, tubeTopY - 35);
        ctx.lineTo(tubeCenterX - 110, tubeTopY + 10);
        ctx.stroke();

        // Gas Syringe (Xilanh thu khí định lượng)
        const syringeX = tubeCenterX - 150;
        const syringeY = tubeTopY + 20;
        const syringeW = 40;
        const syringeH = 140;

        // Syringe barrel
        ctx.fillStyle = 'rgba(30, 41, 59, 0.6)';
        ctx.fillRect(syringeX, syringeY, syringeW, syringeH);
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 2;
        ctx.strokeRect(syringeX, syringeY, syringeW, syringeH);

        // Gas filled volume inside syringe
        const maxGasMl = 50;
        const gasFillHeight = Math.min(syringeH - 20, (state.gasVolumeH2 / maxGasMl) * (syringeH - 20));
        ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
        ctx.fillRect(syringeX + 2, syringeY + 2, syringeW - 4, gasFillHeight);

        // Plunger (Pit-tông xilanh nâng lên khi khí H2 sinh ra)
        const plungerY = syringeY + 2 + gasFillHeight;
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(syringeX + 1, plungerY, syringeW - 2, 8);
        ctx.fillStyle = '#64748b';
        ctx.fillRect(syringeX + syringeW / 2 - 4, plungerY + 8, 8, syringeH - gasFillHeight);
        // Plunger handle ring
        ctx.beginPath();
        ctx.arc(syringeX + syringeW / 2, syringeY + syringeH + 12, 12, 0, Math.PI * 2);
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Syringe scale marks
        ctx.fillStyle = '#f8fafc';
        ctx.font = '8px monospace';
        ctx.textAlign = 'right';
        for (let v = 0; v <= 50; v += 10) {
          const sMarkY = syringeY + 2 + (v / 50) * (syringeH - 20);
          ctx.fillRect(syringeX + syringeW - 6, sMarkY, 4, 1);
          ctx.fillText(`${v}`, syringeX + syringeW - 8, sMarkY + 3);
        }
        ctx.textAlign = 'center';
        ctx.fillText('mL H₂', syringeX + syringeW / 2, syringeY + syringeH + 34);
      }

      // 8. Thermometer immersed into solution
      if (state.hasHCl) {
        const thermX = tubeCenterX + 12;
        const thermTopY = tubeTopY - 25;
        const thermBottomY = tubeBottomY - 25;

        // Stem
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.fillRect(thermX - 3, thermTopY, 6, thermBottomY - thermTopY);
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1;
        ctx.strokeRect(thermX - 3, thermTopY, 6, thermBottomY - thermTopY);

        // Bulb at bottom
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(thermX, thermBottomY, 6, 0, Math.PI * 2);
        ctx.fill();

        // Red liquid column indicating temperature
        const minT = 20;
        const maxT = 90;
        const tempFraction = Math.min(1, Math.max(0, (state.temperature - minT) / (maxT - minT)));
        const redHeight = (thermBottomY - thermTopY - 10) * tempFraction;

        ctx.fillStyle = '#ef4444';
        ctx.fillRect(thermX - 1.5, thermBottomY - redHeight, 3, redHeight);

        // Temperature readout bubble badge
        ctx.fillStyle = '#0f172a';
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(thermX + 8, thermTopY + 2, 48, 20, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#fca5a5';
        ctx.font = 'bold 10px JetBrains Mono';
        ctx.textAlign = 'left';
        ctx.fillText(`${state.temperature.toFixed(0)}°C`, thermX + 14, thermTopY + 16);
      }

      // 9. Pop Effect (Que đóm thử H2 nổ bốc tia lửa)
      if (popEffectTrigger) {
        ctx.save();
        const flashX = tubeCenterX;
        const flashY = tubeTopY - 10;

        // Big explosion flash
        const flashGrad = ctx.createRadialGradient(flashX, flashY, 5, flashX, flashY, 55);
        flashGrad.addColorStop(0, '#ffffff');
        flashGrad.addColorStop(0.3, '#38bdf8');
        flashGrad.addColorStop(0.7, '#f59e0b');
        flashGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');

        ctx.fillStyle = flashGrad;
        ctx.beginPath();
        ctx.arc(flashX, flashY, 55, 0, Math.PI * 2);
        ctx.fill();

        // Sound text
        ctx.fillStyle = '#fef08a';
        ctx.font = 'bold 20px Be Vietnam Pro, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('💥 PỐP!', flashX, flashY - 45);
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [state, collectMode, popEffectTrigger]);

  return (
    <main className="flex-1 flex flex-col bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-800 shadow-xl overflow-hidden min-h-[520px]">
      {/* Top action & status toolbar */}
      <div className="flex flex-wrap items-center justify-between p-3.5 bg-slate-900/90 border-b border-slate-800 gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <h1 className="text-sm font-semibold text-slate-200">
            BÀN THỰC HÀNH THÍ NGHIỆM TRUNG TÂM
          </h1>
          <span className="hidden sm:inline-block text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full border border-slate-700">
            Kéo thả hoặc Nhấp nút điều khiển
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Audio toggle */}
          <button
            type="button"
            onClick={toggleMute}
            title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* Theory guide button */}
          <button
            type="button"
            onClick={onOpenTheory}
            className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 flex items-center gap-1 transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Lý thuyết</span> GDPT 2018
          </button>

          {/* Quiz button */}
          <button
            type="button"
            onClick={onOpenQuiz}
            className="text-xs px-2.5 py-1.5 rounded-lg bg-indigo-900/60 hover:bg-indigo-800/60 text-indigo-200 border border-indigo-500/40 flex items-center gap-1 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Câu hỏi củng cố</span>
          </button>

          {/* Reset button */}
          <button
            type="button"
            onClick={() => {
              labAudio.playClick();
              onReset();
            }}
            className="text-xs px-3 py-1.5 rounded-lg bg-red-950/60 hover:bg-red-900/80 text-red-200 border border-red-800/50 flex items-center gap-1.5 transition-colors font-medium"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Làm lại</span>
          </button>
        </div>
      </div>

      {/* Main Canvas Area with Drag and Drop Zone */}
      <div 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative flex-1 flex flex-col items-center justify-center p-2 bg-gradient-to-b from-slate-950/80 via-slate-900/90 to-slate-950/80 transition-all ${
          isDragOver ? 'ring-2 ring-cyan-400 bg-cyan-950/20' : ''
        }`}
      >
        {/* Drop zone indicator badge */}
        {isDragOver && (
          <div className="absolute top-4 z-20 bg-cyan-500/90 text-slate-950 font-bold text-xs px-4 py-1.5 rounded-full shadow-lg animate-bounce">
            Thả hóa chất hoặc đèn cồn vào đây!
          </div>
        )}

        {/* Top gas collection mode selector */}
        <div className="absolute top-3 right-4 z-10 bg-slate-900/80 backdrop-blur-md p-1.5 rounded-xl border border-slate-800 flex items-center gap-1.5 text-xs">
          <span className="text-slate-400 text-[11px] pl-1">Dụng cụ thu khí:</span>
          <button
            type="button"
            onClick={() => setCollectMode('syringe')}
            className={`px-2 py-1 rounded-lg font-medium transition-all ${
              collectMode === 'syringe' 
                ? 'bg-cyan-600 text-white shadow-sm' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Xilanh định lượng
          </button>
          <button
            type="button"
            onClick={() => setCollectMode('open')}
            className={`px-2 py-1 rounded-lg font-medium transition-all ${
              collectMode === 'open' 
                ? 'bg-cyan-600 text-white shadow-sm' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Ống nghiệm hở
          </button>
        </div>

        {/* Real-time reaction status pill banner inside canvas */}
        <div className="absolute top-3 left-4 z-10 flex flex-col gap-1.5">
          <div className="flex items-center gap-2 bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
            <span className="font-semibold text-slate-300">Trạng thái phản ứng:</span>
            {state.reactionActive ? (
              <span className="flex items-center gap-1 font-semibold text-emerald-400">
                <Zap className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                Đang diễn ra mãnh liệt
              </span>
            ) : state.isReactionFinished ? (
              <span className="text-slate-400">Đã phản ứng hoàn toàn</span>
            ) : (
              <span className="text-amber-400">Chờ phối trộn chất phản ứng</span>
            )}
          </div>

          {/* Quick step checklist helper */}
          <div className="bg-slate-900/70 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-slate-800/80 text-[11px] text-slate-400 flex items-center gap-2">
            <span className={state.hasZn ? 'text-emerald-400 line-through' : 'text-slate-300'}>
              1. Cho Kẽm (Zn)
            </span>
            <span>➔</span>
            <span className={state.hasHCl ? 'text-emerald-400 line-through' : 'text-slate-300'}>
              2. Rót acid HCl
            </span>
            <span>➔</span>
            <span className={state.isBurnerUnderTube ? 'text-emerald-400' : 'text-slate-300'}>
              3. Đun nóng (Tùy chọn)
            </span>
          </div>
        </div>

        {/* Canvas container with Resize handling */}
        <div className="w-full h-full flex items-center justify-center">
          <canvas
            ref={canvasRef}
            width={480}
            height={420}
            className="w-full max-w-[480px] h-[380px] sm:h-[420px] object-contain drop-shadow-2xl"
          />
        </div>

        {/* Interactive quick action controls row below canvas */}
        <div className="w-full px-4 py-2.5 bg-slate-900/90 border-t border-slate-800 flex flex-wrap items-center justify-center gap-2">
          {!state.hasZn && (
            <button
              type="button"
              onClick={onAddZn}
              className="text-xs px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-medium shadow transition-all"
            >
              + Cho Zn ({state.znForm === 'powder' ? 'Bột' : 'Viên'})
            </button>
          )}

          {!state.hasHCl && (
            <button
              type="button"
              onClick={onAddHCl}
              className="text-xs px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium shadow transition-all"
            >
              + Rót HCl ({state.hclConcentration}M)
            </button>
          )}

          <button
            type="button"
            onClick={onToggleBurnerPosition}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium border transition-all ${
              state.isBurnerUnderTube
                ? 'bg-orange-950/60 text-orange-300 border-orange-700/60'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            {state.isBurnerUnderTube ? 'Di chuyển đèn ra ngoài' : 'Đặt đèn dưới ống nghiệm'}
          </button>

          <button
            type="button"
            onClick={onToggleBurner}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium flex items-center gap-1 border transition-all ${
              state.isBurnerOn
                ? 'bg-orange-600 text-white border-orange-500'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <Flame className="w-3 h-3" />
            {state.isBurnerOn ? 'Tắt lửa' : 'Bật lửa đèn cồn'}
          </button>

          {state.gasVolumeH2 >= 1.0 && (
            <button
              type="button"
              onClick={onPerformPopTest}
              className="text-xs px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold flex items-center gap-1 animate-pulse shadow-md transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Thử que đóm cháy (H₂)
            </button>
          )}
        </div>
      </div>
    </main>
  );
};
