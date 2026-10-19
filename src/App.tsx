import React, { useState, useMemo, useCallback, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  GameStage,
  LadderDensity,
  Player,
  PlayerResult,
  PresetTheme,
  Prize,
  Rung,
} from './types/ladder';
import {
  PLAYER_COLORS,
  PRESET_THEMES,
} from './constants/presets';
import {
  calculateAllResults,
  generateRandomRungs,
  getRowCountByDensity,
} from './utils/ladderGenerator';
import { soundManager } from './utils/sound';
import { Header } from './components/Header';
import { PresetTabs } from './components/PresetTabs';
import { SetupPanel } from './components/SetupPanel';
import { LadderCanvas } from './components/LadderCanvas';
import { ControlBar } from './components/ControlBar';
import { ResultModal } from './components/ResultModal';
import { RulesModal } from './components/RulesModal';
import { Play, Sparkles, Trophy, ArrowLeft, RotateCcw } from 'lucide-react';

export default function App() {
  // Preset selection
  const [selectedPreset, setSelectedPreset] = useState<PresetTheme>(PRESET_THEMES[0]);

  // Sound state
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Modals
  const [showRulesModal, setShowRulesModal] = useState<boolean>(false);
  const [showResultModal, setShowResultModal] = useState<boolean>(false);

  // Density & Dimensions
  const [density, setDensity] = useState<LadderDensity>(PRESET_THEMES[0].density);

  // Initialize Players and Prizes from preset
  const initFromPreset = (preset: PresetTheme) => {
    const newPlayers: Player[] = preset.defaultPlayers.map((p, idx) => ({
      id: `p-${idx}-${Date.now()}`,
      name: p.name,
      avatar: p.avatar,
      color: PLAYER_COLORS[idx % PLAYER_COLORS.length],
    }));

    const newPrizes: Prize[] = preset.defaultPrizes.map((pz, idx) => ({
      id: `pz-${idx}-${Date.now()}`,
      text: pz.text,
      isPenalty: pz.isPenalty,
    }));

    return { newPlayers, newPrizes };
  };

  const initial = useMemo(() => initFromPreset(PRESET_THEMES[0]), []);
  const [players, setPlayers] = useState<Player[]>(initial.newPlayers);
  const [prizes, setPrizes] = useState<Prize[]>(initial.newPrizes);

  // Number of rows
  const numRows = useMemo(
    () => getRowCountByDensity(density, players.length),
    [density, players.length]
  );

  // Ladder Rungs
  const [rungs, setRungs] = useState<Rung[]>(() =>
    generateRandomRungs(players.length, numRows, density)
  );

  // Game UI state
  const [gameStage, setGameStage] = useState<GameStage>('setup');
  const [revealedPlayerIds, setRevealedPlayerIds] = useState<Set<string>>(new Set());
  const [activePlayerId, setActivePlayerId] = useState<string | null>(null);
  const [isBlindMode, setIsBlindMode] = useState<boolean>(false);
  const [isEditRungsMode, setIsEditRungsMode] = useState<boolean>(false);

  // When sound toggles
  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundManager.setIsEnabled(next);
  };

  // Re-calculate ladder results
  const results: PlayerResult[] = useMemo(() => {
    return calculateAllResults(players, prizes, numRows, rungs);
  }, [players, prizes, numRows, rungs]);

  // Handle Preset Selection
  const handleSelectPreset = (preset: PresetTheme) => {
    setSelectedPreset(preset);
    setDensity(preset.density);
    const { newPlayers, newPrizes } = initFromPreset(preset);
    setPlayers(newPlayers);
    setPrizes(newPrizes);

    const rows = getRowCountByDensity(preset.density, newPlayers.length);
    const newRungs = generateRandomRungs(newPlayers.length, rows, preset.density);
    setRungs(newRungs);

    // Reset progress
    setRevealedPlayerIds(new Set());
    setActivePlayerId(null);
    setGameStage('playing');
  };

  // Reshuffle ladder rungs
  const handleReshuffleLadder = () => {
    const newRungs = generateRandomRungs(players.length, numRows, density);
    setRungs(newRungs);
    setRevealedPlayerIds(new Set());
    setActivePlayerId(null);
  };

  // Toggle rung on/off in edit mode
  const handleToggleRung = (col: number, row: number) => {
    setRungs((prev) => {
      const existsIndex = prev.findIndex((r) => r.col === col && r.row === row);
      if (existsIndex >= 0) {
        // Remove
        return prev.filter((_, idx) => idx !== existsIndex);
      } else {
        // Add
        return [
          ...prev,
          {
            id: `manual-${col}-${row}-${Date.now()}`,
            col,
            row,
          },
        ];
      }
    });
    // Invalidate revealed state if ladder changes
    if (revealedPlayerIds.size > 0) {
      setRevealedPlayerIds(new Set());
    }
  };

  // Start game from setup
  const handleStartGame = () => {
    const rows = getRowCountByDensity(density, players.length);
    const newRungs = generateRandomRungs(players.length, rows, density);
    setRungs(newRungs);
    setRevealedPlayerIds(new Set());
    setActivePlayerId(null);
    setGameStage('playing');
  };

  // One player completed walking the ladder
  const handlePlayerCompleted = useCallback(
    (playerId: string) => {
      setRevealedPlayerIds((prev) => {
        const next = new Set(prev);
        next.add(playerId);

        // Check if all players completed
        if (next.size === players.length) {
          setTimeout(() => {
            soundManager.playFanfare();
            try {
              confetti({
                particleCount: 100,
                spread: 80,
                origin: { y: 0.6 },
              });
            } catch {}
            setShowResultModal(true);
          }, 600);
        }
        return next;
      });
      setActivePlayerId(null);
    },
    [players.length]
  );

  // Trace next unrevealed player
  const handleTraceNext = () => {
    const unrevealed = players.find((p) => !revealedPlayerIds.has(p.id));
    if (unrevealed) {
      setActivePlayerId(unrevealed.id);
    }
  };

  // Trace all players simultaneously
  const handleTraceAll = () => {
    players.forEach((p) => {
      if (!revealedPlayerIds.has(p.id)) {
        setActivePlayerId(p.id);
      }
    });
  };

  // Reset just the paths traversed
  const handleResetProgress = () => {
    setRevealedPlayerIds(new Set());
    setActivePlayerId(null);
  };

  // Rematch with same players & prizes
  const handleRematchSame = () => {
    setShowResultModal(false);
    handleReshuffleLadder();
  };

  // Rematch with shuffled prizes
  const handleRematchShufflePrizes = () => {
    setShowResultModal(false);
    setPrizes((prev) => [...prev].sort(() => 0.5 - Math.random()));
    handleReshuffleLadder();
  };

  const unrevealedCount = players.length - revealedPlayerIds.size;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Header */}
      <Header
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        onOpenRules={() => setShowRulesModal(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-6 space-y-6">
        {/* Preset Selector Banner */}
        <PresetTabs
          currentPresetId={selectedPreset.id}
          onSelectPreset={handleSelectPreset}
        />

        {/* View Switch: Setup vs Ladder Playing */}
        {gameStage === 'setup' ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-2">
                  <span>참가자 및 벌칙 설정</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-medium">
                    {selectedPreset.title}
                  </span>
                </h2>
                <p className="text-xs md:text-sm text-slate-400 mt-1">
                  {selectedPreset.description}
                </p>
              </div>
            </div>

            <SetupPanel
              players={players}
              prizes={prizes}
              density={density}
              onUpdatePlayers={setPlayers}
              onUpdatePrizes={setPrizes}
              onUpdateDensity={(d) => {
                setDensity(d);
              }}
              onStartGame={handleStartGame}
            />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Playing Header Info & Stage Back */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    soundManager.playClick();
                    setGameStage('setup');
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-300 border border-slate-800 transition-colors cursor-pointer"
                  title="참가자 및 벌칙 재설정"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>설정 수정</span>
                </button>

                <div>
                  <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                    {selectedPreset.title}
                    <span className="text-xs text-slate-400 font-normal">
                      ({players.length}명 대결)
                    </span>
                  </h2>
                </div>
              </div>

              {revealedPlayerIds.size > 0 && (
                <button
                  onClick={() => {
                    soundManager.playClick();
                    setShowResultModal(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 border border-amber-400/40 text-xs font-bold transition-colors cursor-pointer"
                >
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  <span>결과표 ({revealedPlayerIds.size}/{players.length})</span>
                </button>
              )}
            </div>

            {/* Interactive Ladder Canvas Board */}
            <LadderCanvas
              players={players}
              prizes={prizes}
              numRows={numRows}
              rungs={rungs}
              results={results}
              activePlayerId={activePlayerId}
              revealedPlayerIds={revealedPlayerIds}
              isBlindMode={isBlindMode}
              isEditRungsMode={isEditRungsMode}
              onToggleRung={handleToggleRung}
              onPlayerCompleted={handlePlayerCompleted}
              onAllCompleted={() => setShowResultModal(true)}
              onSelectPlayerToTrace={(pId) => setActivePlayerId(pId)}
            />

            {/* Bottom Controls */}
            <ControlBar
              unrevealedCount={unrevealedCount}
              totalPlayers={players.length}
              isBlindMode={isBlindMode}
              isEditRungsMode={isEditRungsMode}
              onTraceNext={handleTraceNext}
              onTraceAll={handleTraceAll}
              onToggleBlindMode={() => setIsBlindMode((b) => !b)}
              onToggleEditRungsMode={() => setIsEditRungsMode((e) => !e)}
              onReshuffleLadder={handleReshuffleLadder}
              onResetProgress={handleResetProgress}
              onOpenSettings={() => setGameStage('setup')}
              onOpenResults={() => setShowResultModal(true)}
            />
          </div>
        )}
      </main>

      {/* Result Modal */}
      {showResultModal && (
        <ResultModal
          results={results}
          themeTitle={selectedPreset.title}
          onClose={() => setShowResultModal(false)}
          onRematchSame={handleRematchSame}
          onRematchShufflePrizes={handleRematchShufflePrizes}
        />
      )}

      {/* Rules / Tips Modal */}
      {showRulesModal && <RulesModal onClose={() => setShowRulesModal(false)} />}

      {/* Footer */}
      <footer className="w-full border-t border-slate-900 bg-slate-950/90 py-4 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>🎓 대학생을 위한 스마트 캠퍼스 사다리타기 · 100% 공정 보장</span>
          <span>친구들과 단톡방에 결과를 공유해 즐거운 대학생활을 만들어보세요!</span>
        </div>
      </footer>
    </div>
  );
}
