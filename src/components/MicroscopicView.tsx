import React, { useEffect, useRef, useState } from 'react';
import { Atom, Zap, RefreshCw, Eye } from 'lucide-react';
import { MicroParticle } from '../types.ts';

interface MicroscopicViewProps {
  temperature: number;
  hclConcentration: number;
  znForm: 'granule' | 'powder';
  reactionActive: boolean;
  onEffectiveCollision?: () => void;
}

export const MicroscopicView: React.FC<MicroscopicViewProps> = ({
  temperature,
  hclConcentration,
  znForm,
  reactionActive
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [collisionCount, setCollisionCount] = useState(0);
  const [showLabels, setShowLabels] = useState(true);

  // Speed factor scales with temperature (T in Kelvin: 273 + T)
  const speedMultiplier = Math.max(0.6, (temperature - 10) / 25);
  // Target particle count scales with concentration (0.5M => 20, 1.0M => 38, 2.0M => 65)
  const baseHCount = Math.round(hclConcentration * 32);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const width = canvas.width;
    const height = canvas.height;

    // Initialize particles
    const particles: MicroParticle[] = [];

    // Add H+ ions
    for (let i = 0; i < baseHCount; i++) {
      particles.push({
        id: Math.random(),
        x: Math.random() * (width - 20) + 10,
        y: Math.random() * (height - 80) + 10,
        vx: (Math.random() - 0.5) * 2.8 * speedMultiplier,
        vy: (Math.random() - 0.5) * 2.8 * speedMultiplier,
        type: 'H+',
        radius: 6,
        color: '#38bdf8' // sky blue
      });
    }

    // Add Cl- spectator ions
    for (let i = 0; i < Math.round(baseHCount * 0.7); i++) {
      particles.push({
        id: Math.random(),
        x: Math.random() * (width - 20) + 10,
        y: Math.random() * (height - 80) + 10,
        vx: (Math.random() - 0.5) * 1.8 * speedMultiplier,
        vy: (Math.random() - 0.5) * 1.8 * speedMultiplier,
        type: 'Cl-',
        radius: 8,
        color: '#4ade80' // light green
      });
    }

    // Generated H2 bubbles in microscopic view
    const h2Bubbles: { x: number; y: number; vy: number; radius: number; opacity: number }[] = [];
    // Dissolved Zn2+ ions floating up
    const znIons: { x: number; y: number; vy: number; vx: number; opacity: number }[] = [];

    // Collision spark effects
    const sparks: { x: number; y: number; life: number; color: string }[] = [];

    let frameCount = 0;
    let localCollisions = 0;

    const render = () => {
      frameCount++;
      ctx.clearRect(0, 0, width, height);

      // 1. Draw liquid background with gentle gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, '#0f172a');
      bgGrad.addColorStop(1, '#1e293b');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Draw Zn Metal Surface at bottom (Granule: compact smooth surface, Powder: rough jagged porous surface)
      const surfaceY = height - 42;
      ctx.fillStyle = '#94a3b8';
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 2;

      // Draw metallic crystalline surface
      ctx.beginPath();
      ctx.moveTo(0, height);
      ctx.lineTo(0, surfaceY);

      const segmentCount = znForm === 'powder' ? 24 : 10;
      for (let i = 0; i <= segmentCount; i++) {
        const segX = (i / segmentCount) * width;
        const jagged = znForm === 'powder' 
          ? Math.sin(i * 1.8 + frameCount * 0.05) * 8 + (i % 2 === 0 ? 5 : -4)
          : Math.sin(i * 0.8) * 3;
        ctx.lineTo(segX, surfaceY + jagged);
      }
      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Zinc atom lattice visual circles
      const latticeRows = 2;
      const latticeCols = 16;
      for (let r = 0; r < latticeRows; r++) {
        for (let c = 0; c < latticeCols; c++) {
          const zx = (c + 0.5) * (width / latticeCols);
          const zy = height - 26 + r * 14;
          ctx.beginPath();
          ctx.arc(zx, zy, 7, 0, Math.PI * 2);
          ctx.fillStyle = '#64748b';
          ctx.fill();
          ctx.strokeStyle = '#475569';
          ctx.stroke();

          // Zn label
          if (showLabels && c % 3 === 0 && r === 0) {
            ctx.fillStyle = '#f1f5f9';
            ctx.font = 'bold 8px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('Zn', zx, zy + 3);
          }
        }
      }

      // Surface text label
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '600 10px Be Vietnam Pro, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(
        znForm === 'powder' ? 'Bề mặt Zn dạng BỘT (Diện tích tiếp xúc rất lớn)' : 'Bề mặt Zn dạng VIÊN (Diện tích tiếp xúc nhỏ hơn)', 
        10, 
        height - 8
      );

      // 3. Update & draw micro particles (H+ and Cl-)
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Move
        p.x += p.vx * speedMultiplier;
        p.y += p.vy * speedMultiplier;

        // Wall collisions
        if (p.x < p.radius) {
          p.x = p.radius;
          p.vx *= -1;
        } else if (p.x > width - p.radius) {
          p.x = width - p.radius;
          p.vx *= -1;
        }

        if (p.y < p.radius) {
          p.y = p.radius;
          p.vy *= -1;
        }

        // Collision with Zinc surface
        if (p.y > surfaceY - p.radius) {
          p.y = surfaceY - p.radius;
          p.vy = -Math.abs(p.vy); // Bounce back up

          // If it's H+ and reaction is active => chance of effective collision!
          if (p.type === 'H+' && reactionActive) {
            // Probability depends on kinetic energy (temperature) and surface factor
            const activationEnergyThreshold = 0.45;
            const kineticEnergy = 0.2 + (temperature / 100) * 0.6;
            const surfaceFactor = znForm === 'powder' ? 1.5 : 0.9;
            const isEffective = Math.random() < (kineticEnergy * surfaceFactor * activationEnergyThreshold);

            if (isEffective) {
              localCollisions++;
              // Create spark
              sparks.push({
                x: p.x,
                y: p.y + 4,
                life: 1.0,
                color: '#f59e0b'
              });

              // Form H2 molecule floating up
              h2Bubbles.push({
                x: p.x,
                y: p.y - 6,
                vy: -(1.5 + Math.random() * 1.5),
                radius: 7,
                opacity: 1.0
              });

              // Release Zn2+ ion into solution
              znIons.push({
                x: p.x + (Math.random() - 0.5) * 8,
                y: p.y - 2,
                vx: (Math.random() - 0.5) * 1.2,
                vy: -0.8 - Math.random() * 0.8,
                opacity: 1.0
              });

              // Respawn H+ from top of solution after reaction
              p.y = 10;
              p.x = Math.random() * (width - 20) + 10;
            }
          }
        }

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();

        // Glow ring for fast moving particles
        if (speedMultiplier > 1.2) {
          ctx.strokeStyle = p.color;
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        // Symbol label
        if (showLabels) {
          ctx.fillStyle = '#0f172a';
          ctx.font = 'bold 8px JetBrains Mono, monospace';
          ctx.textAlign = 'center';
          ctx.fillText(p.type, p.x, p.y + 3);
        }
      }

      // 4. Update & draw formed H2 bubbles
      for (let i = h2Bubbles.length - 1; i >= 0; i--) {
        const b = h2Bubbles[i];
        b.y += b.vy;
        b.opacity -= 0.008;

        if (b.y < 5 || b.opacity <= 0) {
          h2Bubbles.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${b.opacity * 0.85})`;
        ctx.fill();
        ctx.strokeStyle = `rgba(186, 230, 253, ${b.opacity})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // H-H pair visual
        ctx.fillStyle = `rgba(15, 23, 42, ${b.opacity})`;
        ctx.font = 'bold 8px JetBrains Mono';
        ctx.textAlign = 'center';
        ctx.fillText('H₂', b.x, b.y + 3);
      }

      // 5. Update & draw formed Zn2+ ions
      for (let i = znIons.length - 1; i >= 0; i--) {
        const z = znIons[i];
        z.x += z.vx;
        z.y += z.vy;
        z.opacity -= 0.005;

        if (z.y < 10 || z.opacity <= 0) {
          znIons.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(z.x, z.y, 7, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(216, 180, 254, ${z.opacity * 0.9})`; // light purple
        ctx.fill();
        ctx.strokeStyle = `rgba(168, 85, 247, ${z.opacity})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = `rgba(59, 7, 100, ${z.opacity})`;
        ctx.font = 'bold 7px JetBrains Mono';
        ctx.textAlign = 'center';
        ctx.fillText('Zn²⁺', z.x, z.y + 2.5);
      }

      // 6. Draw collision sparks
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.life -= 0.08;
        if (s.life <= 0) {
          sparks.splice(i, 1);
          continue;
        }
        ctx.save();
        ctx.beginPath();
        ctx.arc(s.x, s.y, 8 * (1 - s.life), 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(245, 158, 11, ${s.life})`;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
      }

      // Update external collision rate count every 30 frames
      if (frameCount % 30 === 0) {
        setCollisionCount(localCollisions * 2);
        localCollisions = 0;
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [temperature, hclConcentration, znForm, reactionActive, speedMultiplier, baseHCount, showLabels]);

  return (
    <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-3 flex flex-col gap-2 shadow-lg">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-400">
          <Atom className="w-4 h-4 animate-spin" style={{ animationDuration: '8s' }} />
          <span>GÓC NHÌN VI MÔ (THUYẾT VA CHẠM HOẠT ĐỘNG)</span>
        </div>
        <button
          type="button"
          onClick={() => setShowLabels(!showLabels)}
          className="text-[11px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1 border border-slate-700"
        >
          <Eye className="w-3 h-3" />
          {showLabels ? 'Ẩn ký hiệu' : 'Hiện ký hiệu'}
        </button>
      </div>

      {/* Canvas view */}
      <div className="relative rounded-lg overflow-hidden border border-slate-800 bg-slate-950 flex justify-center">
        <canvas
          ref={canvasRef}
          width={320}
          height={180}
          className="w-full h-[180px] block"
        />
        
        {/* Legend pills over canvas */}
        <div className="absolute top-2 left-2 flex flex-wrap gap-1.5 pointer-events-none">
          <span className="text-[10px] bg-sky-500/20 text-sky-300 border border-sky-500/30 px-1.5 py-0.5 rounded font-mono flex items-center gap-1 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 inline-block"></span>
            H⁺ ({baseHCount})
          </span>
          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 rounded font-mono flex items-center gap-1 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>
            Cl⁻
          </span>
          <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-1.5 py-0.5 rounded font-mono flex items-center gap-1 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 inline-block"></span>
            Zn²⁺ sinh ra
          </span>
          <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded font-mono flex items-center gap-1 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-white inline-block"></span>
            H₂ thoát ra
          </span>
        </div>

        {/* Real-time micro collision telemetry */}
        <div className="absolute top-2 right-2 bg-slate-900/80 backdrop-blur-md px-2 py-1 rounded border border-slate-700/80 text-[10px] font-mono text-amber-300 flex items-center gap-1">
          <Zap className="w-3 h-3 text-amber-400" />
          <span>{collisionCount} va chạm hiệu quả/s</span>
        </div>
      </div>

      {/* Chemistry pedagogical explanation */}
      <div className="text-[11px] text-slate-300 leading-relaxed bg-slate-800/50 p-2 rounded-lg border border-slate-700/50">
        <p className="font-semibold text-slate-200 mb-0.5">Cơ chế ở cấp độ hạt (GDPT 2018):</p>
        <p>
          Các ion <span className="text-sky-300 font-mono">H⁺</span> chuyển động hỗn loạn trong dung dịch. Khi va chạm với bề mặt nguyên tử <span className="text-slate-300 font-mono">Zn</span> với năng lượng đủ lớn ($\ge E_a$), xảy ra truyền electron:
        </p>
        <div className="text-center font-mono my-1 py-1 px-2 rounded bg-slate-900/70 border border-slate-800 text-amber-300 font-semibold">
          Zn + 2H⁺ ➔ Zn²⁺ (tan) + H₂↑ (bay đi)
        </div>
        <p className="text-[10px] text-slate-400 italic">
          * Tăng nồng độ làm tăng mật độ ion H⁺ ➔ tăng tần số va chạm.
          * Tăng nhiệt độ làm hạt chuyển động nhanh hơn và tăng tỉ lệ va chạm vượt ngưỡng năng lượng hoạt hóa ($E_a$).
        </p>
      </div>
    </div>
  );
};
