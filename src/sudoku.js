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

const getCoordinates = (colChar, rowChar) => {
  const col = colChar.toUpperCase().charCodeAt(0) - 64 - 1;
  const row = parseInt(rowChar) - 1;
  if (row < 0 || row > 8 || col < 0 || col > 8 || isNaN(col) || isNaN(row)) {
    throw new Error("Invalid position");
  }
  return [col, row];
};

export const blame = ({ puzzle, colChar, rowChar }) => {
  const [col, row] = getCoordinates(colChar, rowChar);
  const author = puzzle[row][col].author;
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
  if (newValue < 1 || newValue > 9 || isNaN(parseInt(newValue))) {
    throw new Error("Invalid value");
  }
  const [col, row] = getCoordinates(colChar, rowChar);
  return puzzle.map((_, indexRow) => {
    return _.map((cell, indexCol) => {
      if (indexCol === col && indexRow === row) {
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

export const erase = ({ puzzle, colChar, rowChar, author }) => {
  const [col, row] = getCoordinates(colChar, rowChar);
  return puzzle.map((_, indexRow) => {
    return _.map((cell, indexCol) => {
      if (indexCol === col && indexRow === row) {
        if (cell.initial === true) {
          throw new Error("Initial value");
        }
        return {
          value: null,
          lastPlayed: true,
          guess: false,
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

export const totalDoubt = ({ puzzle, author }) => {
  return puzzle.map((_) => {
    return _.map((cell) => {
      if (cell.initial === true) {
        return cell;
      }
      return {
        value: cell.value,
        lastPlayed: cell.value ? true : false,
        guess: cell.value ? true : false,
        author,
      };
    });
  });
};

export const cleanAllGuess = ({ puzzle, author }) => {
  return puzzle.map((_) => {
    return _.map((cell) => {
      if (cell.initial === true) {
        return cell;
      }
      return {
        value: cell.guess ? null : cell.value,
        lastPlayed: cell.guess ? true : false,
        guess: false,
        author,
      };
    });
  });
};

export const isPuzzleWinning = (puzzle) => {
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

export const getPuzzleLeaderboard = (puzzle) => {
  return puzzle.flat().reduce((leaderboard, cell) => {
    if (cell.author === undefined) {
      return leaderboard;
    }
    const score = leaderboard[cell.author] ?? 0;

    return { ...leaderboard, [cell.author]: score + 1 };
  }, {});
};
