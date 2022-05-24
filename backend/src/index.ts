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
import { Game } from "./models/game";

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

const game: Game = {
  players: [],
  fieldCards: [[], [], [], []],
  mode: "none",
  playedCardInfo: [],
};

//database of 6 players
let clients: Client[] = [];

// io handler: wait for connection
io.on("connection", (socket: Socket) => {
  console.log("connected");
  const player: Player = {
    id: socket.id, //use socketId as client's id
    name: socket.id, // TODO: name?
    cards: Array.from(Array(10).keys()).map(() => randomCard()),
    score: 0,
  };
  const client: Client = {
    player: player,
    socket: socket,
  };
  game.players.push(player);
  clients.push(client);

  //play event handler: collect 6 playerEvents in a round
  socket.on("player event", (playerEvent: PlayerEvent) => {
    console.log(playerEvent);
    switch (playerEvent.type) {
      case "play card":
        playerPlayedCard(game, playerEvent as PlayCardEvent);
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
    const card: Card = randomCard();
    initialFieldCards.push(card);
    game.fieldCards[i].push(card);
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

function playerPlayedCard(game: Game, playCardEvent: PlayCardEvent) {
  const {player, card} = playCardEvent;
  game.playedCardInfo.push({playerName: player.name, card});
  
  const foundPlayer =  game.players.find((e)=>e.id == player.id);
  if (!foundPlayer) {
    console.log("fk frontend");
    return;
  }
  foundPlayer.cards = foundPlayer.cards.filter((e)=>e.number != card.number);
  console.log(foundPlayer.cards);

  if (game.playedCardInfo.length === game.players.length) {
    
  }
}