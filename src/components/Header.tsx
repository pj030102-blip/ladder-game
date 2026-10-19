import React, { useState } from 'react';
import { Volume2, VolumeX, HelpCircle, GraduationCap, Sparkles } from 'lucide-react';
import { soundManager } from '../utils/sound';

interface HeaderProps {
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenRules: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  soundEnabled,
  onToggleSound,
  onOpenRules,
}) => {
  return (
    <header className="w-full bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40 px-4 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-500 to-amber-400 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg md:text-xl font-bold text-white tracking-tight flex items-center gap-1.5">
                캠퍼스 사다리타기
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 font-medium">
                  대학생 맞춤
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              조별과제 역할분담 · 커피 내기 · 술자리 벌칙 · 100% 공정 보장
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              soundManager.playClick();
              onOpenRules();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-lg transition-all"
            title="게임 가이드 및 꿀팁"
          >
            <HelpCircle className="w-4 h-4 text-indigo-400" />
            <span className="hidden sm:inline">게임 꿀팁</span>
          </button>

          <button
            onClick={() => {
              onToggleSound();
              soundManager.playClick();
            }}
            className={`p-2 rounded-lg border transition-all ${
              soundEnabled
                ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-300 hover:bg-indigo-600/30'
                : 'bg-slate-800/80 border-slate-700 text-slate-500 hover:text-slate-400'
            }`}
            title={soundEnabled ? '효과음 끄기' : '효과음 켜기'}
            aria-label="효과음 토글"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
