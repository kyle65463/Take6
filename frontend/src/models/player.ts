import { Card, randomCard } from "./card";

export interface Player {
	name: string;
	score: number;
}

export interface SelfPlayer {
	name: string;
	cards: Card[];
	score: number;
}

// ! Used for mocked server
export function randomPlayer(index: number): Player {
	return {
		name: `Player ${index}`,
		score: 0,
	};
}

// ! Used for mocked server
export function randomSelfPlayer(): SelfPlayer {
	return {
		name: "You",
		cards: Array.from(Array(10).keys()).map(() => randomCard()),
		score: 0,
	};
}
