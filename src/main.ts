import {
  createIcons,
  Circle,
  X,
  StepForward,
  StepBack,
  RotateCcw,
} from "lucide"
import TicTacToeGame from "./lib/tictactoe_game"
import { Move } from "./types/types"

createIcons({
  icons: {
    Circle,
    X,
    StepForward,
    StepBack,
    RotateCcw,
  },
})

const startingMove: Move = "x"
const boardContainer = document.querySelector(
  "#game-container",
) as HTMLDivElement
const historyContainer = document.querySelector(
  "#history-container",
) as HTMLDivElement
const domHistoryForwardButton = document.querySelector(
  "#history-forward",
) as HTMLButtonElement
const domHistoryBackButton = document.querySelector(
  "#history-back",
) as HTMLButtonElement
const domResetButton = document.querySelector("#reset") as HTMLButtonElement
const domStatusDisplay = document.querySelector(
  "#status-display",
) as HTMLElement
const game = new TicTacToeGame()

game.init({
  boardContainer,
  startingMove,
  historyContainer,
  domHistoryForwardButton,
  domHistoryBackButton,
  domStatusDisplay,
  domResetButton,
})
