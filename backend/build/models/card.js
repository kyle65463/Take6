"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.randomCard = void 0;
const utils_1 = require("../utils");
// ! Used for mocked server
const numberList = [];
function randomCard() {
    let i = 0;
    let randInt = (0, utils_1.getRandomInt)(1, 105);
    while (i < 100 && numberList.length < 105 && numberList.includes(randInt)) {
        randInt = (0, utils_1.getRandomInt)(1, 105);
        i++;
    }
    numberList.push(randInt);
    return {
        number: randInt,
        score: (0, utils_1.getRandomInt)(1, 3),
    };
}
exports.randomCard = randomCard;
