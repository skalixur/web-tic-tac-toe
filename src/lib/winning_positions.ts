import { WinningPosition } from "@/types/types"

const winPatterns: WinningPosition[] = [
  // Horizontal
  [
    { rowIndex: 0, cellIndex: 0 },
    { rowIndex: 0, cellIndex: 1 },
    { rowIndex: 0, cellIndex: 2 },
  ],
  [
    { rowIndex: 1, cellIndex: 0 },
    { rowIndex: 1, cellIndex: 1 },
    { rowIndex: 1, cellIndex: 2 },
  ],
  [
    { rowIndex: 2, cellIndex: 0 },
    { rowIndex: 2, cellIndex: 1 },
    { rowIndex: 2, cellIndex: 2 },
  ],
  // Vertical
  [
    { rowIndex: 0, cellIndex: 0 },
    { rowIndex: 1, cellIndex: 0 },
    { rowIndex: 2, cellIndex: 0 },
  ],
  [
    { rowIndex: 0, cellIndex: 1 },
    { rowIndex: 1, cellIndex: 1 },
    { rowIndex: 2, cellIndex: 1 },
  ],
  [
    { rowIndex: 0, cellIndex: 2 },
    { rowIndex: 1, cellIndex: 2 },
    { rowIndex: 2, cellIndex: 2 },
  ],
  // Diagonal
  [
    { rowIndex: 0, cellIndex: 0 },
    { rowIndex: 1, cellIndex: 1 },
    { rowIndex: 2, cellIndex: 2 },
  ],
  [
    { rowIndex: 0, cellIndex: 2 },
    { rowIndex: 1, cellIndex: 1 },
    { rowIndex: 2, cellIndex: 0 },
  ],
]

export default winPatterns
