import * as Sudoku from "../sudoku.js";
import { addSudokuToChannel, getChannelSudoku } from "../channels/index.js";
import HtmlToImage from "node-html-to-image";
import { MessageAttachment } from "discord.js";
import fs from "fs";
import path from "path";
import Handlebars from "handlebars";

Handlebars.registerHelper("inc", function (value) {
  return parseInt(value) + 1;
});

const getSudokuImage = async (puzzle) => {
  const html = fs.readFileSync(`${path.resolve()}/src/sudoku.html`, {
    encoding: "utf8",
  });
  const buffer = await HtmlToImage({
    html,
    content: { rows: puzzle },
  });
  const attachment = new MessageAttachment(buffer, "sudoku.png");
  return attachment;
};

export const subscribe = {
  name: "sudoku",
  description: "Play a new game of sudoku",
  async execute(message) {
    const puzzle = Sudoku.getNewPuzzle();
    await addSudokuToChannel(message.channel.id, puzzle);
    const attachment = await getSudokuImage(puzzle);
    message.channel.send("Let's go :smile:", attachment);
  },
};

export const view = {
  name: "view",
  description: "View your current game of sudoku",
  async execute(message) {
    const puzzle = await getChannelSudoku(message.channel.id);
    if (!puzzle) {
      return message.channel.send("Vous ne jouez pas au Sudoku :frowning:");
    }
    const attachment = await getSudokuImage(puzzle);
    message.channel.send("Here is your sudoku grid :wink:", attachment);
  },
};

export const play = {
  name: "play",
  description: "Make a move in existing sudoku game",
  async execute(message, args) {
    const [row, col, value] = args;
    if (row === undefined || col === undefined || value === undefined) {
      return message.channel.send(
        "Le format pour jouer est : `[Colonne] [Ligne] [Valeur]`"
      );
    }
    const puzzle = await getChannelSudoku(message.channel.id);
    if (!puzzle) {
      return message.channel.send("Vous ne jouez pas au Sudoku :(");
    }
    try {
      const newPuzzle = Sudoku.play({
        puzzle,
        rowChar: row,
        colChar: col,
        newValue: value,
        author: message.author.username,
      });
      await addSudokuToChannel(message.channel.id, newPuzzle);
      const attachment = await getSudokuImage(newPuzzle);
      if (Sudoku.isPuzzleWinning(newPuzzle)) {
        return message.channel.send(
          "Vous avez gagné ! Champions :partying_face:",
          attachment
        );
      }
      message.channel.send(":ok_hand:", attachment);
    } catch (e) {
      console.error(e);
      if (e.message === "Invalid position" || e.message === "Invalid value") {
        return message.channel.send(
          `${e.message} :frowning:\n Le format pour jouer est : \`[Colonne][Ligne][Valeur]\``
        );
      }
      if (e.message === "Initial value") {
        return message.channel.send("Tu ne peux pas écrire dans cette case");
      }
      message.channel.send(e.message);
    }
  },
};

export const guess = {
  name: "guess",
  description: "Make a guess in sudoku",
  async execute(message, args) {
    const [row, col, value] = args;
    if (row === undefined || col === undefined || value === undefined) {
      return message.channel.send(
        "Le format pour jouer est : `[Colonne] [Ligne] [Valeur]`"
      );
    }
    const puzzle = await getChannelSudoku(message.channel.id);
    if (!puzzle) {
      return message.channel.send("Vous ne jouez pas au Sudoku :(");
    }
    try {
      const newPuzzle = Sudoku.play(puzzle, row, col, value, true);
      await addSudokuToChannel(message.channel.id, newPuzzle);
      const attachment = await getSudokuImage(newPuzzle);
      message.channel.send(":ok_hand:", attachment);
    } catch (e) {
      console.error(e);
      if (e.message === "Invalid position" || e.message === "Invalid value") {
        return message.channel.send(
          `${e.message} :frowning:\n Le format pour jouer est : \`[Colonne][Ligne][Valeur]\``
        );
      }
      if (e.message === "Initial value") {
        return message.channel.send("Tu ne peux pas écrire dans cette case");
      }
      message.channel.send(e.message);
    }
  },
};

export const blame = {
  name: "blame",
  description: "Blame a sudoku play",
  async execute(message, args) {
    const [row, col] = args;
    if (row === undefined || col === undefined) {
      return message.channel.send(
        "Le format pour blame est : `[Colonne] [Ligne]`"
      );
    }
    const puzzle = await getChannelSudoku(message.channel.id);
    if (!puzzle) {
      return message.channel.send("Vous ne jouez pas au Sudoku :(");
    }
    try {
      const author = Sudoku.blame(puzzle, row, col);
      message.channel.send(`Le coupable est ${author} :scream:`);
    } catch (e) {
      console.error(e);
      message.channel.send(e.message);
    }
  },
};