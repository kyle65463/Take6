import { getRandomInt } from "@utils/utils";

export interface Card {
	number: number;
	score: number;
}

// ! Used for mocked server
export function randomCard(): Card {
	return {
		number: getRandomInt(1, 105),
		score: getRandomInt(1, 3),
	};
}
