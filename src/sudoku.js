import * as sudoku from "sudoku";

export const getNewPuzzle = () => sudoku.makepuzzle().flat();

export const puzzeToString = (puzzle) =>
  puzzle.reduce(
    (str, value) => str.replace("$", value === null ? " " : value),
    TEMPLATE
  );

export const play = (puzzle, row, col, newValue) => {
  console.log(puzzle);
  if (newValue < 1 || newValue > 9) {
    throw new Error("Invalid value");
  }
  const targetIndex = getIndexOfPosition(row, col);
  return puzzle.map((value, index) =>
    index === targetIndex ? newValue : value
  );
};

const getIndexOfPosition = (rowChar, colChar) => {
  const row = rowChar.toUpperCase().charCodeAt(0) - 64;
  const col = parseInt(colChar);
  const index = (row - 1) * 9 + col - 1;
  if (isNaN(index) || index < 0 || index > 81) {
    throw new Error("Invalid position");
  }
  return index;
};

const TEMPLATE = `
   1   2   3   4   5   6   7   8   9
 ┏━━━┯━━━┯━━━┳━━━┯━━━┯━━━┳━━━┯━━━┯━━━┓
A┃ $ | $ | $ ┃ $ | $ | $ ┃ $ | $ | $ ┃
 ┠───┼───┼───╂───┼───┼───╂───┼───┼───┨
B┃ $ | $ | $ ┃ $ | $ | $ ┃ $ | $ | $ ┃
 ┠───┼───┼───╂───┼───┼───╂───┼───┼───┨
C┃ $ | $ | $ ┃ $ | $ | $ ┃ $ | $ | $ ┃
 ┣━━━┿━━━┿━━━╋━━━┿━━━┿━━━╋━━━┿━━━┿━━━┫
D┃ $ | $ | $ ┃ $ | $ | $ ┃ $ | $ | $ ┃
 ┠───┼───┼───╂───┼───┼───╂───┼───┼───┨
F┃ $ | $ | $ ┃ $ | $ | $ ┃ $ | $ | $ ┃
 ┠───┼───┼───╂───┼───┼───╂───┼───┼───┨
G┃ $ | $ | $ ┃ $ | $ | $ ┃ $ | $ | $ ┃
 ┣━━━┿━━━┿━━━╋━━━┿━━━┿━━━╋━━━┿━━━┿━━━┫
H┃ $ | $ | $ ┃ $ | $ | $ ┃ $ | $ | $ ┃
 ┠───┼───┼───╂───┼───┼───╂───┼───┼───┨
I┃ $ | $ | $ ┃ $ | $ | $ ┃ $ | $ | $ ┃
 ┠───┼───┼───╂───┼───┼───╂───┼───┼───┨
J┃ $ | $ | $ ┃ $ | $ | $ ┃ $ | $ | $ ┃
 ┗━━━┷━━━┷━━━┻━━━┷━━━┷━━━┻━━━┷━━━┷━━━┛
`;
