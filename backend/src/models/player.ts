import { Socket } from "socket.io";
import { Card } from "./card";

export interface Player {
  id: string;
  name: string;
  cards: Card[];
  score: number;
}

export interface Client {
  socket: Socket;
  player: Player;
}
