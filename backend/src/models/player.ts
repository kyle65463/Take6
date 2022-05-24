import { Card, randomCard } from "./card";

export interface Player {
    id: string;
    name: string;
    score: number;
}

export interface SelfPlayer {
    id: string;
    name: string;
    cards: Card[];
    score: number;
}