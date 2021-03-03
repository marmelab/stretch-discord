import * as sudoku from "sudoku";

export const getNewPuzzle = () => {
  const puzzle = sudoku.makepuzzle();
  return puzzle.reduce((grid, value, index) => {
    const row = Math.floor(index / 9);
    if (grid[row] === undefined) {
      grid[row] = [];
    }
    grid[row][index % 9] = {
      value: value !== null ? value + 1 : null,
      initial: value !== null,
    };
    return grid;
  }, []);
};

const getCoordinates = (rowChar, colChar) => {
  const row = rowChar.toUpperCase().charCodeAt(0) - 64 - 1;
  const col = parseInt(colChar) - 1;
  if (row < 0 || row > 8 || col < 0 || col > 8 || isNaN(col) || isNaN(row)) {
    throw new Error("Invalid position");
  }
  return [row, col];
};

export const blame = (puzzle, rowChar, colChar) => {
  const [row, col] = getCoordinates(rowChar, colChar);
  const author = puzzle[col][row].author;
  if (author === undefined) {
    throw new Error("Personne n'a joué sur cette case !");
  }
  return author;
};

export const play = ({
  puzzle,
  colChar,
  rowChar,
  newValue,
  isGuess = false,
  author,
}) => {
  if (newValue < 1 || newValue > 9) {
    throw new Error("Invalid value");
  }
  const [row, col] = getCoordinates(rowChar, colChar);
  return puzzle.map((_, indexCol) => {
    return _.map((cell, indexRow) => {
      if (indexRow === row && indexCol === col) {
        if (cell.initial === true) {
          throw new Error("Initial value");
        }
        return {
          value: parseInt(newValue),
          lastPlayed: true,
          guess: isGuess,
          author,
        };
      }
      return {
        ...cell,
        lastPlayed: false,
      };
    });
  });
};

export const isPuzzleWinning = (puzzle = test) => {
  const hasEmptyCell = puzzle.some((rows) =>
    rows.some((cell) => cell.value === null)
  );
  if (hasEmptyCell) {
    return false;
  }
  const rows = Object.values(puzzle).map((row) =>
    row.map((cell) => cell.value)
  );
  const cols = Object.values(puzzle).reduce((cols, row) => {
    return row.reduce((cols, cell, colIndex) => {
      if (cols[colIndex] === undefined) {
        cols[colIndex] = [];
      }
      cols[colIndex].push(cell.value);
      return cols;
    }, cols);
  }, []);
  const squares = cols.reduce((squares, rows, rowIndex) => {
    return rows.reduce((squares, value, colIndex) => {
      const squareIndex =
        Math.floor(rowIndex / 3) + Math.floor(colIndex / 3) * 3;
      if (squares[squareIndex] === undefined) {
        squares[squareIndex] = [];
      }
      squares[squareIndex].push(value);
      return squares;
    }, squares);
  }, []);
  const expectedValues = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  return [rows, cols, squares].every((part) => {
    return part.every((subPart) => {
      return expectedValues.every((value) => subPart.includes(value));
    });
  });
};
