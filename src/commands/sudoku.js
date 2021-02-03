import * as Sudoku from "../sudoku.js";
import { addSudokuToChannel, getChannelSudoku } from "../channels/index.js";

const getCodeMessage = (message) => `\`\`\`${message}\`\`\``;

export const subscribe = {
  name: "sudoku",
  description: "Play a new game of sudoku",
  async execute(message) {
    const puzzle = Sudoku.getNewPuzzle();
    await addSudokuToChannel(message.channel.id, puzzle);
    message.channel.send(getCodeMessage(Sudoku.puzzeToString(puzzle)));
  },
};

export const view = {
  name: "view",
  description: "View your current game of sudoku",
  async execute(message) {
    const puzzle = await getChannelSudoku(message.channel.id);
    if (!puzzle) {
      return message.channel.send("Vous ne jouez pas au Sudoku :(");
    }
    message.channel.send(getCodeMessage(Sudoku.puzzeToString(puzzle)));
  },
};

export const play = {
  name: "play",
  description: "Play a new game of sudoku",
  async execute(message, args) {
    const [row, col, value] = args;
    if (row === undefined || col === undefined || value === undefined) {
      return message.channel.send(
        "Le format pour jouer est : `[Ligne] [Colonne] [Valeur]`"
      );
    }
    const puzzle = await getChannelSudoku(message.channel.id);
    if (!puzzle) {
      return message.channel.send("Vous ne jouez pas au Sudoku :(");
    }
    try {
      const newPuzzle = Sudoku.play(puzzle, row, col, value);
      await addSudokuToChannel(message.channel.id, newPuzzle);
      message.channel.send(getCodeMessage(Sudoku.puzzeToString(newPuzzle)));
    } catch (e) {
      console.error(e);
      message.channel.send(e.message);
    }
  },
};
