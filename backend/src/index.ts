import { createServer } from "http";
import { Server, Socket } from "socket.io";
import { GameStartEvent, UpdateGameStatusEvent } from "./models/game_events";
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
  clients: [],
  fieldCards: [[], [], [], []],
  mode: "none",
  playedCardInfo: [],
};

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
  game.clients.push(client);

  //play event handler: collect 6 playerEvents in a round
  socket.on("player event", (playerEvent: PlayerEvent) => {
    console.log("event: ", playerEvent.type);
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

  if (game.clients.length == 2) {
    gameStart(game);
  }
});

function gameStart(game: Game) {
  //generate initial board
  const { clients } = game;
  const initialFieldCards: Card[] = [];
  for (let i = 0; i < 4; i++) {
    const card: Card = randomCard();
    initialFieldCards.push(card);
    game.fieldCards[i].push(card);
  }

  //send 'game start' message with 6 different id
  for (let i = 0; i < clients.length; i++) {
    //generate initial player's cards
    const otherPlayers = getOtherPlayers(clients, clients[i].player);
    const gameStartEvent: GameStartEvent = {
      type: "game start",
      player: clients[i].player,
      otherPlayers: otherPlayers,
      initialFieldCards: initialFieldCards,
    };
    // console.log(clients[i].player);
    clients[i].socket.emit("game event", gameStartEvent);
  }
}

function getOtherPlayers(
  clients: Client[],
  player: Player
): Omit<Player, "cards">[] {
  const otherPlayers: Omit<Player, "cards">[] = clients
    .filter((client) => client.player.id != player.id)
    .map(({ player: { id, score, name } }) => ({ id, score, name }));
  return otherPlayers;
}

async function playerPlayedCard(game: Game, playCardEvent: PlayCardEvent) {
  const { player, card } = playCardEvent;
  game.playedCardInfo.push({ playerName: player.name, card });

  const foundPlayer = game.clients.find(
    (e) => e.player.id == player.id
  )?.player;
  if (!foundPlayer) {
    console.log("fk frontend");
    return;
  }
  foundPlayer.cards = foundPlayer.cards.filter((e) => e.number != card.number);
  // console.log(foundPlayer.cards);

  if (game.playedCardInfo.length === game.clients.length) {
    game.playedCardInfo.sort((a, b) => a.card.number - b.card.number);
    updateGameStatus(game);
    for (let i = 0; i < game.clients.length; i++) {
      decideRow(game);
      await delay(1000);
      updateGameStatus(game);
      if (game.selectRowPlayer) {
        game.selectRowPlayer = undefined;
        break;
      }
    }
  }
}

function delay(time: number) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

function updateGameStatus(game: Game) {
  const { clients, fieldCards, mode, playedCardInfo, selectRowPlayer } = game;
  for (const { player, socket } of clients) {
    const otherPlayers = getOtherPlayers(clients, player);
    const updateGameStatusEvent: UpdateGameStatusEvent = {
      player,
      otherPlayers,
      fieldCards,
      mode: selectRowPlayer && player.id == selectRowPlayer.id ? "row selection" : mode,
      playedCardInfo,
      type: "game status update",
    };
    socket.emit("game event", updateGameStatusEvent);
  }
}

function decideRow(game: Game) {
  const { playedCardInfo, fieldCards, clients } = game;

  // Find the best match row for the leftmost played card
  const { playerName, card } = playedCardInfo[0];
  console.log(game);
  const player = clients.find((client) => client.player.name === playerName)?.player;
  if (!player) {
    console.log("player not found");
    return;
  }

  let bestMatchRowIdx: number | undefined;
  let maxCardNumber: number | undefined;

  // Iterate every rows
  for (let i = 0; i < fieldCards.length; i++) {
    const row = fieldCards[i];
    if (row.length === 0) throw "Invalid card number of a row";
    const lastCardNumber = row[row.length - 1].number; // The rightmost number of a row
    if (
      lastCardNumber < card.number &&
      (!maxCardNumber || lastCardNumber > maxCardNumber)
    ) {
      // Update the best matched row idx
      bestMatchRowIdx = i;
      maxCardNumber = lastCardNumber;
    }
  }

  if (bestMatchRowIdx === undefined || maxCardNumber === undefined) {
    game.selectRowPlayer = player;
  } else {
    fieldCards[bestMatchRowIdx].push(card);
    if (fieldCards.length > 5) {
      // The row is full, update player's score
      const score = fieldCards[bestMatchRowIdx].reduce(
        (prev, cur) => prev + cur.score,
        0
      );
      player.score += score;
      // Clear the row
      fieldCards[bestMatchRowIdx] = [];
    }
    playedCardInfo.shift();
  }
}
