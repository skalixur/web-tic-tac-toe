import winPatterns from "@/lib/winning_positions"
import {
  BoardIndex,
  BoardPosition,
  BoardState,
  CellValue,
  DomBoardCell,
  DomBoardElements,
  Move,
} from "@/types/types"
import { Circle, createElement, X } from "lucide"

interface TicTacToeGameInitOpts {
  startingMove: Move
  boardContainer: HTMLDivElement
  historyContainer: HTMLDivElement
  domHistoryForwardButton: HTMLButtonElement
  domHistoryBackButton: HTMLButtonElement
  domResetButton: HTMLButtonElement
  domStatusDisplay: HTMLElement
}

interface TicTacToeEventListeners {
  onDomHistoryForwardClick: () => void
  onDomHistoryBackwardClick: () => void
  onDomResetClick: () => void
}

type GameState =
  | "not initialized"
  | "playing"
  | "x win"
  | "o win"
  | "draw"
  | `history ${number}`

export default class TicTacToeGame {
  boardHistory: BoardState[]
  boardState: BoardState
  currentToMove: Move | null
  domBoardElements: DomBoardElements | null
  domBoardContainer: HTMLDivElement | null
  domHistoryContainer: HTMLDivElement | null
  domHistoryForwardButton: HTMLButtonElement | null
  domHistoryBackButton: HTMLButtonElement | null
  domResetButton: HTMLButtonElement | null
  domStatusDisplay: HTMLElement | null
  winner: Move | null
  gameState: GameState

  constructor() {
    this.boardState = TicTacToeGame.createEmptyBoard()
    this.boardHistory = []
    this.currentToMove = null
    this.domBoardElements = null
    this.domBoardContainer = null
    this.domHistoryContainer = null
    this.domHistoryForwardButton = null
    this.domHistoryBackButton = null
    this.domResetButton = null
    this.domStatusDisplay = null
    this.winner = null
    this.gameState = "not initialized"
  }

  init({
    startingMove,
    boardContainer,
    historyContainer,
    domHistoryForwardButton,
    domHistoryBackButton,
    domStatusDisplay,
    domResetButton,
  }: TicTacToeGameInitOpts): DomBoardElements {
    Object.assign(this, {
      currentToMove: startingMove,
      domBoardContainer: boardContainer,
      domHistoryContainer: historyContainer,
      domHistoryForwardButton,
      domHistoryBackButton,
      domResetButton,
      domStatusDisplay,
    })

    const switchToHistoryMode = () => {
      if (!this.gameState.startsWith("history")) {
        this.gameState = `history ${this.boardHistory.length - 1}`
      }
    }

    const onDomHistoryForwardClick = () => {
      switchToHistoryMode()
      this.incrementHistoryIndex(1)
    }

    const onDomHistoryBackwardClick = () => {
      switchToHistoryMode()
      this.incrementHistoryIndex(-1)
    }

    const onDomResetClick = () => {
      this.cleanUpEventListeners({
        onDomHistoryForwardClick,
        onDomHistoryBackwardClick,
        onDomResetClick,
      })
      this.resetGameState()
      this.init({
        startingMove,
        boardContainer,
        historyContainer,
        domHistoryForwardButton,
        domHistoryBackButton,
        domStatusDisplay,
        domResetButton,
      })
    }

    const eventListeners: TicTacToeEventListeners = {
      onDomHistoryBackwardClick,
      onDomHistoryForwardClick,
      onDomResetClick,
    }

    this.addEventListeners(eventListeners)

    this.domBoardElements = this.boardState.map((row, rowIndex) =>
      row.map((cell, cellIndex) =>
        this.createDomCell(cell, {
          rowIndex: rowIndex as BoardIndex,
          cellIndex: cellIndex as BoardIndex,
        }),
      ),
    ) as DomBoardElements

    boardContainer.innerHTML = ""
    this.domBoardElements
      .flat()
      .forEach((cell) => boardContainer.appendChild(cell))

    this.gameState = "playing"
    this.refreshDomHistoryControls(this.boardHistory.length)
    this.updateState()
    return this.domBoardElements
  }

  private resetGameState() {
    Object.assign(this, {
      boardState: TicTacToeGame.createEmptyBoard(),
      boardHistory: [],
      currentToMove: null,
      domBoardElements: null,
      domBoardContainer: null,
      domHistoryContainer: null,
      domHistoryForwardButton: null,
      domHistoryBackButton: null,
      domResetButton: null,
      domStatusDisplay: null,
      winner: null,
      gameState: "not initialized",
    })
  }

  private cleanUpEventListeners({
    onDomHistoryForwardClick,
    onDomHistoryBackwardClick,
    onDomResetClick,
  }: TicTacToeEventListeners) {
    if (
      !this.domHistoryForwardButton ||
      !this.domHistoryBackButton ||
      !this.domResetButton
    ) {
      throw new Error(
        "Unable to add remove listeners: controls not initialized",
      )
    }
    this.domHistoryForwardButton.removeEventListener(
      "click",
      onDomHistoryForwardClick,
    )
    this.domHistoryBackButton.removeEventListener(
      "click",
      onDomHistoryBackwardClick,
    )
    this.domResetButton.removeEventListener("click", onDomResetClick)
  }

  private addEventListeners({
    onDomHistoryForwardClick,
    onDomHistoryBackwardClick,
    onDomResetClick,
  }: TicTacToeEventListeners) {
    if (
      !this.domHistoryForwardButton ||
      !this.domHistoryBackButton ||
      !this.domResetButton
    ) {
      throw new Error("Unable to add event listeners: controls not initialized")
    }
    this.domHistoryForwardButton.addEventListener(
      "click",
      onDomHistoryForwardClick,
    )
    this.domHistoryBackButton.addEventListener(
      "click",
      onDomHistoryBackwardClick,
    )
    this.domResetButton.addEventListener("click", onDomResetClick)
  }

  updateState(): GameState {
    if (this.gameState === "playing") {
      this.gameState = this.checkGameOver()
    }

    const isHistoryMode = this.gameState.startsWith("history")
    const historyIndex = isHistoryMode ? this.getHistoryIndex()! : null
    const boardState = isHistoryMode
      ? this.boardHistory[historyIndex!]
      : this.boardState

    this.refreshDomBoard(boardState)
    this.refreshDomHistory()

    if (!isHistoryMode) {
      this.refreshDomHistoryControls(this.boardHistory.length)
    }

    if (this.domStatusDisplay) {
      this.domStatusDisplay.textContent = this.messageFromGameState()
    }

    return this.gameState
  }

  static otherMove(move: Move): Move {
    return move === "x" ? "o" : "x"
  }

  messageFromGameState(): string {
    let message = ""
    if (this.gameState.startsWith("history")) {
      const historyIndex = this.getHistoryIndex()!
      message = `Viewing history at move ${historyIndex + 1}`
    } else {
      const messageTable = {
        "x win": "X wins!",
        "o win": "O wins!",
        draw: "It's a draw!",
        playing: "Playing",
      }
      message =
        messageTable[this.gameState as "x win" | "o win" | "draw" | "playing"]
    }
    return message
  }

  private static createEmptyBoard(): BoardState {
    return [
      ["_", "_", "_"],
      ["_", "_", "_"],
      ["_", "_", "_"],
    ]
  }

  getHistoryIndex(): number | null {
    if (this.gameState.startsWith("history")) {
      return parseInt(this.gameState.split(" ")[1])
    }
    return null
  }

  incrementHistoryIndex(amount: number) {
    if (!this.gameState.startsWith("history")) return

    const historyIndex = this.getHistoryIndex()!
    const newIndex = historyIndex + amount

    this.refreshDomHistoryControls(newIndex)

    this.gameState = `history ${newIndex}`
    this.updateState()
  }

  refreshDomHistoryControls(newIndex: number) {
    if (!this.domHistoryBackButton)
      throw new Error(
        "Unable to increment history index: DOM back button not initialized",
      )

    if (!this.domHistoryForwardButton)
      throw new Error(
        "Unable to increment history index: DOM forward button not initialized",
      )

    this.domHistoryForwardButton.disabled = false
    this.domHistoryBackButton.disabled = false

    if (newIndex <= 0) {
      this.domHistoryBackButton.disabled = true
    }

    if (newIndex >= this.boardHistory.length - 1) {
      this.domHistoryForwardButton.disabled = true
    }
  }

  refreshDomBoard(bs?: BoardState): DomBoardElements {
    if (this.domBoardElements === null) {
      throw new Error("Unable to refresh DOM board: DOM board nonexistent")
    }

    this.domBoardElements = this.domBoardElements.map((row, rowIndex) =>
      row.map((cell, cellIndex) => {
        const newCell = this.createDomCell(
          bs ? bs[rowIndex][cellIndex] : this.boardState[rowIndex][cellIndex],
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
      'flex aspect-square size-full items-center justify-center transition-colors hover:cursor-pointer hover:bg-muted data-[cell-value="_"]:hover:cursor-default nth-2:border-r-2 nth-2:border-l-2 nth-4:border-t-2 nth-4:border-b-2 nth-5:border-2 nth-6:border-t-2 nth-6:border-b-2 nth-8:border-r-2 nth-8:border-l-2'

    cell.classList.add(...cellClassNames.split(/ +/))

    const cellIcon = this.getIconElementFromCellValue(cellValue)
    cell.appendChild(cellIcon)

    return cell
  }

  makeMove(boardPos: BoardPosition, move: Move): BoardState {
    const { rowIndex: row, cellIndex: cell } = boardPos

    if (this.gameState.startsWith("history")) {
      this.gameState = "playing"
      this.updateState()
      return this.boardState
    }

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

  private createDomHistoryElement(index: number): HTMLElement {
    const boardHistoryElement = document.createElement("button")
    const boardHistoryElementClassNames =
      "h-fit rounded-md border px-4 py-2 transition-colors select-none hover:cursor-pointer hover:border-muted hover:bg-muted"

    boardHistoryElement.classList.add(
      ...boardHistoryElementClassNames.split(/ +/),
    )

    boardHistoryElement.textContent = `${index + 1}`

    boardHistoryElement.addEventListener("click", () => {
      this.gameState = `history ${index}`
      this.updateState()
    })

    return boardHistoryElement
  }

  refreshDomHistory(): BoardState[] {
    const domHistoryContainer = this.domHistoryContainer
    if (!domHistoryContainer) {
      throw new Error(
        "Unable to set DOM history elements: DOM container not initialized",
      )
    }

    domHistoryContainer.innerHTML = ""
    this.boardHistory.forEach((_, index) => {
      domHistoryContainer.appendChild(this.createDomHistoryElement(index))
    })

    return this.boardHistory
  }
  checkGameOver(): GameState {
    let result = this.gameState
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
