export type Move = "x" | "o"
export type CellValue = Move | "_"
export type BoardRow = [CellValue, CellValue, CellValue]
export type BoardState = [BoardRow, BoardRow, BoardRow]
export type BoardIndex = 0 | 1 | 2
export type DomBoardCell = HTMLDivElement
export type DomBoardRow = [DomBoardCell, DomBoardCell, DomBoardCell]
export type DomBoardElements = [DomBoardRow, DomBoardRow, DomBoardRow]
