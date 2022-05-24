import { createServer } from "http";
import { Server, Socket } from "socket.io";
import { GameEvent, GameStartEvent, UpdateGameStatusEvent } from "./models/game_events";
import { PlayCardEvent, PlayerEvent, SelectRowEvent } from "./models/player_events";
import { Card, randomCard } from "./models/card";
import { SelfPlayer } from "./models/player";

const httpServer = createServer();
export const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});
httpServer.listen(8888);
// const socket: Socket = undefined;
let socket: Socket|undefined = undefined;



// variable for playerEvents queue
export let playerEvents: PlayCardEvent[] = [];

// variable for row selection
let RowEvent: SelectRowEvent;
let RowEventFlag: boolean;

// keep client id from 0 to 5
let numPlayer: number = 0;

//database of 6 players
export let clientList: SelfPlayer[] = [];

// collect 6 playerEvents in a round, change in the play event handler below
let numEvents: number = 0;

// io handler: wait for connection
io.on("connection", (socket: Socket) => {
  console.log("connected");
  let client: SelfPlayer = {
    id: socket.id, //use socketId as client's id  // use parseInt to number from string
    name: "", // TODO: name?
    cards: [],
    score: 0
  };
  console.log(client);
  clientList.push(client);
  numPlayer++;

  //play event handler: collect 6 playerEvents in a round
  socket.on('play event', function (playerEvent: PlayerEvent) {
    switch (playerEvent.type) {
      case 'play card':
        let onePlayerEvent = playerEvent as PlayCardEvent;
        playerEvents.push(onePlayerEvent);
        numEvents++;
        break;
      case 'select row':
        RowEvent = playerEvent as SelectRowEvent;
        RowEventFlag = true;
        break;
    }
  });

  if (numPlayer == 2) {
    const cunt: GameStartEvent = {
      id: "bitch#1",
      type: "game start",
      player: client,
      otherPlayers: [client],
      initialFieldCards: [randomCard(), randomCard(), randomCard(), randomCard()]
    };
    socket.emit("game event", cunt);
  }
});