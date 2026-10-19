import { LadderDensity, LadderPathStep, Player, PlayerResult, Prize, Rung } from '../types/ladder';

export function getRowCountByDensity(density: LadderDensity, numCols: number): number {
  const base = numCols <= 4 ? 8 : numCols <= 7 ? 10 : 12;
  switch (density) {
    case 'easy':
      return Math.max(6, base - 2);
    case 'normal':
      return base;
    case 'crazy':
      return base + 4;
    default:
      return base;
  }
}

/**
 * Generate a random, fair set of horizontal rungs for the ladder.
 * Ensures:
 * - No two adjacent rungs at the exact same row (to avoid T-junction ambiguities).
 * - Every adjacent pair of vertical lines has at least 1-2 rungs for fun randomness.
 */
export function generateRandomRungs(numCols: number, numRows: number, density: LadderDensity): Rung[] {
  const rungs: Rung[] = [];
  const occupied = new Set<string>(); // "col,row"

  // Probability of placing a rung in each cell
  const prob = density === 'easy' ? 0.35 : density === 'normal' ? 0.52 : 0.68;

  for (let r = 0; r < numRows; r++) {
    for (let c = 0; c < numCols - 1; c++) {
      // Check if left neighbor has a rung at this row
      const leftNeighborHasRung = c > 0 && occupied.has(`${c - 1},${r}`);
      if (leftNeighborHasRung) {
        continue; // Cannot place adjacent rung on the same row
      }

      if (Math.random() < prob) {
        rungs.push({
          id: `rung-${c}-${r}-${Math.random().toString(36).substring(2, 7)}`,
          col: c,
          row: r,
        });
        occupied.add(`${c},${r}`);
      }
    }
  }

  // Ensure every column gap has at least one rung
  for (let c = 0; c < numCols - 1; c++) {
    const hasRung = rungs.some((rung) => rung.col === c);
    if (!hasRung) {
      // Find an available row
      const availableRows: number[] = [];
      for (let r = 0; r < numRows; r++) {
        const leftOccupied = c > 0 && occupied.has(`${c - 1},${r}`);
        const rightOccupied = c < numCols - 2 && occupied.has(`${c + 1},${r}`);
        if (!leftOccupied && !rightOccupied) {
          availableRows.push(r);
        }
      }

      if (availableRows.length > 0) {
        const chosenRow = availableRows[Math.floor(Math.random() * availableRows.length)];
        rungs.push({
          id: `rung-fixed-${c}-${chosenRow}-${Math.random().toString(36).substring(2, 7)}`,
          col: c,
          row: chosenRow,
        });
        occupied.add(`${c},${chosenRow}`);
      }
    }
  }

  return rungs;
}

/**
 * Validates if a rung can be toggled/added at (col, row)
 */
export function canPlaceRung(rungs: Rung[], col: number, row: number, numCols: number): boolean {
  if (col < 0 || col >= numCols - 1) return false;
  // If rung already exists here, we can remove it
  const alreadyExists = rungs.some((r) => r.col === col && r.row === row);
  if (alreadyExists) return true;

  // Otherwise check neighbors on the same row
  const leftNeighbor = rungs.some((r) => r.col === col - 1 && r.row === row);
  const rightNeighbor = rungs.some((r) => r.col === col + 1 && r.row === row);

  return !leftNeighbor && !rightNeighbor;
}

/**
 * Trace the exact path taken by a player starting at startCol down the ladder.
 */
export function tracePath(startCol: number, numRows: number, rungs: Rung[]): { finalCol: number; path: LadderPathStep[] } {
  // Sort rungs by row
  const rungsByRow = new Map<number, Rung[]>();
  rungs.forEach((r) => {
    const list = rungsByRow.get(r.row) || [];
    list.push(r);
    rungsByRow.set(r.row, list);
  });

  let currentCol = startCol;
  const path: LadderPathStep[] = [{ col: currentCol, row: 0 }];

  for (let r = 0; r < numRows; r++) {
    // Current step down to the rung level
    path.push({ col: currentCol, row: r + 0.5 });

    // Check if there is a rung connected to currentCol at row r
    const rowRungs = rungsByRow.get(r) || [];
    const leftRung = rowRungs.find((rung) => rung.col === currentCol - 1);
    const rightRung = rowRungs.find((rung) => rung.col === currentCol);

    if (leftRung) {
      // Turn left
      path.push({ col: currentCol, row: r + 0.5, isTurn: true });
      currentCol = currentCol - 1;
      path.push({ col: currentCol, row: r + 0.5, isTurn: true });
    } else if (rightRung) {
      // Turn right
      path.push({ col: currentCol, row: r + 0.5, isTurn: true });
      currentCol = currentCol + 1;
      path.push({ col: currentCol, row: r + 0.5, isTurn: true });
    }

    path.push({ col: currentCol, row: r + 1 });
  }

  return {
    finalCol: currentCol,
    path,
  };
}

/**
 * Calculates results for all players given players, prizes, and ladder structure.
 */
export function calculateAllResults(
  players: Player[],
  prizes: Prize[],
  numRows: number,
  rungs: Rung[]
): PlayerResult[] {
  return players.map((player, startCol) => {
    const { finalCol, path } = tracePath(startCol, numRows, rungs);
    const prize = prizes[finalCol] || { id: `p-${finalCol}`, text: '결과 없음', isPenalty: false };
    return {
      playerId: player.id,
      playerName: player.name,
      playerAvatar: player.avatar,
      playerColor: player.color,
      startCol,
      endCol: finalCol,
      prize,
      path,
    };
  });
}
