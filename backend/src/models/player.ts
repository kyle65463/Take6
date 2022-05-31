import { Socket } from "socket.io";
import { Card } from "./card";

export interface Player {
  id: string;
  name: string;
  cards: Card[];
  score: number;
  isReady: boolean;
  photoURL: string;
}

export interface Client {
  socket: Socket;
  player: Player;
}
