import { Card } from "./card";
import { Player } from "./player";

export type PlayerEventType = "play card" | "select row";

export interface PlayerEvent {
  type: PlayerEventType;
}

export interface PlayCardEvent extends PlayerEvent {
  player: Player;
  card: Card;
}

export interface SelectRowEvent extends PlayerEvent {
  player: Player;
  rowIdx: number;
}
