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

const getCoords = (args) => {
    const [col, row, value] = args.join("").split("");
    return { col, row, value };
};

const getHelp = (args) => {
    const [help, command] = args;
    if (help !== "help") {
        return `To obtain help, type
!sudoku help [command]`;
    }

    const list = {
        sudoku: "- **!sudoku** : Start a new game",
        play: "- **!play C3 5** : Play the number 5 in C3",
        guess:
            "- **!guess B3 4** : Guess that number in B3 is4 (will be displayed with **?**)",
        erase: "- **!erase A1** : Erase the position A1",
        view: "- **!view** : Show the current grid",
        blame:
            "- **!blame I3** : Show the name of the player who filled the postion I3",
        leaderboard: "- **!leaderboard** : Show the scores for current game",
        blame:
            "- **!blame I3** : Display the name of the player who filled the postion I3",
        totaldoubt:
            "- **!totaldoubt** : Convert all existing numbers in the grid to guesses",
        cleanguess: "- **!cleanguess** : Erase all guesses in the grid",
    };

    return `**SUDOKU GUIDE**
${
    command === undefined
        ? Object.values(list).join("\n")
        : list[command]
        ? list[command]
        : `The command **${command}** does not exists`
}`;
};

export const subscribe = {
    name: "sudoku",
    description: "Play a new game of sudoku",
    async execute(message, args) {
        if (args.length) {
            message.channel.send(getHelp(args));
            return;
        }
        const puzzle = await getChannelSudoku(message.channel.id);
        if (puzzle && !Sudoku.isPuzzleWinning(puzzle)) {
            const attachment = await getSudokuImage(puzzle);
            return message.channel.send(
                "Vous avez déjà une partie en cours (!sudoku_force si vous voulez abandonner):",
                attachment,
            );
        }
        const newPuzzle = Sudoku.getNewPuzzle();
        await addSudokuToChannel(message.channel.id, newPuzzle);
        const attachment = await getSudokuImage(newPuzzle);
        message.channel.send("Let's go :smile:", attachment);
    },
};

export const subscribeForce = {
    name: "sudoku_force",
    description: "Force a new game of sudoku",
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
            return message.channel.send(
                "Vous ne jouez pas au Sudoku :frowning:",
            );
        }
        const attachment = await getSudokuImage(puzzle);
        message.channel.send("Voilà la grille :wink:", attachment);
    },
};

export const play = {
    name: "play",
    description: "Make a move in existing sudoku game",
    async execute(message, args) {
        const { row, col, value } = getCoords(args);
        if (row === undefined || col === undefined || value === undefined) {
            return message.channel.send(
                "Le format pour jouer est : `[Colonne][Ligne] [Valeur]`",
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
                await message.channel.send(
                    "Vous avez gagné ! Champions :partying_face:",
                    attachment,
                );
                const leaderboard = Sudoku.getPuzzleLeaderboard(newPuzzle);
                const leaderboardMessage = Object.entries(leaderboard).reduce(
                    (msg, [author, value]) => {
                        return `${msg}${author}: ${value}\n`;
                    },
                    "",
                );
                return message.channel.send(
                    `Leaderboard:\n${leaderboardMessage}`,
                );
            }
            message.channel.send(":ok_hand:", attachment);
        } catch (e) {
            console.error(e);
            if (
                e.message === "Invalid position" ||
                e.message === "Invalid value"
            ) {
                return message.channel.send(
                    `${e.message} :frowning:\n Le format pour jouer est : \`[Colonne][Ligne] [Valeur]\``,
                );
            }
            if (e.message === "Initial value") {
                return message.channel.send(
                    "Tu ne peux pas écrire dans cette case",
                );
            }
            message.channel.send(e.message);
        }
    },
};

export const guess = {
    name: "guess",
    description: "Make a guess in sudoku",
    async execute(message, args) {
        const { row, col, value } = getCoords(args);
        if (row === undefined || col === undefined || value === undefined) {
            return message.channel.send(
                "Le format pour jouer est : `[Colonne][Ligne] [Valeur]`",
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
                isGuess: true,
                author: message.author.username,
            });
            await addSudokuToChannel(message.channel.id, newPuzzle);
            const attachment = await getSudokuImage(newPuzzle);
            message.channel.send(":ok_hand:", attachment);
        } catch (e) {
            console.error(e);
            if (
                e.message === "Invalid position" ||
                e.message === "Invalid value"
            ) {
                return message.channel.send(
                    `${e.message} :frowning:\n Le format pour jouer est : \`[Colonne][Ligne] [Valeur]\``,
                );
            }
            if (e.message === "Initial value") {
                return message.channel.send(
                    "Tu ne peux pas écrire dans cette case",
                );
            }
            message.channel.send(e.message);
        }
    },
};

export const erase = {
    name: "erase",
    description: "Erase a position in existing sudoku game",
    async execute(message, args) {
        const { row, col } = getCoords(args);
        if (row === undefined || col === undefined) {
            return message.channel.send(
                "Le format pour jouer est : `[Colonne][Ligne]`",
            );
        }
        const puzzle = await getChannelSudoku(message.channel.id);
        if (!puzzle) {
            return message.channel.send("Vous ne jouez pas au Sudoku :(");
        }
        try {
            const newPuzzle = Sudoku.erase({
                puzzle,
                rowChar: row,
                colChar: col,
                author: message.author.username,
            });
            await addSudokuToChannel(message.channel.id, newPuzzle);
            const attachment = await getSudokuImage(newPuzzle);
            message.channel.send(":ok_hand:", attachment);
        } catch (e) {
            console.error(e);
            if (e.message === "Invalid position") {
                return message.channel.send(
                    `${e.message} :frowning:\n Le format pour jouer est : \`[Colonne][Ligne]\``,
                );
            }
            if (e.message === "Initial value") {
                return message.channel.send(
                    "Tu ne peux pas effacer cette case",
                );
            }
            message.channel.send(e.message);
        }
    },
};

export const totalDoubt = {
    name: "totaldoubt",
    description: "Transform all played position in guess",
    async execute(message, args) {
        const puzzle = await getChannelSudoku(message.channel.id);
        if (!puzzle) {
            return message.channel.send("Vous ne jouez pas au Sudoku :(");
        }
        try {
            const newPuzzle = Sudoku.totalDoubt({
                puzzle,
                author: message.author.username,
            });
            await addSudokuToChannel(message.channel.id, newPuzzle);
            const attachment = await getSudokuImage(newPuzzle);
            message.channel.send(":thinking:", attachment);
        } catch (e) {
            console.error(e);
            message.channel.send(e.message);
        }
    },
};

export const cleanAllGuess = {
    name: "cleanguess",
    description: "Erase all guess positions",
    async execute(message, args) {
        const puzzle = await getChannelSudoku(message.channel.id);
        if (!puzzle) {
            return message.channel.send("Vous ne jouez pas au Sudoku :(");
        }
        try {
            const newPuzzle = Sudoku.cleanAllGuess({
                puzzle,
                author: message.author.username,
            });
            await addSudokuToChannel(message.channel.id, newPuzzle);
            const attachment = await getSudokuImage(newPuzzle);
            message.channel.send(":sob:", attachment);
        } catch (e) {
            console.error(e);
            message.channel.send(e.message);
        }
    },
};

export const blame = {
    name: "blame",
    description: "Blame a sudoku play",
    async execute(message, args) {
        const { row, col } = getCoords(args);
        if (row === undefined || col === undefined) {
            return message.channel.send(
                "Le format pour blame est : `[Colonne][Ligne]`",
            );
        }
        const puzzle = await getChannelSudoku(message.channel.id);
        if (!puzzle) {
            return message.channel.send("Vous ne jouez pas au Sudoku :(");
        }
        try {
            const author = Sudoku.blame({ puzzle, rowChar: row, colChar: col });
            message.channel.send(`Le coupable est ${author} :scream:`);
        } catch (e) {
            console.error(e);
            message.channel.send(e.message);
        }
    },
};

export const leaderboard = {
    name: "leaderboard",
    description: "Get the leaderboard of a puzzle",
    async execute(message) {
        const puzzle = await getChannelSudoku(message.channel.id);
        if (!puzzle) {
            return message.channel.send("Vous ne jouez pas au Sudoku :(");
        }
        try {
            const leaderboard = Sudoku.getPuzzleLeaderboard(puzzle);
            const leaderboardMessage = Object.entries(leaderboard).reduce(
                (msg, [author, value]) => {
                    return `${msg}${author}: ${value}\n`;
                },
                "",
            );
            message.channel.send(`Leaderboard:\n${leaderboardMessage}`);
        } catch (e) {
            console.error(e);
            message.channel.send(e.message);
        }
    },
};
