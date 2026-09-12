import React from 'react';
import { BookOpen, X, CheckCircle, Flame, Droplets, Layers, Zap } from 'lucide-react';

interface TheoryGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TheoryGuideModal: React.FC<TheoryGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-slate-800/90 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2 text-cyan-400">
            <BookOpen className="w-5 h-5" />
            <h3 className="font-bold text-base text-slate-100">
              Kiến Thức Trọng Tâm: Tốc Độ Phản Ứng (Hóa Học 10 GDPT 2018)
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
          {/* Reaction intro */}
          <div className="bg-cyan-950/30 border border-cyan-500/30 p-3.5 rounded-xl">
            <h4 className="font-bold text-cyan-300 text-sm mb-1">1. Phản ứng hóa học khảo sát</h4>
            <div className="font-mono text-center py-2 bg-slate-950/80 rounded-lg text-amber-300 font-bold text-sm sm:text-base border border-slate-800">
              Zn(s) + 2HCl(aq) ➔ ZnCl₂(aq) + H₂(g)↑
            </div>
            <p className="mt-2 text-slate-400 text-xs">
              - Hiện tượng: Mảnh kẽm tan dần, có bọt khí không màu (H₂) sủi mạnh thoát ra, dung dịch tỏa nhiệt (Δ<sub>r</sub>H°<sub>298</sub> = -152.4 kJ/mol).
            </p>
          </div>

          {/* 3 Factors */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-200 text-sm flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              2. Các yếu tố ảnh hưởng đến tốc độ phản ứng
            </h4>

            {/* Factor 1: Concentration */}
            <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60 flex gap-3 items-start">
              <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 shrink-0">
                <Droplets className="w-5 h-5" />
              </div>
              <div>
                <h5 className="font-semibold text-cyan-300 mb-0.5">Ảnh hưởng của Nồng độ dung dịch HCl (0.5M ➔ 1M ➔ 2M)</h5>
                <p className="text-xs text-slate-300">
                  Khi tăng nồng độ ion $H^+$ trong dung dịch, mật độ hạt tăng lên ➔ Tần số va chạm giữa các hạt ion $H^+$ và bề mặt kẽm tăng lên ➔ Số va chạm hiệu quả trong một đơn vị thời gian tăng ➔ <strong>Tốc độ phản ứng tăng mạnh</strong> (bọt khí thoát ra nhiều và dồn dập hơn).
                </p>
              </div>
            </div>

            {/* Factor 2: Temperature */}
            <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60 flex gap-3 items-start">
              <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400 shrink-0">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <h5 className="font-semibold text-orange-300 mb-0.5">Ảnh hưởng của Nhiệt độ (Đèn cồn đun nóng)</h5>
                <p className="text-xs text-slate-300">
                  Khi tăng nhiệt độ, động năng trung bình của các phân tử và ion tăng lên. Tỉ lệ các hạt có năng lượng vượt qua ngưỡng <strong>năng lượng hoạt hóa ($E_a$)</strong> tăng theo hàm số mũ ➔ Số va chạm hiệu quả tăng nhanh ➔ <strong>Tốc độ phản ứng tăng vọt</strong> (Quy tắc van 't Hoff: Khi nhiệt độ tăng $10^\circ C$, tốc độ phản ứng tăng từ 2 đến 4 lần).
                </p>
              </div>
            </div>

            {/* Factor 3: Surface Area */}
            <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60 flex gap-3 items-start">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 shrink-0">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h5 className="font-semibold text-amber-300 mb-0.5">Ảnh hưởng của Diện tích bề mặt (Zn Viên vs Zn Bột)</h5>
                <p className="text-xs text-slate-300">
                  Kẽm ở dạng bột mịn có tổng diện tích tiếp xúc với dung dịch acid lớn hơn rất nhiều so với kẽm hạt/viên cùng khối lượng ➔ Nhiều nguyên tử kẽm ở bề mặt sẵn sàng va chạm với ion $H^+$ cùng lúc ➔ <strong>Kẽm bột phản ứng mãnh liệt hơn nhiều so với kẽm hạt</strong>.
                </p>
              </div>
            </div>
          </div>

          {/* Safety rules in GDPT */}
          <div className="bg-red-950/20 border border-red-500/30 p-3 rounded-xl text-xs space-y-1">
            <h5 className="font-bold text-red-300">3. Quy tắc an toàn thực hành thí nghiệm THPT:</h5>
            <ul className="list-disc pl-4 space-y-1 text-slate-300">
              <li>Luôn đeo kính bảo hộ và găng tay vì acid HCl có tính ăn mòn và bốc khói kích ứng.</li>
              <li>Không đun nóng đáy ống nghiệm khô không có chất lỏng.</li>
              <li>Hướng miệng ống nghiệm về phía không có người khi đun nóng hoặc thử khí.</li>
              <li>Thử khí $H_2$ bằng ống nghiệm nhỏ với thể tích vừa phải để tránh gây nổ lớn nguy hiểm.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-800/90 border-t border-slate-700 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold shadow-md transition-all"
          >
            Đã hiểu, quay lại thí nghiệm
          </button>
        </div>
      </div>
    </div>
  );
};
