import { Card } from "./card";

export interface Player {
    name: string;
    score: number;
}

export interface SelfPlayer {
    name: string;
    cards: Card[];
    score: number;
}
