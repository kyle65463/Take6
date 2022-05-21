import { createServer } from "http";
import { Server, Socket } from "socket.io";
import { UpdateGameStatusEvent } from "./models/game_events";
import { PlayCardEvent, PlayerEvent, SelectRowEvent } from "./models/player_events";
import {GameStart, playOneRound, sendGameEvent} from "./logic";
import { Card } from "./models/card";
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
let id: number = 0;

//database of 6 players
export let clientList: SelfPlayer[];

// collect 6 playerEvents in a round, change in the play event handler below
let numEvents: number = 0;

// io handler: wait for connection
io.on("connection", (socket: Socket) => {
  console.log("connected");
  let client: SelfPlayer = {
    id: parseInt(socket.id), //use socketId as client's id  // use parseInt to number from string
    name: "", // TODO: name?
    cards: [],
    score: 0
  };
  clientList.push(client);
  id++;

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
});

// ***main function***
while(true){
  if(id === 6){
    play(socket!);
    break;
  }
}
// ******

function play(socket: Socket){
  playerEvents = [];
  
  // set up the game, and then notify players
  numEvents = 0;
  GameStart(socket);

  let round = 0;
  while(round < 10){
    while(true){
      // wait until getting 6 player events, 
      if (numEvents == 6){
        playOneRound(socket);
        round++;
        numEvents = 0;
        break;
      }
    }
  }
  const maxScore = Math.max(...clientList.map(o => o.score));
  let winners = [];
  for(let i = 0; i < 6; i++){
    if(clientList[i].score === maxScore)
      winners.push(clientList[i]);
  }
  //Todo: broadcast winner
}

export function onSelectRow(fieldCards: Card[][], card: Card){
  while(true){
    // wait for RowEventFlag on
    if(RowEventFlag == false){
      continue;
    }
    if(RowEvent.type == "select row"){
      let RowIdx = RowEvent.rowIdx;
      let score = 0;
      for(let i = 0; i < 5; i++)
        score += fieldCards[RowIdx][i].score;
      const index = clientList.findIndex(ele=>ele.id === RowEvent.player.id);
      clientList[index].score += score;
      
      for(let i = 0; i < 6; i++){
        sendGameEvent("none", "game status update", clientList[i]);
      }

      fieldCards[RowIdx] = [];
      fieldCards[RowIdx].push(card);

      break;
    }
  }
}
export function setRowEventFlag(){
  RowEventFlag = false;
}

