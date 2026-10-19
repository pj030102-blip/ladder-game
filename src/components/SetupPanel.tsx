import React from 'react';
import { Users, Shuffle, Plus, Minus, Dices, AlertCircle, Sparkles, ArrowRight } from 'lucide-react';
import { LadderDensity, Player, Prize } from '../types/ladder';
import { FUN_PENALTIES, FUN_STUDENT_NICKNAMES, PLAYER_COLORS, STUDENT_AVATARS } from '../constants/presets';
import { soundManager } from '../utils/sound';

interface SetupPanelProps {
  players: Player[];
  prizes: Prize[];
  density: LadderDensity;
  onUpdatePlayers: (players: Player[]) => void;
  onUpdatePrizes: (prizes: Prize[]) => void;
  onUpdateDensity: (density: LadderDensity) => void;
  onStartGame: () => void;
}

export const SetupPanel: React.FC<SetupPanelProps> = ({
  players,
  prizes,
  density,
  onUpdatePlayers,
  onUpdatePrizes,
  onUpdateDensity,
  onStartGame,
}) => {
  const playerCount = players.length;

  // Change player count (2 to 12)
  const handleCountChange = (newCount: number) => {
    if (newCount < 2 || newCount > 12) return;
    soundManager.playClick();

    if (newCount > playerCount) {
      // Add players and prizes
      const addedPlayers: Player[] = [];
      const addedPrizes: Prize[] = [];

      for (let i = playerCount; i < newCount; i++) {
        const color = PLAYER_COLORS[i % PLAYER_COLORS.length];
        const avatar = STUDENT_AVATARS[i % STUDENT_AVATARS.length];
        const randomNick = FUN_STUDENT_NICKNAMES[Math.floor(Math.random() * FUN_STUDENT_NICKNAMES.length)];
        
        addedPlayers.push({
          id: `player-${Date.now()}-${i}`,
          name: `${randomNick} ${i + 1}`,
          avatar,
          color,
        });

        addedPrizes.push({
          id: `prize-${Date.now()}-${i}`,
          text: i % 2 === 0 ? '✨ 면제' : '💥 벌칙',
          isPenalty: i % 2 !== 0,
        });
      }

      onUpdatePlayers([...players, ...addedPlayers]);
      onUpdatePrizes([...prizes, ...addedPrizes]);
    } else {
      // Trim players and prizes
      onUpdatePlayers(players.slice(0, newCount));
      onUpdatePrizes(prizes.slice(0, newCount));
    }
  };

  // Randomize all nicknames with funny college tropes
  const handleRandomizeNicknames = () => {
    soundManager.playClick();
    const shuffledNicknames = [...FUN_STUDENT_NICKNAMES].sort(() => 0.5 - Math.random());
    const shuffledAvatars = [...STUDENT_AVATARS].sort(() => 0.5 - Math.random());

    const updated = players.map((player, idx) => ({
      ...player,
      name: shuffledNicknames[idx % shuffledNicknames.length],
      avatar: shuffledAvatars[idx % shuffledAvatars.length],
    }));

    onUpdatePlayers(updated);
  };

  // Shuffle player order
  const handleShufflePlayerOrder = () => {
    soundManager.playClick();
    const shuffled = [...players].sort(() => 0.5 - Math.random());
    onUpdatePlayers(shuffled);
  };

  // Randomize penalties with fun college tasks
  const handleRandomizePenalties = () => {
    soundManager.playClick();
    const shuffledPenalties = [...FUN_PENALTIES].sort(() => 0.5 - Math.random());
    const updated = prizes.map((prize, idx) => {
      if (idx === 0) {
        return { ...prize, text: '🎉 1등 (완전 면제)', isPenalty: false };
      }
      return {
        ...prize,
        text: shuffledPenalties[idx % shuffledPenalties.length],
        isPenalty: true,
      };
    });
    onUpdatePrizes(updated);
  };

  // Shuffle prize positions
  const handleShufflePrizes = () => {
    soundManager.playClick();
    const shuffled = [...prizes].sort(() => 0.5 - Math.random());
    onUpdatePrizes(shuffled);
  };

  const handlePlayerNameChange = (index: number, newName: string) => {
    const updated = [...players];
    updated[index] = { ...updated[index], name: newName };
    onUpdatePlayers(updated);
  };

  const handlePlayerAvatarCycle = (index: number) => {
    soundManager.playClick();
    const currentAvatar = players[index].avatar;
    const currentIdx = STUDENT_AVATARS.indexOf(currentAvatar);
    const nextAvatar = STUDENT_AVATARS[(currentIdx + 1) % STUDENT_AVATARS.length];
    const updated = [...players];
    updated[index] = { ...updated[index], avatar: nextAvatar };
    onUpdatePlayers(updated);
  };

  const handlePrizeTextChange = (index: number, newText: string) => {
    const updated = [...prizes];
    updated[index] = { ...updated[index], text: newText };
    onUpdatePrizes(updated);
  };

  const handleTogglePrizePenalty = (index: number) => {
    soundManager.playClick();
    const updated = [...prizes];
    updated[index] = { ...updated[index], isPenalty: !updated[index].isPenalty };
    onUpdatePrizes(updated);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 md:p-6 shadow-xl space-y-6">
      {/* Top Controls: Player Count & Ladder Density */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-slate-800">
        {/* Player Count */}
        <div className="flex items-center justify-between bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
          <div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-400" />
              <label className="text-sm font-semibold text-slate-200">
                참가 인원수
              </label>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">최소 2명 ~ 최대 12명</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCountChange(playerCount - 1)}
              disabled={playerCount <= 2}
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-slate-200 font-bold transition-colors"
              aria-label="인원 감소"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-8 text-center text-base font-bold text-white">
              {playerCount}명
            </span>
            <button
              onClick={() => handleCountChange(playerCount + 1)}
              disabled={playerCount >= 12}
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-slate-200 font-bold transition-colors"
              aria-label="인원 증가"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Ladder Density */}
        <div className="flex items-center justify-between bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
          <div>
            <div className="flex items-center gap-2">
              <Dices className="w-4 h-4 text-amber-400" />
              <label className="text-sm font-semibold text-slate-200">
                사다리 꼬임 난이도
              </label>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">다리 개수 및 예측 불가성</p>
          </div>

          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
            {(['easy', 'normal', 'crazy'] as LadderDensity[]).map((d) => {
              const labels: Record<LadderDensity, string> = {
                easy: '초간단',
                normal: '보통',
                crazy: '헬모드🔥',
              };
              const isSelected = density === d;
              return (
                <button
                  key={d}
                  onClick={() => {
                    soundManager.playClick();
                    onUpdateDensity(d);
                  }}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-sm font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {labels[d]}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Inputs Section: Side-by-side or stacked */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Players Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center text-xs font-bold">
                1
              </span>
              <h3 className="text-sm font-bold text-slate-200">
                참가자 명단 ({players.length}명)
              </h3>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleRandomizeNicknames}
                className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-amber-300 bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30 rounded-lg transition-colors"
                title="대학생 밈/별명으로 자동 생성"
              >
                <Sparkles className="w-3 h-3" />
                <span>대학생 별명</span>
              </button>
              <button
                onClick={handleShufflePlayerOrder}
                className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
                title="참가자 순서 뒤섞기"
              >
                <Shuffle className="w-3 h-3" />
                <span>순서 섞기</span>
              </button>
            </div>
          </div>

          <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
            {players.map((player, idx) => (
              <div
                key={player.id}
                className="flex items-center gap-2 p-2 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition-colors"
              >
                {/* Index & Color Bar */}
                <div
                  className="w-2.5 h-7 rounded-full shrink-0"
                  style={{ backgroundColor: player.color }}
                  title={`플레이어 ${idx + 1} 색상`}
                />
                
                {/* Avatar Cycle Button */}
                <button
                  type="button"
                  onClick={() => handlePlayerAvatarCycle(idx)}
                  className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 flex items-center justify-center text-base shrink-0 transition-transform active:scale-95"
                  title="클릭하여 이모지 변경"
                >
                  {player.avatar}
                </button>

                {/* Name Input */}
                <input
                  type="text"
                  value={player.name}
                  onChange={(e) => handlePlayerNameChange(idx, e.target.value)}
                  placeholder={`참가자 ${idx + 1}`}
                  maxLength={15}
                  className="flex-1 bg-transparent border-none text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded px-2 py-1"
                />

                <span className="text-[11px] text-slate-500 pr-1">#{idx + 1}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Prizes & Penalties Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center text-xs font-bold">
                2
              </span>
              <h3 className="text-sm font-bold text-slate-200">
                벌칙 & 결과 ({prizes.length}개)
              </h3>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleRandomizePenalties}
                className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-lg transition-colors"
                title="재미있는 대학생 벌칙으로 자동 생성"
              >
                <Sparkles className="w-3 h-3" />
                <span>벌칙 추천</span>
              </button>
              <button
                onClick={handleShufflePrizes}
                className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
                title="결과 순서 뒤섞기"
              >
                <Shuffle className="w-3 h-3" />
                <span>결과 섞기</span>
              </button>
            </div>
          </div>

          <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
            {prizes.map((prize, idx) => (
              <div
                key={prize.id}
                className={`flex items-center gap-2 p-2 rounded-xl bg-slate-950/70 border transition-colors ${
                  prize.isPenalty ? 'border-rose-950/60' : 'border-slate-800/80'
                }`}
              >
                <span className="text-xs font-bold text-slate-500 w-6 text-center">
                  {idx + 1}
                </span>

                {/* Prize Text Input */}
                <input
                  type="text"
                  value={prize.text}
                  onChange={(e) => handlePrizeTextChange(idx, e.target.value)}
                  placeholder={`결과/벌칙 ${idx + 1}`}
                  maxLength={30}
                  className="flex-1 bg-transparent border-none text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded px-2 py-1"
                />

                {/* Penalty Toggle Badge */}
                <button
                  type="button"
                  onClick={() => handleTogglePrizePenalty(idx)}
                  className={`text-[11px] px-2 py-1 rounded-lg border font-medium transition-colors shrink-0 ${
                    prize.isPenalty
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                  }`}
                  title="벌칙 여부 토글 (빨간색 강조)"
                >
                  {prize.isPenalty ? '💥 벌칙' : '✨ 안전/보상'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Start Button */}
      <div className="pt-2">
        <button
          onClick={() => {
            soundManager.playClick();
            onStartGame();
          }}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 via-blue-600 to-amber-500 hover:from-indigo-500 hover:via-blue-500 hover:to-amber-400 text-white font-extrabold text-base md:text-lg shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 flex items-center justify-center gap-2 transition-all transform active:scale-[0.99] cursor-pointer"
        >
          <span>사다리 생성하고 게임 시작하기</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
