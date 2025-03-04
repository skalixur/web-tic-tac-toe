import {
  BoardIndex,
  BoardState,
  CellValue,
  DomBoardElements,
  DomBoardCell,
  Move,
} from "@/types/types"
import { createElement, Circle, X } from "lucide"

interface BoardPosition {
  row: BoardIndex
  item: BoardIndex
}

export default class TicTacToeGame {
  boardHistory: BoardState[]
  boardState: BoardState
  currentToMove: Move
  domBoardElements: DomBoardElements | null
  domBoardContainer: HTMLDivElement | null

  constructor(startingMove: Move) {
    this.boardState = TicTacToeGame.createEmptyBoard()
    this.boardHistory = [[...this.boardState]]
    this.currentToMove = startingMove
    this.domBoardElements = null
    this.domBoardContainer = null
  }

  init(boardContainer: HTMLDivElement): DomBoardElements {
    this.domBoardContainer = boardContainer
    // Create DOM board elements
    this.domBoardElements = this.boardState.map((row) =>
      row.map((item) => this.createDomCell(item)),
    ) as DomBoardElements

    this.domBoardElements.forEach((row) =>
      row.map((item) => boardContainer.appendChild(item)),
    )

    return this.domBoardElements
  }

  refreshDomBoard(): DomBoardElements {
    if (this.domBoardElements === null) {
      throw new Error("Unable to refresh DOM board: DOM board nonexistent")
    }

    this.domBoardElements.forEach((row, rowIndex) =>
      row.forEach((item, itemIndex) => {
        if (item.firstElementChild === null) {
          return
        }

        item.replaceChild(
          this.createDomCell(this.boardState[rowIndex][itemIndex]),
          item.firstElementChild,
        )
      }),
    )
    return this.domBoardElements
  }

  private getIconElementFromCellValue(
    cellValue: CellValue,
  ): HTMLElement | SVGElement {
    if (cellValue === "_") return document.createElement("i")

    const valueToIconTable = {
      x: X,
      o: Circle,
    }

    return createElement(valueToIconTable[cellValue])
  }

  private createDomCell(cellValue: CellValue): DomBoardCell {
    const cell = document.createElement("div")

    const cellClassNames = "border flex items-center justify-center size-full"
    const cellIconClassNames = "size-full"

    cell.classList.add(...cellClassNames.split(/ +/))

    const cellIcon = this.getIconElementFromCellValue(cellValue)
    cellIcon.classList.add(...cellIconClassNames.split(/ +/))
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

  setBoard(newBoardState: BoardState) {
    this.boardState = newBoardState
  }

  makeMove(boardPos: BoardPosition, move: Move): BoardState {
    const { row, item } = boardPos

    if (this.boardState[row][item] !== "_") {
      throw new Error("Invalid move: Cell is already occupied")
    }

    if (move !== this.currentToMove) {
      throw new Error("Invalid move: Move not equal to current move")
    }

    this.currentToMove = TicTacToeGame.otherMove(move)
    this.boardState[row][item] = move

    this.boardHistory = [
      ...this.boardHistory,
      this.boardState.map((row) => [...row]) as BoardState,
    ]

    this.refreshDomBoard()

    return this.boardState
  }
}
