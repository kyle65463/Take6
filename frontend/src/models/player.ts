import { Card, randomCard } from "./card";

export interface Player {
	name: string;
}

export interface SelfPlayer {
	name: string;
	cards: Card[];
}

// ! Used for mocked server
export function randomPlayer(index: number): Player {
	return {
		name: `Player ${index}`,
	};
}

// ! Used for mocked server
export function randomSelfPlayer(): SelfPlayer {
	return {
		name: "You",
		cards: Array.from(Array(10).keys()).map(() => randomCard()),
	};
}
