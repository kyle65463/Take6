import { createServer } from "http";
import { Server, Socket } from "socket.io";
import { GameStartEvent } from "./models/game_events";
import {
  PlayCardEvent,
  PlayerEvent,
  SelectRowEvent,
} from "./models/player_events";
import { Card, randomCard } from "./models/card";
import { Player, Client } from "./models/player";

const httpServer = createServer();
export const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});
httpServer.listen(8888);
// const socket: Socket = undefined;
let socket: Socket | undefined = undefined;

// variable for playerEvents queue
export let playerEvents: PlayCardEvent[] = [];

// variable for row selection
let RowEvent: SelectRowEvent;
let RowEventFlag: boolean;

//database of 6 players
let clients: Client[] = [];

// collect 6 playerEvents in a round, change in the play event handler below
let numEvents: number = 0;

// io handler: wait for connection
io.on("connection", (socket: Socket) => {
  console.log("connected");
  const client: Client = {
    player: {
      id: socket.id, //use socketId as client's id
      name: socket.id, // TODO: name?
      cards: [],
      score: 0,
    },
    socket: socket,
  };
  clients.push(client);

  //play event handler: collect 6 playerEvents in a round
  socket.on("play event", function (playerEvent: PlayerEvent) {
    switch (playerEvent.type) {
      case "play card":
        let onePlayerEvent = playerEvent as PlayCardEvent;
        playerEvents.push(onePlayerEvent);
        numEvents++;
        break;
      case "select row":
        RowEvent = playerEvent as SelectRowEvent;
        RowEventFlag = true;
        break;
    }
  });

  if (clients.length == 2) {
    gameStart(clients);
  }
});

function gameStart(clients: Client[]) {
  //generate initial board
  const initialFieldCards: Card[] = [];
  for (let i = 0; i < 4; i++) {
    initialFieldCards.push(randomCard());
  }

  //send 'game start' message with 6 different id
  for (let i = 0; i < clients.length; i++) {
    //generate initial player's cards
    const otherPlayers: Omit<Player, "cards">[] = clients
      .filter((client) => client.player.id != clients[i].player.id)
      .map(({ player: { id, score, name } }) => ({ id, score, name }));
    const gameStartEvent: GameStartEvent = {
      type: "game start",
      player: clients[i].player,
      otherPlayers: otherPlayers,
      initialFieldCards: initialFieldCards,
    };
    console.log(clients[i].player);
    clients[i].socket.emit("game event", gameStartEvent);
  }
}
