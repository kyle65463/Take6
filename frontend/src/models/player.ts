import { Card, randomCard } from "./card";

export interface Player {
	name: string;
	cards: Card[];
}

// ! Used for mocked server
export function randomPlayer(index: number): Player {
	return {
		name: `Player ${index}`,
		cards: Array.from(Array(10).keys()).map(() => randomCard()),
	};
}
