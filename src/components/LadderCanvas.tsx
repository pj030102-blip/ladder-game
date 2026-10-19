import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Player, Prize, Rung, LadderPathStep, PlayerResult } from '../types/ladder';
import { soundManager } from '../utils/sound';
import { canPlaceRung } from '../utils/ladderGenerator';
import { Sparkles, Eye, EyeOff, Edit3, Check, Play, Zap, HelpCircle } from 'lucide-react';

interface LadderCanvasProps {
  players: Player[];
  prizes: Prize[];
  numRows: number;
  rungs: Rung[];
  results: PlayerResult[];
  activePlayerId: string | null;
  revealedPlayerIds: Set<string>;
  isBlindMode: boolean;
  isEditRungsMode: boolean;
  onToggleRung: (col: number, row: number) => void;
  onPlayerCompleted: (playerId: string) => void;
  onAllCompleted: () => void;
  onSelectPlayerToTrace: (playerId: string) => void;
}

interface ActiveTokenAnimation {
  playerId: string;
  startCol: number;
  currentCol: number;
  currentRow: number;
  path: LadderPathStep[];
  stepIndex: number;
  progress: number; // 0 to 1 between steps
  color: string;
  avatar: string;
  isFinished: boolean;
}

export const LadderCanvas: React.FC<LadderCanvasProps> = ({
  players,
  prizes,
  numRows,
  rungs,
  results,
  activePlayerId,
  revealedPlayerIds,
  isBlindMode,
  isEditRungsMode,
  onToggleRung,
  onPlayerCompleted,
  onAllCompleted,
  onSelectPlayerToTrace,
}) => {
  const numCols = players.length;
  const colSpacing = 110;
  const rowHeight = 44;
  const topPadding = 60;
  const bottomPadding = 70;
  const leftPadding = 60;

  const totalWidth = Math.max(leftPadding * 2 + (numCols - 1) * colSpacing, 600);
  const totalHeight = topPadding + bottomPadding + numRows * rowHeight;

  // Active in-flight animations map: playerId -> ActiveTokenAnimation
  const [animatingTokens, setAnimatingTokens] = useState<Map<string, ActiveTokenAnimation>>(new Map());
  // Completed paths to draw on canvas
  const [completedPlayerIds, setCompletedPlayerIds] = useState<Set<string>>(new Set());

  // Keep ref of results for animation loop
  const resultsRef = useRef(results);
  useEffect(() => {
    resultsRef.current = results;
  }, [results]);

  // Sync revealed players to completed
  useEffect(() => {
    setCompletedPlayerIds(new Set(revealedPlayerIds));
  }, [revealedPlayerIds]);

  // Hover state for editing rungs
  const [hoveredCell, setHoveredCell] = useState<{ col: number; row: number } | null>(null);

  // Trigger tracing a specific player
  const startTracePlayer = useCallback((playerId: string) => {
    const res = resultsRef.current.find((r) => r.playerId === playerId);
    if (!res) return;

    soundManager.playClick();
    onSelectPlayerToTrace(playerId);

    const newAnim: ActiveTokenAnimation = {
      playerId,
      startCol: res.startCol,
      currentCol: res.startCol,
      currentRow: 0,
      path: res.path,
      stepIndex: 0,
      progress: 0,
      color: res.playerColor,
      avatar: res.playerAvatar,
      isFinished: false,
    };

    setAnimatingTokens((prev) => {
      const next = new Map(prev);
      next.set(playerId, newAnim);
      return next;
    });
  }, [onSelectPlayerToTrace]);

  // Check if activePlayerId triggered from outside
  useEffect(() => {
    if (activePlayerId && !revealedPlayerIds.has(activePlayerId)) {
      startTracePlayer(activePlayerId);
    }
  }, [activePlayerId, revealedPlayerIds, startTracePlayer]);

  // Animation frame loop for tokens
  useEffect(() => {
    if (animatingTokens.size === 0) return;

    let animId: number;
    let lastTime = performance.now();

    const updateFrame = (now: number) => {
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      // Speed: each path segment takes ~0.08 - 0.12s
      const speed = 7.5; // steps per second

      setAnimatingTokens((prev) => {
        let hasChanges = false;
        const next = new Map(prev);

        next.forEach((token, pId) => {
          if (token.isFinished) return;

          const totalSteps = token.path.length;
          let newProgress = token.progress + delta * speed;

          let newStepIndex = token.stepIndex;
          if (newProgress >= 1) {
            newStepIndex += Math.floor(newProgress);
            newProgress = newProgress % 1;

            if (newStepIndex < totalSteps) {
              const currentStep = token.path[newStepIndex];
              if (currentStep.isTurn) {
                soundManager.playTurn();
              } else {
                soundManager.playStep(newStepIndex);
              }
            }
          }

          if (newStepIndex >= totalSteps - 1) {
            // Reached destination!
            const res = resultsRef.current.find((r) => r.playerId === pId);
            const isPenalty = res?.prize.isPenalty;
            soundManager.playGoal(isPenalty);

            // Small confetti burst at destination
            if (!isPenalty) {
              try {
                confetti({
                  particleCount: 30,
                  spread: 50,
                  origin: {
                    x: Math.min(Math.max((leftPadding + (res?.endCol || 0) * colSpacing) / window.innerWidth, 0.1), 0.9),
                    y: 0.8,
                  },
                });
              } catch {
                // Ignore if in test env
              }
            }

            token.isFinished = true;
            token.stepIndex = totalSteps - 1;
            token.progress = 1;
            hasChanges = true;

            // Notify parent
            onPlayerCompleted(pId);
            setCompletedPlayerIds((comp) => new Set(comp).add(pId));
          } else {
            token.stepIndex = newStepIndex;
            token.progress = newProgress;
            hasChanges = true;
          }
        });

        // Filter out finished tokens after a brief frame
        let allDone = true;
        next.forEach((tok) => {
          if (!tok.isFinished) allDone = false;
        });

        if (allDone && next.size > 0) {
          // Check if all players completed
          setTimeout(() => {
            setAnimatingTokens(new Map());
          }, 300);
        }

        return hasChanges ? new Map(next) : prev;
      });

      animId = requestAnimationFrame(updateFrame);
    };

    animId = requestAnimationFrame(updateFrame);
    return () => cancelAnimationFrame(animId);
  }, [animatingTokens.size, colSpacing, leftPadding, onPlayerCompleted]);

  // Calculate coordinates
  const getColX = (col: number) => leftPadding + col * colSpacing;
  const getRowY = (row: number) => topPadding + row * rowHeight;

  // Render SVG Path string for a player's path
  const getSvgPathString = (path: LadderPathStep[], maxIndex?: number) => {
    if (!path || path.length === 0) return '';
    const limit = maxIndex !== undefined ? Math.min(maxIndex + 1, path.length) : path.length;
    return path
      .slice(0, limit)
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${getColX(p.col)} ${getRowY(p.row)}`)
      .join(' ');
  };

  // Convert animated token current position to (x, y)
  const getTokenPos = (token: ActiveTokenAnimation) => {
    const curStep = token.path[token.stepIndex] || token.path[0];
    const nextStep = token.path[Math.min(token.stepIndex + 1, token.path.length - 1)] || curStep;

    const x1 = getColX(curStep.col);
    const y1 = getRowY(curStep.row);
    const x2 = getColX(nextStep.col);
    const y2 = getRowY(nextStep.row);

    const t = token.progress;
    return {
      x: x1 + (x2 - x1) * t,
      y: y1 + (y2 - y1) * t,
    };
  };

  return (
    <div className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative">
      {/* Interactive Mode Banner / Helper */}
      {isEditRungsMode && (
        <div className="bg-amber-500/15 border-b border-amber-500/30 px-4 py-2 flex items-center justify-between text-xs text-amber-300">
          <div className="flex items-center gap-2">
            <Edit3 className="w-4 h-4 animate-pulse" />
            <span className="font-bold">사다리 편집 모드:</span>
            <span>사다리 사이를 클릭하여 가로줄을 추가하거나 기존 줄을 클릭해 삭제하세요!</span>
          </div>
          <span className="text-[11px] bg-amber-400/20 px-2 py-0.5 rounded text-amber-200">
            친구와 1개씩 추가하면 꿀잼!
          </span>
        </div>
      )}

      {/* Main Board Scroll Area */}
      <div className="overflow-x-auto w-full py-4 select-none flex justify-center">
        <div
          style={{ width: totalWidth, height: totalHeight }}
          className="relative min-w-full flex justify-center"
        >
          {/* Top Players Row */}
          <div className="absolute top-0 left-0 right-0 z-20 pointer-events-auto">
            {players.map((player, colIdx) => {
              const isRevealed = completedPlayerIds.has(player.id);
              const isCurrentlyTracing = animatingTokens.has(player.id);

              return (
                <div
                  key={player.id}
                  style={{
                    position: 'absolute',
                    left: `${getColX(colIdx)}px`,
                    top: '6px',
                    transform: 'translateX(-50%)',
                    width: '96px',
                  }}
                  className="flex flex-col items-center group cursor-pointer"
                  onClick={() => {
                    if (!isCurrentlyTracing) {
                      startTracePlayer(player.id);
                    }
                  }}
                >
                  <div
                    className={`w-11 h-11 rounded-2xl border-2 flex items-center justify-center text-xl shadow-lg transition-all transform duration-200 relative ${
                      isCurrentlyTracing
                        ? 'scale-110 ring-4 ring-white/50 animate-bounce'
                        : isRevealed
                        ? 'opacity-85 scale-95'
                        : 'group-hover:scale-105 group-hover:-translate-y-1'
                    }`}
                    style={{
                      backgroundColor: `${player.color}20`,
                      borderColor: player.color,
                      boxShadow: `0 8px 16px ${player.color}35`,
                    }}
                  >
                    <span>{player.avatar}</span>
                    {/* Status Badge */}
                    {isRevealed && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[9px] font-bold">
                        ✓
                      </span>
                    )}
                  </div>

                  <span
                    className="text-xs font-bold text-slate-200 mt-1 truncate max-w-[92px] text-center"
                    title={player.name}
                  >
                    {player.name}
                  </span>

                  {/* Start hint label */}
                  {!isRevealed && !isCurrentlyTracing && (
                    <span
                      className="text-[10px] text-indigo-400 group-hover:text-indigo-300 font-medium opacity-80 group-hover:opacity-100 flex items-center gap-0.5 mt-0.5 transition-opacity"
                    >
                      <Play className="w-2.5 h-2.5 fill-current" />
                      출발
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* SVG Ladder Elements */}
          <svg
            width={totalWidth}
            height={totalHeight}
            className="absolute inset-0 pointer-events-none"
          >
            <defs>
              <linearGradient id="railGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#475569" stopOpacity="0.4" />
                <stop offset="50%" stopColor="#64748B" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#475569" stopOpacity="0.4" />
              </linearGradient>

              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Vertical Rails */}
            {Array.from({ length: numCols }).map((_, col) => {
              const x = getColX(col);
              const y1 = getRowY(0);
              const y2 = getRowY(numRows);
              return (
                <g key={`rail-${col}`}>
                  {/* Outer track line */}
                  <line
                    x1={x}
                    y1={y1}
                    x2={x}
                    y2={y2}
                    stroke="#1E293B"
                    strokeWidth="8"
                    strokeLinecap="round"
                  />
                  {/* Core rail line */}
                  <line
                    x1={x}
                    y1={y1}
                    x2={x}
                    y2={y2}
                    stroke="url(#railGrad)"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                  {/* Top connector circle */}
                  <circle cx={x} cy={y1} r="4" fill="#94A3B8" />
                  {/* Bottom connector circle */}
                  <circle cx={x} cy={y2} r="4" fill="#94A3B8" />
                </g>
              );
            })}

            {/* Horizontal Rungs (Bridges) */}
            {rungs.map((rung) => {
              const x1 = getColX(rung.col);
              const x2 = getColX(rung.col + 1);
              const y = getRowY(rung.row + 0.5);

              return (
                <g key={rung.id}>
                  {/* Background shadow line */}
                  <line
                    x1={x1}
                    y1={y}
                    x2={x2}
                    y2={y}
                    stroke="#0F172A"
                    strokeWidth="7"
                    strokeLinecap="round"
                  />
                  {/* Main horizontal rung */}
                  <line
                    x1={x1}
                    y1={y}
                    x2={x2}
                    y2={y}
                    stroke="#CBD5E1"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                  {/* Joint rivets */}
                  <circle cx={x1} cy={y} r="3" fill="#E2E8F0" />
                  <circle cx={x2} cy={y} r="3" fill="#E2E8F0" />
                </g>
              );
            })}

            {/* Completed Static Traced Paths */}
            {results.map((res) => {
              if (!completedPlayerIds.has(res.playerId)) return null;
              const d = getSvgPathString(res.path);
              return (
                <g key={`completed-path-${res.playerId}`}>
                  {/* Halo glow */}
                  <path
                    d={d}
                    fill="none"
                    stroke={res.playerColor}
                    strokeWidth="7"
                    strokeOpacity="0.3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Vibrant inner path */}
                  <path
                    d={d}
                    fill="none"
                    stroke={res.playerColor}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </g>
              );
            })}

            {/* In-Flight Active Animated Paths */}
            {Array.from(animatingTokens.values()).map((token) => {
              const curPos = getTokenPos(token);
              const dPartial = getSvgPathString(token.path, token.stepIndex);
              const curD = `${dPartial} L ${curPos.x} ${curPos.y}`;

              return (
                <g key={`anim-path-${token.playerId}`}>
                  {/* Glowing line */}
                  <path
                    d={curD}
                    fill="none"
                    stroke={token.color}
                    strokeWidth="8"
                    strokeOpacity="0.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    filter="url(#glow)"
                  />
                  <path
                    d={curD}
                    fill="none"
                    stroke={token.color}
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </g>
              );
            })}
          </svg>

          {/* Interactive Rung Editing Grid Overlay */}
          {isEditRungsMode && (
            <div
              className="absolute inset-0 z-30 pointer-events-auto"
              style={{
                top: `${topPadding}px`,
                height: `${numRows * rowHeight}px`,
              }}
            >
              {Array.from({ length: numRows }).map((_, rIdx) => (
                <div key={`edit-row-${rIdx}`} className="absolute w-full" style={{ top: `${rIdx * rowHeight}px`, height: `${rowHeight}px` }}>
                  {Array.from({ length: numCols - 1 }).map((_, cIdx) => {
                    const x1 = getColX(cIdx);
                    const x2 = getColX(cIdx + 1);
                    const exists = rungs.some((r) => r.col === cIdx && r.row === rIdx);
                    const isAllowed = exists || canPlaceRung(rungs, cIdx, rIdx, numCols);

                    return (
                      <button
                        key={`cell-${cIdx}-${rIdx}`}
                        type="button"
                        onClick={() => {
                          if (isAllowed) {
                            soundManager.playClick();
                            onToggleRung(cIdx, rIdx);
                          }
                        }}
                        onMouseEnter={() => setHoveredCell({ col: cIdx, row: rIdx })}
                        onMouseLeave={() => setHoveredCell(null)}
                        style={{
                          position: 'absolute',
                          left: `${x1}px`,
                          width: `${x2 - x1}px`,
                          top: '0px',
                          height: `${rowHeight}px`,
                        }}
                        disabled={!isAllowed}
                        className={`flex items-center justify-center transition-all ${
                          !isAllowed
                            ? 'cursor-not-allowed opacity-20'
                            : exists
                            ? 'cursor-pointer hover:bg-rose-500/20'
                            : 'cursor-pointer hover:bg-indigo-500/20'
                        }`}
                        title={
                          exists
                            ? '클릭하여 다리 삭제'
                            : isAllowed
                            ? '클릭하여 새 다리 놓기'
                            : '인접한 칸과 연결될 수 없습니다'
                        }
                      >
                        {exists ? (
                          <span className="w-5 h-5 rounded-full bg-rose-600/80 hover:bg-rose-500 text-white flex items-center justify-center text-xs font-bold opacity-0 hover:opacity-100 transition-opacity shadow">
                            ✕
                          </span>
                        ) : isAllowed && (
                          <span className="w-5 h-5 rounded-full bg-indigo-600/70 hover:bg-indigo-500 text-white flex items-center justify-center text-xs font-bold opacity-0 hover:opacity-100 transition-opacity shadow">
                            +
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          )}

          {/* Blind Mode Mystery Veil */}
          {isBlindMode && (
            <div
              className="absolute z-10 pointer-events-none rounded-xl overflow-hidden backdrop-blur-md transition-all duration-300"
              style={{
                left: `${leftPadding - 20}px`,
                width: `${(numCols - 1) * colSpacing + 40}px`,
                top: `${topPadding + 20}px`,
                height: `${numRows * rowHeight - 40}px`,
                background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.94) 0%, rgba(30, 41, 59, 0.97) 50%, rgba(15, 23, 42, 0.94) 100%)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                boxShadow: 'inset 0 0 40px rgba(79, 70, 229, 0.15)',
              }}
            >
              <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-indigo-300/80">
                <EyeOff className="w-8 h-8 animate-pulse text-indigo-400" />
                <span className="text-xs font-bold tracking-wider text-indigo-200">
                  🙈 블라인드 모드 작동 중
                </span>
                <span className="text-[11px] text-slate-400">
                  사다리와 결과가 비밀에 부쳐집니다!
                </span>
              </div>
            </div>
          )}

          {/* In-Flight Token Avatars */}
          {Array.from(animatingTokens.values()).map((token) => {
            const pos = getTokenPos(token);
            return (
              <div
                key={`moving-token-${token.playerId}`}
                style={{
                  position: 'absolute',
                  left: `${pos.x}px`,
                  top: `${pos.y}px`,
                  transform: 'translate(-50%, -50%)',
                }}
                className="z-30 pointer-events-none"
              >
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl shadow-2xl border-2 transform -rotate-6 transition-transform"
                  style={{
                    backgroundColor: token.color,
                    borderColor: '#ffffff',
                    boxShadow: `0 0 20px ${token.color}`,
                  }}
                >
                  <span className="animate-spin-slow">{token.avatar}</span>
                </div>
              </div>
            );
          })}

          {/* Bottom Prizes Row */}
          <div
            className="absolute left-0 right-0 z-20 pointer-events-auto"
            style={{ top: `${topPadding + numRows * rowHeight + 12}px` }}
          >
            {prizes.map((prize, colIdx) => {
              // Find who reached this prize
              const winnerResult = results.find(
                (r) => r.endCol === colIdx && completedPlayerIds.has(r.playerId)
              );
              const isRevealed = Boolean(winnerResult) || !isBlindMode;

              return (
                <div
                  key={prize.id}
                  style={{
                    position: 'absolute',
                    left: `${getColX(colIdx)}px`,
                    transform: 'translateX(-50%)',
                    width: '102px',
                  }}
                  className="flex flex-col items-center"
                >
                  {/* Connecting indicator node */}
                  <div
                    className={`w-3 h-3 rounded-full mb-1 transition-colors ${
                      winnerResult
                        ? 'bg-amber-400 ring-4 ring-amber-400/40'
                        : 'bg-slate-700'
                    }`}
                  />

                  {/* Prize Card */}
                  <div
                    className={`w-full p-2.5 rounded-xl border text-center transition-all duration-300 relative ${
                      winnerResult
                        ? winnerResult.prize.isPenalty
                          ? 'bg-gradient-to-b from-rose-950/90 to-slate-900 border-rose-500/80 shadow-lg shadow-rose-500/25 ring-1 ring-rose-500'
                          : 'bg-gradient-to-b from-emerald-950/90 to-slate-900 border-emerald-500/80 shadow-lg shadow-emerald-500/25 ring-1 ring-emerald-500'
                        : isRevealed
                        ? prize.isPenalty
                          ? 'bg-slate-900/90 border-rose-900/50 hover:border-rose-700'
                          : 'bg-slate-900/90 border-slate-800'
                        : 'bg-slate-900/90 border-indigo-900/50 cursor-pointer hover:border-indigo-500'
                    }`}
                  >
                    {isRevealed ? (
                      <>
                        <p
                          className={`text-xs font-bold leading-tight break-keep ${
                            prize.isPenalty ? 'text-rose-300' : 'text-emerald-300'
                          }`}
                        >
                          {prize.text}
                        </p>
                        {prize.isPenalty && (
                          <span className="inline-block mt-1 text-[9px] px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold">
                            벌칙
                          </span>
                        )}
                      </>
                    ) : (
                      <div className="py-1">
                        <span className="text-sm font-extrabold text-indigo-400 animate-pulse">
                          ❓
                        </span>
                        <p className="text-[10px] text-slate-400 mt-0.5">미공개</p>
                      </div>
                    )}

                    {/* Matched Player Tag Badge */}
                    {winnerResult && (
                      <div
                        className="mt-2 pt-1.5 border-t border-slate-700/60 flex items-center justify-center gap-1 text-[11px] font-bold text-white rounded px-1 py-0.5"
                        style={{ backgroundColor: `${winnerResult.playerColor}30` }}
                      >
                        <span>{winnerResult.playerAvatar}</span>
                        <span className="truncate max-w-[60px]">
                          {winnerResult.playerName}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
