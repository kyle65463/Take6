import { Card, randomCard } from "./card";

export interface Player {
    id: number;
    name: string;
    score: number;
}

export interface SelfPlayer {
    id: number;
    name: string;
    cards: Card[];
    score: number;
}

// ! Used for mocked server
export function randomPlayer(index: number): Player {
    return {
        id: index,
        name: `Player ${index}`,
        score: 0,
    };
}

// ! Used for mocked server
export function randomSelfPlayer(index: number): SelfPlayer {
    return {
        id: index,
        name: "You",
        cards: Array.from(Array(10).keys()).map(() => randomCard()),
        score: 0,
    };
}
