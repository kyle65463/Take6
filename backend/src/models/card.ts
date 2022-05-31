import { getRandomInt } from "../utils";
import { Game } from "./game";

export interface Card {
	number: number;
	score: number;
}

export function randomCard(game: Game): Card {
	let i = 0;
	let randInt = getRandomInt(1, 105);
	while (i < 100 && game.usedCards.length < 105 && game.usedCards.includes(randInt)) {
		randInt = getRandomInt(1, 105);
		i++;
	}
	game.usedCards.push(randInt);
	return {
		number: randInt,
		score: getRandomInt(1, 4),
	};
}
