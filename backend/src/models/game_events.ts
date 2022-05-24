import { Card } from "./card";
import { ModeType } from "./game";
import { Player} from "./player";

export type GameEventType = "game start" | "game over" | "game status update";

export interface GameEvent {
  type: GameEventType;
}

export interface GameStartEvent extends GameEvent {
  player: Player;
  otherPlayers: Omit<Player, "cards">[];
  initialFieldCards: Card[]; // length === 4
}

export interface GameOverEvent extends GameEvent {
  winners: (Player | Player)[];
}

export interface UpdateGameStatusEvent extends GameEvent {
  player: Player;
  otherPlayers: Omit<Player, "cards">[];
  fieldCards: Card[][];
  mode: ModeType;

  // The list of players and the card they played for this round
  playedCardInfo: { playerName: string; card: Card }[]; // minus one per round
}
