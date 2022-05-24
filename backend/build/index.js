"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setRowEventFlag = exports.onSelectRow = exports.clientList = exports.playerEvents = exports.io = void 0;
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const logic_1 = require("./logic");
const card_1 = require("./models/card");
const httpServer = (0, http_1.createServer)();
exports.io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
    },
});
httpServer.listen(8888);
// variable for playerEvents queue
exports.playerEvents = [];
// variable for row selection
let RowEvent;
let RowEventFlag;
// keep client id from 0 to 5
let id = 0;
// collect 6 playerEvents in a round, change in the play event handler below
let numEvents = 0;
// io handler: wait for connection
exports.io.on("connection", (socket) => {
    console.log("connected");
    const player = {
        id: socket.id,
        name: socket.id,
        cards: Array.from(Array(10).keys()).map(() => (0, card_1.randomCard)()),
        score: 0,
    };
    exports.clientList.push({ player, socket });
    id++;
    //play event handler: collect 6 playerEvents in a round
    socket.on("play event", function (playerEvent) {
        switch (playerEvent.type) {
            case "play card":
                let onePlayerEvent = playerEvent;
                exports.playerEvents.push(onePlayerEvent);
                numEvents++;
                break;
            case "select row":
                RowEvent = playerEvent;
                RowEventFlag = true;
                break;
        }
    });
});
// ***main function***
while (true) {
    if (id === 6) {
        play();
        break;
    }
}
// ******
function play() {
    exports.playerEvents = [];
    // set up the game, and then notify players
    numEvents = 0;
    (0, logic_1.GameStart)();
    let round = 0;
    while (round < 10) {
        while (true) {
            // wait until getting 6 player events,
            if (numEvents == 6) {
                (0, logic_1.playOneRound)();
                round++;
                numEvents = 0;
                break;
            }
        }
    }
    const maxScore = Math.max(...exports.clientList.map((o) => o.player.score));
    let winners = [];
    for (let i = 0; i < 6; i++) {
        if (exports.clientList[i].player.score === maxScore)
            winners.push(exports.clientList[i]);
    }
    //Todo: broadcast winner
}
function onSelectRow(fieldCards, card) {
    while (true) {
        // wait for RowEventFlag on
        if (RowEventFlag == false) {
            continue;
        }
        if (RowEvent.type == "select row") {
            let RowIdx = RowEvent.rowIdx;
            let score = 0;
            for (let i = 0; i < 5; i++)
                score += fieldCards[RowIdx][i].score;
            const index = exports.clientList.findIndex((ele) => ele.player.id === RowEvent.player.id);
            exports.clientList[index].player.score += score;
            for (let i = 0; i < 6; i++) {
                (0, logic_1.sendGameEvent)("none", "game status update", exports.clientList[i]);
            }
            fieldCards[RowIdx] = [];
            fieldCards[RowIdx].push(card);
            break;
        }
    }
}
exports.onSelectRow = onSelectRow;
function setRowEventFlag() {
    RowEventFlag = false;
}
exports.setRowEventFlag = setRowEventFlag;
