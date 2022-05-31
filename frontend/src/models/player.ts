import { Card } from "./card";

export interface Player {
    name: string;
    score: number;
    photoURL: string;
}

export interface SelfPlayer {
    name: string;
    cards: Card[];
    score: number;
    photoURL: string;
}
