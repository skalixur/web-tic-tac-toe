import { createIcons, Circle, X } from "lucide"

createIcons({
  icons: {
    Circle,
    X,
  },
})

import TicTacToeGame from "./lib/tictactoe_game"
import { Move } from "./types/types"

const startingMove: Move = "x"

const container = document.querySelector("#container") as HTMLDivElement

const game = new TicTacToeGame(startingMove)
game.init(container)

game.makeMove({ row: 1, item: 1 }, "x")
