import { Server, Socket } from "socket.io";
import { clientList, io, onSelectRow, playerEvents, setRowEventFlag } from ".";
import { Card, randomCard } from "./models/card";
import { GameEventType, ModeType, UpdateGameStatusEvent } from "./models/game_events";
import { Player, randomSelfPlayer, SelfPlayer } from "./models/player";
import { PlayCardEvent, PlayerEvent, SelectRowEvent } from "./models/player_events";


// maintain fieldCards and playedCardInfo
let gameEvent: UpdateGameStatusEvent;

//send UpdateGameStatusEvent interface to client
export function sendGameEvent(mode: ModeType, gameEventType: GameEventType, selfPlayer: SelfPlayer){
  // let newGameEvent: UpdateGameStatusEvent = undefined; 
  let otherPlayers: Player[] = [];
  // newGameEvent.player = selfPlayer;
  for(let i = 0; i < 6; i++){
    if(clientList[i].id != selfPlayer.id){
      let player: Player = {
        id: selfPlayer.id,
        name: selfPlayer.name,
        score: selfPlayer.score
      }
      // newGameEvent.otherPlayers.push(player)
      otherPlayers.push(player)
    }
  }
  let newGameEvent: UpdateGameStatusEvent = {
    player: selfPlayer,
    otherPlayers: otherPlayers,
    mode: mode,
    playedCardInfo:  gameEvent.playedCardInfo,
    fieldCards: [], // TODO: the field cards?
    id: String(selfPlayer.id), // TODO: which id to use?
    type: gameEventType
  };
  // newGameEvent.fieldCards = gameEvent.fieldCards;
  // newGameEvent.mode = mode;
  // newGameEvent.playedCardInfo = gameEvent.playedCardInfo;
  // io.sockets.socket(selfPlayer.id).emit(gameEventType, newGameEvent);
  io.sockets.emit(gameEventType, newGameEvent)
}

export function GameStart(socket: Socket){
  //generate initial board
  let fieldCards: Card[][] = [];
  for(let i = 0; i < 4; i++)
    fieldCards[i].push(randomCard());

  //generate initial player's cards
  gameEvent.fieldCards = fieldCards;

  //send 'game start' message with 6 different id
  for(let i = 0; i < 6; i++){
    let id = clientList[i].id;
    let player = randomSelfPlayer(id);
    sendGameEvent("card selection", "game start", player);
  }
}

export function playOneRound(socket: Socket){
  playerEvents.sort((a, b) => a.card.number - b.card.number);
  for(let i = 0; i < playerEvents.length; i++){
    gameEvent.playedCardInfo.push({playerId: playerEvents[i].player.id, card: playerEvents[i].card});
  }
  let fieldCards = gameEvent.fieldCards;

  while (playerEvents.length > 0) {
    let PlayerEvent = playerEvents.shift()!; // add ! to assume that it will not be undefined
    let {flag, card} = onPlayCard(socket, PlayerEvent, fieldCards);
    if(flag == true){
      onSelectRow(fieldCards, card!); // add ! to assume that it will not be undefined

    }
  }
  return;
}


export function onPlayCard(socket: Socket, playerEvent: PlayCardEvent, fieldCards: Card[][]){
  let bestMatchRowIdx = -1;
  let maxCardNumber = 0;

  for (let i = 0; i < fieldCards.length; i++) {
    const row = fieldCards[i];
    const lastCardNumber = row[row.length - 1].number; 
    if (lastCardNumber < playerEvent.card.number && lastCardNumber > maxCardNumber) {
      bestMatchRowIdx = i;
      maxCardNumber = lastCardNumber;
    }
  }
  if (bestMatchRowIdx === -1 || maxCardNumber === 0) {

      gameEvent.fieldCards = fieldCards;
      gameEvent.playedCardInfo.shift();

      //set RowEventFlag to false in index.ts. RowEventFlag is true if the player send "select row"
      setRowEventFlag();

      //send mode "row select" to this player, and send mode "none" to others
      for(let i = 0; i < 6; i++){
        let socketId = clientList[i].id;
        if(socketId == playerEvent.player.id){
          sendGameEvent("row selection", "game status update", clientList[i]);
        } else{
          sendGameEvent("none", "game status update", clientList[i]);
        }
      }

      //keep the row selection card, return true to enter row selection state
      return {
        flag: true, 
        card: playerEvent.card
      };
  }
  else {
    if (fieldCards[bestMatchRowIdx].length >= 5) {
      let score = 0;
      for(let i = 0; i < 5; i++)
        score += fieldCards[bestMatchRowIdx][i].score;
      const index = clientList.findIndex(ele=>ele.id === playerEvent.player.id);
      clientList[index].score += score;

      fieldCards[bestMatchRowIdx] = [];
    }
    fieldCards[bestMatchRowIdx].push(playerEvent.card);

    gameEvent.fieldCards = fieldCards;
    gameEvent.playedCardInfo.shift();
    for(let i = 0; i < 6; i++){
      sendGameEvent("none", "game status update", clientList[i]);
    }

    return {
      flag: false, 
      card: undefined
    };
  }

}