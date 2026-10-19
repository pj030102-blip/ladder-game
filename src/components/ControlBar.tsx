import React from 'react';
import {
  Play,
  Zap,
  Shuffle,
  EyeOff,
  Eye,
  Edit3,
  CheckSquare,
  Settings2,
  FileText,
  RotateCcw,
} from 'lucide-react';
import { soundManager } from '../utils/sound';

interface ControlBarProps {
  unrevealedCount: number;
  totalPlayers: number;
  isBlindMode: boolean;
  isEditRungsMode: boolean;
  onTraceNext: () => void;
  onTraceAll: () => void;
  onToggleBlindMode: () => void;
  onToggleEditRungsMode: () => void;
  onReshuffleLadder: () => void;
  onResetProgress: () => void;
  onOpenSettings: () => void;
  onOpenResults: () => void;
}

export const ControlBar: React.FC<ControlBarProps> = ({
  unrevealedCount,
  totalPlayers,
  isBlindMode,
  isEditRungsMode,
  onTraceNext,
  onTraceAll,
  onToggleBlindMode,
  onToggleEditRungsMode,
  onReshuffleLadder,
  onResetProgress,
  onOpenSettings,
  onOpenResults,
}) => {
  const isAllRevealed = unrevealedCount === 0;

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
      {/* Primary Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left: Play Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {!isAllRevealed ? (
            <>
              <button
                onClick={() => {
                  soundManager.playClick();
                  onTraceNext();
                }}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-md shadow-indigo-600/30 flex items-center gap-2 transition-all transform active:scale-95 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>한 명씩 타기 ({unrevealedCount}명 남음)</span>
              </button>

              <button
                onClick={() => {
                  soundManager.playClick();
                  onTraceAll();
                }}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold text-sm shadow-md shadow-amber-500/25 flex items-center gap-2 transition-all transform active:scale-95 cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>전체 결과 한번에 보기</span>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  soundManager.playClick();
                  onOpenResults();
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-md shadow-emerald-600/30 flex items-center gap-2 transition-all transform active:scale-95 cursor-pointer animate-pulse"
              >
                <FileText className="w-4 h-4" />
                <span>결과 요약 및 카톡 복사 🎉</span>
              </button>

              <button
                onClick={() => {
                  soundManager.playClick();
                  onResetProgress();
                }}
                className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                title="경로만 초기화하고 다시 타기"
              >
                <RotateCcw className="w-4 h-4 text-slate-400" />
                <span>다시 타기</span>
              </button>
            </div>
          )}
        </div>

        {/* Right: Fun Utility Toggles & Reshuffle */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Blind Mode Toggle */}
          <button
            onClick={() => {
              soundManager.playClick();
              onToggleBlindMode();
            }}
            className={`px-3 py-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all ${
              isBlindMode
                ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                : 'bg-slate-800/80 hover:bg-slate-700/80 border-slate-700 text-slate-400'
            }`}
            title="사다리 중간과 결과를 가려 긴장감을 극대화합니다"
          >
            {isBlindMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span>블라인드 {isBlindMode ? 'ON' : 'OFF'}</span>
          </button>

          {/* Edit Rungs Mode Toggle */}
          <button
            onClick={() => {
              soundManager.playClick();
              onToggleEditRungsMode();
            }}
            className={`px-3 py-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all ${
              isEditRungsMode
                ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                : 'bg-slate-800/80 hover:bg-slate-700/80 border-slate-700 text-slate-400'
            }`}
            title="사다리에 직접 다리를 놓거나 제거할 수 있습니다"
          >
            <Edit3 className="w-4 h-4" />
            <span>다리 직접 그리기 {isEditRungsMode ? 'ON' : 'OFF'}</span>
          </button>

          {/* Reshuffle Ladder */}
          <button
            onClick={() => {
              soundManager.playClick();
              onReshuffleLadder();
            }}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            title="멤버와 결과는 유지하고 사다리 선만 새로 꼬기"
          >
            <Shuffle className="w-4 h-4 text-indigo-400" />
            <span>사다리 새로 섞기</span>
          </button>

          {/* Settings / Edit Setup */}
          <button
            onClick={() => {
              soundManager.playClick();
              onOpenSettings();
            }}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            title="인원 수, 이름, 벌칙 내용 수정"
          >
            <Settings2 className="w-4 h-4 text-slate-400" />
            <span>설정</span>
          </button>
        </div>
      </div>

      {/* Quick Progress Bar */}
      <div className="w-full flex items-center gap-3 pt-1">
        <div className="flex-1 h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-300 rounded-full"
            style={{
              width: `${((totalPlayers - unrevealedCount) / totalPlayers) * 100}%`,
            }}
          />
        </div>
        <span className="text-xs font-bold text-slate-400 shrink-0">
          {totalPlayers - unrevealedCount} / {totalPlayers}명 완료
        </span>
      </div>
    </div>
  );
};
