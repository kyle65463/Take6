import { Server } from "socket.io";
import { clientList, io, onSelectRow, playerEvents, setRowEventFlag } from ".";
import { Card, randomCard } from "./models/card";
import { GameEventType, ModeType, UpdateGameStatusEvent } from "./models/game_events";
import { Player, SelfPlayer, SocketPlayer } from "./models/player";
import { PlayCardEvent, PlayerEvent, SelectRowEvent } from "./models/player_events";


// maintain fieldCards and playedCardInfo
let gameEvent: UpdateGameStatusEvent;

//send UpdateGameStatusEvent interface to client
export function sendGameEvent(mode: ModeType, gameEventType: GameEventType, socketPlayer: SocketPlayer){
  const otherPlayers: Player[] = [];
  for(let i = 0; i < 6; i++){
    if(clientList[i].player.id != socketPlayer.player.id){
      let player: Player = {
        id: socketPlayer.player.id,
        name: socketPlayer.player.name,
        score: socketPlayer.player.score
      }
      otherPlayers.push(player)
    }
  }
  let newGameEvent: UpdateGameStatusEvent = {
    player: socketPlayer.player,
    fieldCards: gameEvent.fieldCards,
    mode: mode,
    playedCardInfo: gameEvent.playedCardInfo,
    otherPlayers,
    type: "game status update"
  };
  socketPlayer.socket.emit(gameEventType, newGameEvent);
}

export function GameStart(){
  //generate initial board
  let fieldCards: Card[][] = [[], [], [], []];
  for(let i = 0; i < 4; i++)
    fieldCards[i].push(randomCard());

  //generate initial player's cards
  gameEvent.fieldCards = fieldCards;

  //send 'game start' message with 6 different id
  for(let i = 0; i < 6; i++){
    sendGameEvent("card selection", "game start", clientList[i]);
  }
}

export function playOneRound(){
  playerEvents.sort((a, b) => a.card.number - b.card.number);
  for(let i = 0; i < playerEvents.length; i++){
    gameEvent.playedCardInfo.push({playerName: playerEvents[i].player.name, card: playerEvents[i].card});
  }
  let fieldCards = gameEvent.fieldCards;

  while (playerEvents.length > 0) {
    let playerEvent = playerEvents.shift();
    if (!playerEvent) {
      console.log("playerEvent not found");
      return;
    }
    let {flag, card} = onPlayCard(playerEvent, fieldCards);
    if(flag == true){
      onSelectRow(fieldCards, card!);
    }
  }
  return;
}


export function onPlayCard(playerEvent: PlayCardEvent, fieldCards: Card[][]){
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
        let socketId = clientList[i].player.id;
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
      const index = clientList.findIndex(ele=>ele.player.id === playerEvent.player.id);
      clientList[index].player.score += score;

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