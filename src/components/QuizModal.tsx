import React, { useState } from 'react';
import { Sparkles, X, CheckCircle2, XCircle, Award, RotateCcw } from 'lucide-react';
import { labAudio } from '../utils/audio.ts';

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Question {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const questions: Question[] = [
  {
    id: 1,
    question: 'Khi thực hiện thí nghiệm với dung dịch HCl 2.0M so với dung dịch HCl 0.5M ở cùng điều kiện nhiệt độ và khối lượng Zn, hiện tượng nào sau đây đúng?',
    options: [
      'Bọt khí H₂ thoát ra với tốc độ nhanh hơn nhiều ở HCl 2.0M',
      'Bọt khí H₂ thoát ra chậm hơn ở HCl 2.0M',
      'Tốc độ thoát khí ở hai nồng độ hoàn toàn như nhau',
      'Không có khí thoát ra ở nồng độ HCl 0.5M'
    ],
    correctIndex: 0,
    explanation: 'Nồng độ chất phản ứng càng lớn thì mật độ hạt càng cao, tần số va chạm hiệu quả giữa H⁺ và Zn tăng lên, làm tốc độ phản ứng tăng.'
  },
  {
    id: 2,
    question: 'Vì sao cùng một khối lượng kẽm (1.0g), kẽm dạng bột lại làm dung dịch sủi bọt khí H₂ mãnh liệt hơn so với kẽm dạng hạt (viên)?',
    options: [
      'Kẽm bột có khối lượng mol nhỏ hơn',
      'Kẽm bột có tổng diện tích bề mặt tiếp xúc lớn hơn rất nhiều so với kẽm viên',
      'Kẽm bột phản ứng ở nhiệt độ thấp hơn kẽm viên',
      'Kẽm viên có lẫn tạp chất làm giảm tốc độ phản ứng'
    ],
    correctIndex: 1,
    explanation: 'Kẽm bột phân tán mịn nên tổng diện tích bề mặt tiếp xúc với dung dịch acid tăng vượt trội, tạo ra nhiều vị trí va chạm hoạt động cùng lúc.'
  },
  {
    id: 3,
    question: 'Theo thuyết va chạm hoạt động (Collision Theory), yếu tố nào sau đây giải thích vì sao khi đun nóng ống nghiệm, tốc độ phản ứng tăng vọt?',
    options: [
      'Làm giảm thể tích dung dịch acid',
      'Làm giảm năng lượng hoạt hóa Ea của phản ứng',
      'Tăng động năng các hạt, làm tăng tỉ lệ va chạm có năng lượng lớn hơn năng lượng hoạt hóa (E ≥ Ea)',
      'Làm ion Zn²⁺ bay hơi nhanh hơn'
    ],
    correctIndex: 2,
    explanation: 'Nhiệt độ tăng làm tăng tốc độ chuyển động phân tử và đặc biệt là làm tăng phần trăm số va chạm hiệu quả vượt qua rào cản năng lượng hoạt hóa Ea.'
  },
  {
    id: 4,
    question: 'Để nhận biết khí Hydrogen (H₂) sinh ra từ thí nghiệm, người ta thường dùng phương pháp nào sau đây?',
    options: [
      'Dẫn qua nước vôi trong thấy vẩn đục',
      'Đưa que đóm đang cháy vào miệng ống nghiệm, nghe tiếng nổ "pốp" nhẹ',
      'Làm quỳ tím ẩm hóa xanh',
      'Làm đổi màu dung dịch thuốc tím KMnO₄'
    ],
    correctIndex: 1,
    explanation: 'Khí H₂ nhẹ hơn không khí, tạo hỗn hợp nổ với oxy không khí theo tỉ lệ 2:1 và cháy với ngọn lửa màu xanh nhạt kèm tiếng nổ "pốp" đặc trưng.'
  }
];

export const QuizModal: React.FC<QuizModalProps> = ({ isOpen, onClose }) => {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);

  if (!isOpen) return null;

  const handleSelect = (qId: number, optionIdx: number) => {
    if (showResults) return;
    setSelectedAnswers(prev => ({ ...prev, [qId]: optionIdx }));
    labAudio.playClick();
  };

  const calculateScore = () => {
    let score = 0;
    questions.forEach(q => {
      if (selectedAnswers[q.id] === q.correctIndex) {
        score++;
      }
    });
    return score;
  };

  const handleFinish = () => {
    setShowResults(true);
    const score = calculateScore();
    if (score >= 3) {
      labAudio.playPopTest();
    } else {
      labAudio.playSafetyWarning();
    }
  };

  const handleResetQuiz = () => {
    setSelectedAnswers({});
    setShowResults(false);
  };

  const score = calculateScore();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-slate-800/90 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-400">
            <Sparkles className="w-5 h-5" />
            <h3 className="font-bold text-base text-slate-100">
              Câu Hỏi Củng Cố Kiến Thức (Trắc Nghiệm GDPT 2018)
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

        {/* Questions list */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs sm:text-sm text-slate-300">
          {showResults && (
            <div className="bg-indigo-950/40 border border-indigo-500/40 p-4 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-100 text-sm">Kết quả bài trắc nghiệm</h4>
                  <p className="text-xs text-indigo-300 mt-0.5">
                    Bạn đạt <span className="font-bold text-white text-sm">{score}/{questions.length}</span> câu chính xác ({Math.round((score / questions.length) * 100)}%)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleResetQuiz}
                className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                Làm lại
              </button>
            </div>
          )}

          {questions.map((q, qIndex) => {
            const chosen = selectedAnswers[q.id];
            const isAnswered = chosen !== undefined;
            const isCorrect = chosen === q.correctIndex;

            return (
              <div key={q.id} className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60 space-y-3">
                <div className="font-semibold text-slate-100 flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-700 text-cyan-300 text-xs flex items-center justify-center shrink-0 mt-0.5">
                    {qIndex + 1}
                  </span>
                  <span>{q.question}</span>
                </div>

                {/* Options */}
                <div className="space-y-1.5 pl-7">
                  {q.options.map((opt, optIdx) => {
                    const isSelected = chosen === optIdx;
                    let optionStyle = 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750';

                    if (showResults) {
                      if (optIdx === q.correctIndex) {
                        optionStyle = 'bg-emerald-950/60 border-emerald-500/80 text-emerald-200 font-medium';
                      } else if (isSelected && !isCorrect) {
                        optionStyle = 'bg-red-950/60 border-red-500/80 text-red-200';
                      } else {
                        optionStyle = 'opacity-50 border-slate-800 text-slate-400';
                      }
                    } else if (isSelected) {
                      optionStyle = 'bg-cyan-950/60 border-cyan-500/80 text-cyan-200 font-medium';
                    }

                    return (
                      <button
                        key={optIdx}
                        type="button"
                        onClick={() => handleSelect(q.id, optIdx)}
                        className={`w-full text-left p-2.5 rounded-lg border text-xs sm:text-sm flex items-center justify-between transition-all ${optionStyle}`}
                      >
                        <span>{opt}</span>
                        {showResults && optIdx === q.correctIndex && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />
                        )}
                        {showResults && isSelected && !isCorrect && (
                          <XCircle className="w-4 h-4 text-red-400 shrink-0 ml-2" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Explanation */}
                {showResults && (
                  <div className="mt-2 text-xs bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 text-slate-400 leading-relaxed">
                    <strong className="text-cyan-400">Giải thích chi tiết: </strong>
                    {q.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-800/90 border-t border-slate-700 flex justify-between items-center">
          <span className="text-xs text-slate-400">
            Đã trả lời: {Object.keys(selectedAnswers).length}/{questions.length} câu
          </span>
          <div className="flex gap-2">
            {!showResults ? (
              <button
                type="button"
                onClick={handleFinish}
                disabled={Object.keys(selectedAnswers).length < questions.length}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-xs font-semibold shadow-md transition-all"
              >
                Chấm điểm & Xem giải thích
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-semibold transition-all"
              >
                Đóng
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
