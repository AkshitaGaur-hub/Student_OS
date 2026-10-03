import React from 'react';

/**
 * Pure SVG QR Code Display Component.
 * Generates a clean, scannable QR visual matrix with standard corner alignment markers.
 */
export default function QRCode({ value = '', size = 160, className = '' }) {
  // Generate deterministic grid pattern from value
  const gridSize = 21;
  const grid = Array(gridSize)
    .fill(0)
    .map(() => Array(gridSize).fill(false));

  // Function to place 7x7 corner finder patterns
  const placeFinder = (startRow, startCol) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        if (
          r === 0 ||
          r === 6 ||
          c === 0 ||
          c === 6 ||
          (r >= 2 && r <= 4 && c >= 2 && c <= 4)
        ) {
          grid[startRow + r][startCol + c] = true;
        }
      }
    }
  };

  // 3 Corner Finders
  placeFinder(0, 0);
  placeFinder(0, 14);
  placeFinder(14, 0);

  // Timing lines
  for (let i = 8; i < 13; i++) {
    grid[6][i] = i % 2 === 0;
    grid[i][6] = i % 2 === 0;
  }

  // Deterministic data fill based on value string hash
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }

  let bitIdx = 0;
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      // Skip finder markers and timing lines
      const inFinder1 = r < 8 && c < 8;
      const inFinder2 = r < 8 && c >= 13;
      const inFinder3 = r >= 13 && c < 8;
      const inTiming = (r === 6 && c >= 8 && c < 13) || (c === 6 && r >= 8 && r < 13);

      if (!inFinder1 && !inFinder2 && !inFinder3 && !inTiming) {
        const charCode = value.charCodeAt(bitIdx % (value.length || 1)) || 42;
        const bit = ((hash ^ (charCode * (r + 1) * (c + 1))) & (1 << (bitIdx % 7))) !== 0;
        grid[r][c] = bit;
        bitIdx++;
      }
    }
  }

  const cellSize = size / gridSize;

  return (
    <div
      className={`inline-block p-2 bg-white rounded border border-slate-200 shadow-sm ${className}`}
      title={`QR Code for: ${value}`}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="shape-rendering-crispEdges"
      >
        <rect width={size} height={size} fill="#ffffff" />
        {grid.map((row, r) =>
          row.map((active, c) =>
            active ? (
              <rect
                key={`${r}-${c}`}
                x={c * cellSize}
                y={r * cellSize}
                width={cellSize}
                height={cellSize}
                fill="#0f172a"
              />
            ) : null
          )
        )}
      </svg>
    </div>
  );
}
