"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onPlayCard = exports.playOneRound = exports.GameStart = exports.sendGameEvent = void 0;
const _1 = require(".");
const card_1 = require("./models/card");
// maintain fieldCards and playedCardInfo
let gameEvent;
//send UpdateGameStatusEvent interface to client
function sendGameEvent(mode, gameEventType, socketPlayer) {
    const otherPlayers = [];
    for (let i = 0; i < 6; i++) {
        if (_1.clientList[i].player.id != socketPlayer.player.id) {
            let player = {
                id: socketPlayer.player.id,
                name: socketPlayer.player.name,
                score: socketPlayer.player.score
            };
            otherPlayers.push(player);
        }
    }
    let newGameEvent = {
        player: socketPlayer.player,
        fieldCards: gameEvent.fieldCards,
        mode: mode,
        playedCardInfo: gameEvent.playedCardInfo,
        otherPlayers,
        type: "game status update"
    };
    socketPlayer.socket.emit(gameEventType, newGameEvent);
}
exports.sendGameEvent = sendGameEvent;
function GameStart() {
    //generate initial board
    let fieldCards = [[], [], [], []];
    for (let i = 0; i < 4; i++)
        fieldCards[i].push((0, card_1.randomCard)());
    //generate initial player's cards
    gameEvent.fieldCards = fieldCards;
    //send 'game start' message with 6 different id
    for (let i = 0; i < 6; i++) {
        sendGameEvent("card selection", "game start", _1.clientList[i]);
    }
}
exports.GameStart = GameStart;
function playOneRound() {
    _1.playerEvents.sort((a, b) => a.card.number - b.card.number);
    for (let i = 0; i < _1.playerEvents.length; i++) {
        gameEvent.playedCardInfo.push({ playerName: _1.playerEvents[i].player.name, card: _1.playerEvents[i].card });
    }
    let fieldCards = gameEvent.fieldCards;
    while (_1.playerEvents.length > 0) {
        let playerEvent = _1.playerEvents.shift();
        if (!playerEvent) {
            console.log("playerEvent not found");
            return;
        }
        let { flag, card } = onPlayCard(playerEvent, fieldCards);
        if (flag == true) {
            (0, _1.onSelectRow)(fieldCards, card);
        }
    }
    return;
}
exports.playOneRound = playOneRound;
function onPlayCard(playerEvent, fieldCards) {
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
        (0, _1.setRowEventFlag)();
        //send mode "row select" to this player, and send mode "none" to others
        for (let i = 0; i < 6; i++) {
            let socketId = _1.clientList[i].player.id;
            if (socketId == playerEvent.player.id) {
                sendGameEvent("row selection", "game status update", _1.clientList[i]);
            }
            else {
                sendGameEvent("none", "game status update", _1.clientList[i]);
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
            for (let i = 0; i < 5; i++)
                score += fieldCards[bestMatchRowIdx][i].score;
            const index = _1.clientList.findIndex(ele => ele.player.id === playerEvent.player.id);
            _1.clientList[index].player.score += score;
            fieldCards[bestMatchRowIdx] = [];
        }
        fieldCards[bestMatchRowIdx].push(playerEvent.card);
        gameEvent.fieldCards = fieldCards;
        gameEvent.playedCardInfo.shift();
        for (let i = 0; i < 6; i++) {
            sendGameEvent("none", "game status update", _1.clientList[i]);
        }
        return {
            flag: false,
            card: undefined
        };
    }
}
exports.onPlayCard = onPlayCard;
