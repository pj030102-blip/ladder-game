import React, { useState } from 'react';
import { PlayerResult, PresetTheme } from '../types/ladder';
import { soundManager } from '../utils/sound';
import {
  Trophy,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Share2,
  X,
  AlertTriangle,
  Gift,
} from 'lucide-react';

interface ResultModalProps {
  results: PlayerResult[];
  themeTitle: string;
  onClose: () => void;
  onRematchSame: () => void;
  onRematchShufflePrizes: () => void;
}

export const ResultModal: React.FC<ResultModalProps> = ({
  results,
  themeTitle,
  onClose,
  onRematchSame,
  onRematchShufflePrizes,
}) => {
  const [copied, setCopied] = useState(false);

  // Separate penalties and safe/reward
  const penalties = results.filter((r) => r.prize.isPenalty);
  const safe = results.filter((r) => !r.prize.isPenalty);

  // Generate KakaoTalk shareable formatted text
  const handleCopyKakaoText = async () => {
    soundManager.playClick();

    const dateStr = new Date().toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    let text = `🎓 [캠퍼스 사다리타기 최종 결과]\n`;
    text += `📌 종목: ${themeTitle}\n`;
    text += `📅 일시: ${dateStr}\n\n`;

    text += `━━━━━━━━━━━━━━━━━━━━━\n`;
    results.forEach((r, idx) => {
      const penaltyTag = r.prize.isPenalty ? ' 💥(벌칙/당첨)' : ' ✨(안전)';
      text += `${idx + 1}. ${r.playerAvatar} ${r.playerName} 👉 ${r.prize.text}${penaltyTag}\n`;
    });
    text += `━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `✨ 운명에 승복하고 평화로운 캠퍼스 라이프를 누리세요! 🚀`;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-amber-950 p-5 border-b border-slate-800 flex items-center justify-between relative overflow-hidden">
          <div className="flex items-center gap-3 z-10">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 text-2xl shadow-inner">
              <Trophy className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  운명의 사다리 완료
                </span>
              </div>
              <h2 className="text-xl font-extrabold text-white mt-0.5">
                최종 사다리타기 결과표
              </h2>
            </div>
          </div>

          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors z-10 cursor-pointer"
            aria-label="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Results List */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Quick Notice if there are penalty players */}
          {penalties.length > 0 && (
            <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-3 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-bold text-rose-300">
                  벌칙/당첨자 총 {penalties.length}명 확정!
                </p>
                <p className="text-rose-200/80 mt-0.5">
                  {penalties.map((p) => p.playerName).join(', ')} 님은 약속을 지켜주세요 ☕🍕
                </p>
              </div>
            </div>
          )}

          {/* Result Cards */}
          <div className="space-y-2">
            {results.map((r, idx) => (
              <div
                key={r.playerId}
                className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                  r.prize.isPenalty
                    ? 'bg-rose-950/30 border-rose-900/60 hover:border-rose-700'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Player Info */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-xs font-bold text-slate-500 w-4 text-center">
                    {idx + 1}
                  </span>
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0 border"
                    style={{
                      backgroundColor: `${r.playerColor}20`,
                      borderColor: r.playerColor,
                    }}
                  >
                    {r.playerAvatar}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-200 truncate">
                      {r.playerName}
                    </p>
                    <span className="text-[10px] text-slate-500">
                      출발 레일 #{r.startCol + 1}
                    </span>
                  </div>
                </div>

                {/* Arrow */}
                <span className="text-slate-600 text-xs shrink-0">👉</span>

                {/* Prize Info */}
                <div className="text-right shrink-0">
                  <p
                    className={`text-sm font-extrabold ${
                      r.prize.isPenalty ? 'text-rose-400' : 'text-emerald-400'
                    }`}
                  >
                    {r.prize.text}
                  </p>
                  <span
                    className={`inline-block text-[10px] px-1.5 py-0.2 rounded font-semibold mt-0.5 ${
                      r.prize.isPenalty
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    {r.prize.isPenalty ? '벌칙 당첨 💥' : '안전/면제 ✨'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Footer / Actions */}
        <div className="bg-slate-950 p-4 border-t border-slate-800 space-y-2.5">
          {/* Kakao Share Copy Button */}
          <button
            onClick={handleCopyKakaoText}
            className={`w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
              copied
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md shadow-amber-400/20'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>복사 완료! 카톡 단톡방에 붙여넣기 하세요 🎉</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>카카오톡 / 단톡방 공유용 텍스트 복사</span>
              </>
            )}
          </button>

          {/* Rematch Actions */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                soundManager.playClick();
                onRematchSame();
              }}
              className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-indigo-400" />
              <span>같은 멤버 다시 타기</span>
            </button>

            <button
              onClick={() => {
                soundManager.playClick();
                onRematchShufflePrizes();
              }}
              className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>벌칙 섞고 다시 타기</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
