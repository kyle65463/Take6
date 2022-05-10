import { randomCard } from "@models/card";
import { Game } from "@models/game";
import {
	AllPlayerPlayedEvent,
	AppendRowEvent,
	ClearRowEvent,
	GameOverEvent,
	GameStartEvent,
	StartCardSelectionEvent,
	StartRowSelectionEvent,
} from "@models/game_events";
import { Player, randomPlayer, randomSelfPlayer, SelfPlayer } from "@models/player";
import { PlayCardEvent, SelectRowEvent } from "@models/player_events";
import { EventsContext } from "@utils/context";
import { deepCopy, generateUid, getRandomInt } from "@utils/utils";
import { useCallback, useContext, useEffect, useState } from "react";

export function useGame() {
	const [game, setGame] = useState<Game | undefined>();
	const [selectedHandCardId, setSelctedHandCardId] = useState<number | undefined>();
	const [inRowSelectionMode, setInRowSelectionMode] = useState(false);
	const [inCardSelectionMode, setInCardSelectionMode] = useState(false);
	const [winners, setWinners] = useState<(Player | SelfPlayer)[]>();
	const { gameEvents, sendPlayerEvent, clearGameEvents } = useContext(EventsContext);
	const { onGameEvent } = useContext(EventsContext); // ! Used for mocked server
	const [cnt, setCnt] = useState(0); // ! Used for mocked server
	const interval = 1350; // ! Used for mocked server

	const onGameStart = useCallback((gameStartEvent: GameStartEvent) => {
		const { player, otherPlayers, initialFieldCards } = gameStartEvent;
		if (initialFieldCards.length !== 4) throw "initialFieldCards.length must be 4";
		player.cards.sort((a, b) => a.number - b.number);
		setGame({
			player,
			otherPlayers,
			fieldCards: [...initialFieldCards.map((card) => [card])],
			playedCardInfo: [],
		});
		setInCardSelectionMode(true);
	}, []);

	const onGameOver = useCallback((gameOverEvent: GameOverEvent) => {
		const { winners } = gameOverEvent;
		setWinners(winners);
	}, []);

	const onAppendRow = useCallback((appendRowEvent: AppendRowEvent) => {
		const { playerName, card, rowIdx } = appendRowEvent;
		setGame((oldGame) => {
			if (oldGame) {
				const newGame: Game = deepCopy(oldGame);
				const { fieldCards, otherPlayers } = newGame;
				if (rowIdx < 0 || rowIdx >= fieldCards.length) throw "Invalid row idx";

				// Check if the row is full
				if (fieldCards[rowIdx].length >= 5) {
					// The row is full, update player's score
					const score = fieldCards[rowIdx].reduce((prev, cur) => prev + cur.score, 0);
					const player = otherPlayers.find((player) => player.name === playerName);
					if (player) {
						player.score += score;
					} else {
						if (newGame.player.name === playerName) {
							newGame.player.score += score;
						} else throw "Player not found";
					}

					// Clear the row
					fieldCards[rowIdx] = [];
				}

				// Add the card to the target row
				fieldCards[rowIdx].push(card);

				// Delete the leftmost played card, it should be as same as the variable "card"
				newGame.playedCardInfo.shift();
				return newGame;
			}
		});

		// ! Used for mocked server
		setTimeout(() => {
			setCnt((cnt) => cnt + 1);
		}, interval);
	}, []);

	const onClearRow = useCallback((clearRowEvent: ClearRowEvent) => {
		const { playerName, card, rowIdx } = clearRowEvent;
		setGame((oldGame) => {
			if (oldGame) {
				const newGame: Game = deepCopy(oldGame);
				const { fieldCards, otherPlayers } = newGame;
				if (rowIdx < 0 || rowIdx >= fieldCards.length) throw "Invalid row idx";

				// Update player's score
				const score = fieldCards[rowIdx].reduce((prev, cur) => prev + cur.score, 0);
				fieldCards[rowIdx] = [];
				const player = otherPlayers.find((player) => player.name === playerName);
				if (player) {
					player.score += score;
				} else {
					if (newGame.player.name === playerName) {
						newGame.player.score += score;
					} else throw "Player not found";
				}

				// Clear the row and add the card
				fieldCards[rowIdx] = [];
				fieldCards[rowIdx].push(card);

				// Delete the leftmost played card, it should be as same as the variable "card"
				newGame.playedCardInfo.shift();
				return newGame;
			}
		});

		// ! Used for mocked server
		setTimeout(() => {
			setCnt((cnt) => cnt + 1);
		}, interval);
	}, []);

	const onAllPlayerPlayed = useCallback((gameUpdateEvent: AllPlayerPlayedEvent) => {
		const { playedCardInfo } = gameUpdateEvent;
		playedCardInfo.sort((a, b) => a.card.number - b.card.number);
		setGame((oldGame) => {
			if (oldGame) {
				const newGame: Game = deepCopy(oldGame);
				newGame.playedCardInfo = playedCardInfo;
				return newGame;
			}
		});

		// ! Used for mocked server
		setTimeout(() => {
			setCnt((cnt) => cnt + 1);
		}, interval);
	}, []);

	// Listen for every game events
	useEffect(() => {
		// TODO: catch errors?
		if (gameEvents.length > 0) {
			while (gameEvents.length > 0) {
				const gameEvent = gameEvents.shift(); // Pop the first element
				if (gameEvent) {
					// Handle the game event
					switch (gameEvent.type) {
						case "game start":
							onGameStart(gameEvent as GameStartEvent);
							break;
						case "game over":
							onGameOver(gameEvent as GameOverEvent);
							break;
						case "all player played":
							onAllPlayerPlayed(gameEvent as AllPlayerPlayedEvent);
							break;
						case "append row":
							onAppendRow(gameEvent as AppendRowEvent);
							break;
						case "clear row":
							onClearRow(gameEvent as ClearRowEvent);
							break;
						case "start row selection":
							setInRowSelectionMode(true);
							break;
						case "start card selection":
							setInCardSelectionMode(true);
							break;
					}
				}
			}
			clearGameEvents();
		}
	}, [gameEvents]);

	// Invoked when the player click a hand card
	const selectHandCard = useCallback(
		(idx: number) => {
			if (idx === selectedHandCardId) {
				// Unselect it
				setSelctedHandCardId(undefined);
			} else {
				setSelctedHandCardId(idx);
			}
		},
		[selectedHandCardId]
	);

	// Invoked when the player click a row in row selection mode
	const selectRow = useCallback(
		(idx: number) => {
			const selectRowEvent: SelectRowEvent = {
				id: generateUid(),
				type: "select row",
				rowIdx: idx,
			};
			sendPlayerEvent(selectRowEvent);
			setInRowSelectionMode(false);

			// ! Used for mocked server
			if (game && game.playedCardInfo.length > 0) {
				const clearRowEvent: ClearRowEvent = {
					id: generateUid(),
					type: "clear row",
					playerName: game.player.name,
					card: game.playedCardInfo[0].card,
					rowIdx: idx,
				};
				onGameEvent(clearRowEvent);
			}
		},
		[game, selectedHandCardId]
	);

	// Invoked after confirming playing a hand card
	const playCard = useCallback(
		(idx: number) => {
			if (game) {
				const { player, otherPlayers } = game;
				if (idx < 0 || idx >= player.cards.length) throw "Invalid selected card idx";
				const playedCard = player.cards[idx];
				const playCardEvent: PlayCardEvent = {
					id: generateUid(),
					type: "play card",
					// TODO: add the card information to event
				};
				player.cards.splice(idx, 1);
				sendPlayerEvent(playCardEvent);
				setSelctedHandCardId(undefined); // Unselect the hand card
				setInCardSelectionMode(false);

				// ! Used for mocked server
				const allPlayerPlayedEvent: AllPlayerPlayedEvent = {
					id: generateUid(),
					type: "all player played",
					playedCardInfo: [
						{ playerName: player.name, card: playedCard },
						...otherPlayers.map((otherPlayer) => ({
							playerName: otherPlayer.name,
							card: randomCard(),
						})),
					],
				};
				onGameEvent(allPlayerPlayedEvent);
			}
		},
		[game]
	);

	// ! Used for mocked server
	const decideRow = useCallback(() => {
		if (game && game.playedCardInfo.length > 0) {
			const newGame: Game = deepCopy(game);
			const { playedCardInfo, fieldCards, player } = newGame;

			// Find the best match row for the leftmost played card
			const { playerName, card } = playedCardInfo[0];
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
				if (playerName === player.name) {
					// The player should choose a row to clear
					const startRowSelectionEvent: StartRowSelectionEvent = {
						id: generateUid(),
						type: "start row selection",
					};
					onGameEvent(startRowSelectionEvent);
				} else {
					const clearRowEvent: ClearRowEvent = {
						id: generateUid(),
						type: "clear row",
						playerName,
						card,
						rowIdx: getRandomInt(0, 4),
					};
					onGameEvent(clearRowEvent);
				}
			} else {
				const appendRowEvent: AppendRowEvent = {
					id: generateUid(),
					type: "append row",
					playerName,
					card,
					rowIdx: bestMatchRowIdx,
				};
				onGameEvent(appendRowEvent);
			}
			return newGame;
		} else {
			// ! Used for mocked server
			const startCardSelectionEvent: StartCardSelectionEvent = {
				id: generateUid(),
				type: "start card selection",
			};
			onGameEvent(startCardSelectionEvent);

			if (game && game?.player.cards.length === 0) {
				let minScore = Number.MAX_SAFE_INTEGER;
				for (const player of game.otherPlayers) {
					minScore = Math.min(minScore, player.score);
				}
				minScore = Math.min(minScore, game.player.score);

				const winners: (Player | SelfPlayer)[] = [];
				for (const player of game.otherPlayers) {
					if (player.score === minScore) {
						winners.push(player);
					}
				}
				if (game.player.score === minScore) winners.push(game.player);

				const gameOverEvent: GameOverEvent = {
					id: generateUid(),
					type: "game over",
					winners,
				};
				onGameEvent(gameOverEvent);
			}
		}
	}, [game]);

	// ! Used for mocked server
	useEffect(() => {
		if (cnt > 0) {
			decideRow();
		}
	}, [cnt]);

	// ! Used for mocked server
	useEffect(() => {
		const mockedGameStartEvent: GameStartEvent = {
			type: "game start",
			id: generateUid(),
			player: randomSelfPlayer(),
			otherPlayers: [...Array.from(Array(4).keys()).map((i) => randomPlayer(i + 1))], // 4 random other players
			initialFieldCards: [...Array.from(Array(4).keys()).map(() => randomCard())], // 4 random initial field cards
		};
		onGameEvent(mockedGameStartEvent);
	}, []);

	return {
		game,
		selectedHandCardId,
		playedCardInfo: game?.playedCardInfo,
		inRowSelectionMode,
		inCardSelectionMode,
		winners,
		selectRow,
		selectHandCard,
		playCard,
	};
}
