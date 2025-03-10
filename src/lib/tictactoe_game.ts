import {
  BoardIndex,
  BoardState,
  CellValue,
  DomBoardElements,
  DomBoardCell,
  Move,
  BoardPosition,
} from "@/types/types"
import { createElement, Circle, X } from "lucide"
import winPatterns from "@/lib/winning_positions"
import { clear } from "console"

interface TicTacToeGameInitOpts {
  startingMove: Move
  boardContainer: HTMLDivElement
  controlsContainer: HTMLDivElement
}

type GameState = "not initialized" | "playing" | "x win" | "o win" | "draw"

export default class TicTacToeGame {
  boardHistory: BoardState[]
  boardState: BoardState
  currentToMove: Move | null
  domBoardElements: DomBoardElements | null
  domBoardContainer: HTMLDivElement | null
  domControlsContainer: HTMLDivElement | null
  winner: Move | null
  gameState: GameState

  constructor() {
    this.boardState = TicTacToeGame.createEmptyBoard()
    this.boardHistory = [this.boardState.map((row) => [...row]) as BoardState]
    this.currentToMove = null
    this.domBoardElements = null
    this.domBoardContainer = null
    this.domControlsContainer = null
    this.winner = null
    this.gameState = "not initialized"
  }

  init({
    startingMove,
    boardContainer,
    controlsContainer,
  }: TicTacToeGameInitOpts): DomBoardElements {
    this.currentToMove = startingMove
    this.boardHistory = [...this.boardHistory]
    this.domBoardContainer = boardContainer
    this.domControlsContainer = controlsContainer

    this.domBoardElements = this.boardState.map((row, rowIndex) =>
      row.map((cell, cellIndex) =>
        this.createDomCell(cell, {
          rowIndex: rowIndex as BoardIndex,
          cellIndex: cellIndex as BoardIndex,
        }),
      ),
    ) as DomBoardElements

    this.domBoardElements.forEach((row) =>
      row.map((cell) => boardContainer.appendChild(cell)),
    )

    this.gameState = "playing"
    return this.domBoardElements
  }

  updateState(): GameState {
    this.gameState = this.checkGameState()
    console.log(this.gameState)
    this.refreshDomBoard()

    return this.gameState
  }

  refreshDomBoard(): DomBoardElements {
    if (this.domBoardElements === null) {
      throw new Error("Unable to refresh DOM board: DOM board nonexistent")
    }

    this.domBoardElements = this.domBoardElements.map((row, rowIndex) =>
      row.map((cell, cellIndex) => {
        const newValue = this.boardState[rowIndex][cellIndex]
        if (cell.dataset.cellValue === newValue) {
          return cell
        }

        const newCell = this.createDomCell(
          this.boardState[rowIndex][cellIndex],
          {
            rowIndex: rowIndex as BoardIndex,
            cellIndex: cellIndex as BoardIndex,
          },
        )
        cell.replaceWith(newCell)
        return newCell
      }),
    ) as DomBoardElements

    return this.domBoardElements
  }

  private getIconElementFromCellValue(
    cellValue: CellValue,
  ): HTMLElement | SVGElement {
    if (cellValue === "_") return document.createElement("i")

    const valueToIconTable = {
      x: createElement(X, {
        class: "size-full",
      }),
      o: createElement(Circle, {
        class: "size-5/7",
        "stroke-width": 2.5,
      }),
    }

    return valueToIconTable[cellValue]
  }

  private createDomCell(
    cellValue: CellValue,
    boardPosition: BoardPosition,
  ): DomBoardCell {
    const cell = document.createElement("div")
    const { rowIndex: rowIndex, cellIndex: cellIndex } = boardPosition

    cell.dataset.cellValue = cellValue
    cell.dataset.row = rowIndex.toString()
    cell.dataset.cell = cellIndex.toString()

    cell.addEventListener("click", () => {
      try {
        if (!this.currentToMove) {
          throw new Error("Unable to move: Current move not initialized")
        }
        this.makeMove(
          { rowIndex: rowIndex, cellIndex: cellIndex },
          this.currentToMove,
        )
      } catch (error) {
        if (error instanceof Error) {
          console.error(error.message)
        } else {
          console.error("An unknown error occurred", error)
        }
      }
    })

    const cellClassNames =
      "nth-2:border-l-2 nth-2:border-r-2 nth-4:border-t-2 nth-4:border-b-2 nth-5:border-2 nth-6:border-t-2 nth-6:border-b-2 nth-8:border-l-2 nth-8:border-r-2 flex items-center justify-center aspect-square size-full"

    cell.classList.add(...cellClassNames.split(/ +/))

    const cellIcon = this.getIconElementFromCellValue(cellValue)
    cell.appendChild(cellIcon)

    return cell
  }

  private static createEmptyBoard(): BoardState {
    return [
      ["_", "_", "_"],
      ["_", "_", "_"],
      ["_", "_", "_"],
    ]
  }

  static otherMove(move: Move): Move {
    return move === "x" ? "o" : "x"
  }

  setBoard(newBoardState: BoardState): BoardState {
    this.boardState = newBoardState
    this.updateState()
    return newBoardState
  }

  makeMove(boardPos: BoardPosition, move: Move): BoardState {
    const { rowIndex: row, cellIndex: cell } = boardPos

    if (!(this.gameState === "playing")) {
      throw new Error("Invalid move: Game is not in playing state")
    }

    if (this.boardState[row][cell] !== "_") {
      throw new Error("Invalid move: Cell is already occupied")
    }

    if (move !== this.currentToMove) {
      throw new Error("Invalid move: Move not equal to current move")
    }

    this.currentToMove = TicTacToeGame.otherMove(move)
    this.boardState[row][cell] = move

    this.boardHistory = [
      ...this.boardHistory,
      this.boardState.map((row) => [...row]) as BoardState,
    ]

    this.updateState()
    return this.boardState
  }

  checkGameState(): GameState {
    let result: GameState = "playing"
    if (this.hasWon()) {
      result = this.hasWon() === "x" ? "x win" : "o win"
    }
    if (this.hasDrawn()) {
      result = "draw"
    }
    return result
  }

  hasDrawn(): boolean {
    if (this.hasWon()) {
      return false
    }

    if (this.boardState.flat().every((cell) => cell !== "_")) {
      return true
    }

    return false
  }

  hasWon(): Move | false {
    for (const pattern of winPatterns) {
      const [a, b, c] = pattern
      const board = this.boardState

      const boardA = board[a.rowIndex][a.cellIndex]
      const boardB = board[b.rowIndex][b.cellIndex]
      const boardC = board[c.rowIndex][c.cellIndex]

      if (boardA === "_" || boardB === "_" || boardC === "_") {
        continue
      }

      if (boardA === boardB && boardB === boardC) {
        return boardA
      }
    }
    return false
  }
}
