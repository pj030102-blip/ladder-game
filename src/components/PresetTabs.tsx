import React from 'react';
import { PRESET_THEMES } from '../constants/presets';
import { PresetTheme } from '../types/ladder';
import { soundManager } from '../utils/sound';

interface PresetTabsProps {
  currentPresetId: string;
  onSelectPreset: (preset: PresetTheme) => void;
}

export const PresetTabs: React.FC<PresetTabsProps> = ({
  currentPresetId,
  onSelectPreset,
}) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          🔥 대학생 인기 프리셋 테마
        </span>
        <span className="text-xs text-indigo-400">
          원클릭으로 인원/역할 자동 세팅
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {PRESET_THEMES.map((preset) => {
          const isSelected = preset.id === currentPresetId;
          return (
            <button
              key={preset.id}
              onClick={() => {
                soundManager.playClick();
                onSelectPreset(preset);
              }}
              className={`group text-left p-2.5 rounded-xl border transition-all duration-200 relative overflow-hidden ${
                isSelected
                  ? 'bg-gradient-to-b from-indigo-950/80 to-slate-900 border-indigo-500 shadow-md shadow-indigo-500/20 ring-1 ring-indigo-500'
                  : 'bg-slate-900/60 hover:bg-slate-800/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="text-xl group-hover:scale-110 transition-transform">
                  {preset.icon}
                </span>
                <span
                  className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                    isSelected
                      ? 'bg-indigo-500/30 text-indigo-300 border border-indigo-500/40'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {preset.badge}
                </span>
              </div>
              <h4
                className={`text-xs font-bold truncate ${
                  isSelected ? 'text-white' : 'text-slate-300 group-hover:text-white'
                }`}
              >
                {preset.title.replace(/^[^\s]+\s*/, '')}
              </h4>
              <p className="text-[10px] text-slate-400 truncate mt-0.5">
                {preset.playerCount}인 기본
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
