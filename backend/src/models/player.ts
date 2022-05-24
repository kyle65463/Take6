import { Card, randomCard } from "./card";

export interface Player {
    id: number;
    name: string;
    score: number;
}

export interface SelfPlayer {
    id: string;
    name: string;
    cards: Card[];
    score: number;
}