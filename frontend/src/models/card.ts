import { getRandomInt } from "@utils/utils";

export interface Card {
	number: number;
	score: number;
}

// ! Used for mocked server
const numberList: number[] = [];
export function randomCard(): Card {
	let randInt = getRandomInt(1, 105);
	while (numberList.length < 105 && numberList.includes(randInt)) {
		randInt = getRandomInt(1, 105);
	}
	numberList.push(randInt);
	return {
		number: randInt,
		score: getRandomInt(1, 3),
	};
}
