import ping from "./ping.js";
import stretch from "./stretch.js";
import unstretch from "./unstretch.js";
import * as Sudoku from "./sudoku.js";

export default {
  Ping: ping,
  Stretch: stretch,
  Unstretch: unstretch,
  Sudoku: Sudoku.subscribe,
  Play: Sudoku.play,
  View: Sudoku.view,
  Guess: Sudoku.guess,
  Blame: Sudoku.blame,
};
