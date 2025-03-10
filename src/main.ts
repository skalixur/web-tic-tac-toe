import { createIcons, Circle, X } from "lucide"
import TicTacToeGame from "./lib/tictactoe_game"
import { Move } from "./types/types"

createIcons({
  icons: {
    Circle,
    X,
  },
})

const startingMove: Move = "x"
const boardContainer = document.querySelector(
  "#game-container",
) as HTMLDivElement
const controlsContainer = document.querySelector(
  "#controls-container",
) as HTMLDivElement
const game = new TicTacToeGame()

game.init({ boardContainer, startingMove, controlsContainer })
