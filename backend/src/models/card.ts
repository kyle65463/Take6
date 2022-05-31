import { getRandomInt } from "../utils";

export interface Card {
	number: number;
	score: number;
}

// ! Used for mocked server
const numberList: number[] = [];
export function randomCard(): Card {
	let i = 0;
	let randInt = getRandomInt(1, 105);
	while (i < 100 && numberList.length < 105 && numberList.includes(randInt)) {
		randInt = getRandomInt(1, 105);
		i++;
	}
	numberList.push(randInt);
	return {
		number: randInt,
		score: getRandomInt(1, 4),
	};
}
