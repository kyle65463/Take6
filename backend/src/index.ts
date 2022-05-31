import { createServer } from "http";
import { Server, Socket } from "socket.io";
import { GameOverEvent, GameStartEvent, UpdateGameStatusEvent } from "./models/game_events";
import { PlayCardEvent, PlayerEvent, PlayerInfoEvent, PlayerReadyEvent, SelectRowEvent } from "./models/player_events";
import { Card, randomCard } from "./models/card";
import { Player, Client } from "./models/player";
import { Game, Games } from "./models/game";
import { ChatEvent } from "./models/chat_events";
import { getRandomInt } from "./utils";
import { RoomEvent } from "./models/room_event";

const httpServer = createServer();
export const io = new Server(httpServer, {
	cors: {
		origin: "http://localhost:3000",
		methods: ["GET", "POST"],
	},
});
httpServer.listen(8888);

function newGame(): Game {
	return {
		clients: [],
		fieldCards: [[], [], [], []],
		mode: "none",
		playedCardInfo: [],
		round: 0,
		playerReadyCount: 0,
		usedCards: [],
	};
}

const games: Games = {};
let rawClients: { socket: Socket; roomId?: string }[] = [];

io.on("disconnect", (socket) => {
	try {
		rawClients = rawClients.filter((client) => client.socket.id !== socket.id);
	} catch (e) {}
});

io.on("connection", (socket: Socket) => {
	try {
		console.log("connected");
		rawClients.push({ socket });
	} catch (e) {}

	socket.on("player event", (playerEvent: PlayerEvent) => {
		try {
			console.log("event: ", playerEvent.type);
			switch (playerEvent.type) {
				case "play card": {
					const game = findGame(games, rawClients, socket.id);
					if (!game) return;
					playerPlayedCard(game, playerEvent as PlayCardEvent);
					break;
				}
				case "select row": {
					const game = findGame(games, rawClients, socket.id);
					if (!game) return;
					playerSelectRow(game, playerEvent as SelectRowEvent);
					break;
				}
				case "player info":
					addNewPlayer(games, playerEvent as PlayerInfoEvent, socket.id, rawClients);
					break;
				case "player ready": {
					const roomId = rawClients.find((client) => client.socket.id === socket.id)?.roomId;
					if (!roomId) return;
					const game = games[roomId];
					if (!game) return;
					playerReady(game, socket.id, roomId);
					break;
				}
			}
		} catch (e) {}
	});
	socket.on("chat event", (chatEvent: ChatEvent) => {
		try {
			const game = findGame(games, rawClients, socket.id);
			if (!game) return;
			for (const client of game.clients) {
				client.socket.emit("chat event", chatEvent);
			}
		} catch (e) {}
	});
});

function findGame(games: Games, rawClients: { socket: Socket; roomId?: string }[], socketId: string) {
	const roomId = rawClients.find((socket) => socket.socket.id === socketId)?.roomId;
	if (!roomId) return;
	const game = games[roomId];
	if (!game) return;
	return games[roomId];
}

function addNewPlayer(
	games: Games,
	playerInfoEvent: PlayerInfoEvent,
	socketId: string,
	rawClients: { socket: Socket; roomId?: string }[]
) {
	let { playerName, roomId, photoURL } = playerInfoEvent;
	let game: Game | undefined;
	if (roomId) {
		// Join an existing game
		game = games[roomId];
	} else {
		// Create a new game
		roomId = getRandomInt(1000, 10000).toString();
		while (games[roomId]) {
			roomId = getRandomInt(1000, 10000).toString();
		}
		games[roomId] = newGame();
		game = games[roomId];
	}
	if (!game) return; // Should not happen
	if (!roomId) return; // Should not happen
	if (game.clients.length >= 6) return;

	// Add the player to the game
	const player: Player = {
		id: socketId,
		name: playerName,
		photoURL,
		cards: Array.from(Array(10).keys()).map(() => randomCard(game ?? newGame())),
		score: 0,
		isReady: false,
	};
	player.cards.sort((a, b) => a.number - b.number);
	const rawClient = rawClients.find((socket) => socket.socket.id === socketId);
	if (!rawClient) return; // Should not happen
	rawClient.roomId = roomId;
	const client: Client = {
		player,
		socket: rawClient.socket,
	};
	const clients = game.clients;
	clients.push(client);

	// Send room event to all players in the same game
	for (const client of clients) {
		const player = client.player;
		if (!player) return; // Should not happen
		const otherPlayers = getOtherPlayers(clients, player);
		const roomEvent: RoomEvent = {
			player,
			otherPlayers,
			roomId,
		};
		client.socket.emit("room event", roomEvent);
	}
}

function playerReady(game: Game, socketId: string, roomId: string) {
	// Send room event to all players in the same game
	const clients = game.clients;
	const readyPlayer = game.clients.find((client) => client.socket.id === socketId)?.player;
	if (!readyPlayer) return; // Should not happen
	readyPlayer.isReady = true;
	for (const client of clients) {
		const player = client.player;
		if (!player) return; // Should not happen
		const otherPlayers = getOtherPlayers(clients, player);
		const roomEvent: RoomEvent = {
			player,
			otherPlayers,
			roomId,
		};
		// console.log(roomEvent);
		client.socket.emit("room event", roomEvent);
	}
	const allReady = clients.every((client) => client.player.isReady);
	if (allReady && clients.length > 1) {
		gameStart(game);
	}
}

async function playerSelectRow(game: Game, playCardEvent: SelectRowEvent) {
	const { player, rowIdx } = playCardEvent;
	const { playedCardInfo, fieldCards, clients } = game;

	const score = fieldCards[rowIdx].reduce((prev, cur) => prev + cur.score, 0);
	const foundClient = clients.find((e) => e.player.id == player.id);
	if (!foundClient) {
		console.log("player not found!!");
		return;
	}
	foundClient.player.score += score;
	fieldCards[rowIdx] = [];
	fieldCards[rowIdx].push(playedCardInfo[0].card);
	playedCardInfo.shift();
	updateGameStatus(game);
	await delay(1000);

	//select winner
	if (playedCardInfo.length == 0) {
		game.round++;
		console.log("round: %d", game.round);
		if (game.round == 10) {
			sendWinner(game);
		} else {
			game.mode = "card selection";
			updateGameStatus(game);
			game.mode = "none";
		}
		return;
	}

	//continueing decideRow
	let sz = playedCardInfo.length;
	for (let i = 0; i < sz; i++) {
		await delay(1000);
		decideRow(game);
		updateGameStatus(game);
		if (game.selectRowPlayer) {
			game.selectRowPlayer = undefined;
			game.mode = "none";
			break;
		}
	}
}

function sendWinner(game: Game) {
	const { clients } = game;
	clients.sort((a, b) => a.player.score - b.player.score);
	const winners: Player[] = [];
	for (const client of clients) {
		winners.push(client.player);
	}
	const gameOverEvent: GameOverEvent = {
		winners,
		type: "game over",
	};
	for (const client of clients) {
		client.socket.emit("game event", gameOverEvent);
	}
}

function gameStart(game: Game) {
	console.log("game start");
	//generate initial board
	const { clients } = game;
	const initialFieldCards: Card[] = [];
	game.round = 0;
	for (let i = 0; i < 4; i++) {
		const card: Card = randomCard(game);
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

function getOtherPlayers(clients: Client[], player: Player): Omit<Player, "cards">[] {
	const otherPlayers: Omit<Player, "cards">[] = clients
		.filter((client) => client.player.id != player.id)
		.map(({ player: { id, score, name, isReady, photoURL } }) => ({ id, score, name, isReady, photoURL }));
	return otherPlayers;
}

async function playerPlayedCard(game: Game, playCardEvent: PlayCardEvent) {
	const { player, card } = playCardEvent;
	game.playedCardInfo.push({ playerName: player.name, card, playerId: player.id });

	const foundPlayer = game.clients.find((e) => e.player.id == player.id)?.player;
	if (!foundPlayer) {
		console.log("fk frontend");
		return;
	}
	foundPlayer.cards = foundPlayer.cards.filter((e) => e.number != card.number);

	if (game.playedCardInfo.length === game.clients.length) {
		game.playedCardInfo.sort((a, b) => a.card.number - b.card.number);
		updateGameStatus(game);
		for (let i = 0; i < game.clients.length; i++) {
			await delay(1000);
			decideRow(game);
			updateGameStatus(game);
			if (game.selectRowPlayer) {
				game.selectRowPlayer = undefined;
				game.mode = "none";
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
		//console.log(updateGameStatusEvent);
		socket.emit("game event", updateGameStatusEvent);
	}
}

function decideRow(game: Game) {
	const { playedCardInfo, fieldCards, clients } = game;

	// Find the best match row for the leftmost played card
	const { playerId, card } = playedCardInfo[0];
	const player = clients.find((client) => client.player.id === playerId)?.player;
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
		if (lastCardNumber < card.number && (!maxCardNumber || lastCardNumber > maxCardNumber)) {
			// Update the best matched row idx
			bestMatchRowIdx = i;
			maxCardNumber = lastCardNumber;
		}
	}

	if (bestMatchRowIdx === undefined || maxCardNumber === undefined) {
		game.selectRowPlayer = player;
	} else {
		fieldCards[bestMatchRowIdx].push(card);
		if (fieldCards[bestMatchRowIdx].length > 5) {
			// The row is full, update player's score
			const score = fieldCards[bestMatchRowIdx].reduce((prev, cur) => prev + cur.score, 0);
			player.score += score;
			// Clear the row
			fieldCards[bestMatchRowIdx] = [];
			fieldCards[bestMatchRowIdx].push(card);
		}
		playedCardInfo.shift();

		//select winner
		if (playedCardInfo.length == 0) {
			game.round++;
			console.log("round: %d", game.round);
			if (game.round == 10) {
				sendWinner(game);
			} else {
				game.mode = "card selection";
				updateGameStatus(game);
				game.mode = "none";
			}
		}
	}
}
