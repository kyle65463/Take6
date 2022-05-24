import { Card } from "./card";
import { Client, Player } from "./player";

export type ModeType = "card selection" | "row selection" | "none";

export interface Game {
  clients: Client[];
  fieldCards: Card[][];
  mode: ModeType;

  // The list of players and the card they played for this round
  playedCardInfo: { playerName: string; card: Card }[];
  selectRowPlayer?: Player;
}
