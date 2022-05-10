import { randomCard } from "@models/card";
import { Game } from "@models/game";
import {
	AllPlayerPlayedEvent,
	AppendRowEvent,
	ClearRowEvent,
	GameStartEvent,
	StartRowSelectionEvent,
} from "@models/game_events";
import { PlayCardEvent, SelectRowEvent } from "@models/player_events";
import { EventsContext } from "@utils/context";
import { deepCopy, generateUid, getRandomInt } from "@utils/utils";
import { useCallback, useContext, useEffect, useState } from "react";

export function useGame() {
	const [game, setGame] = useState<Game | undefined>();
	const [selectedHandCardId, setSelctedHandCardId] = useState<number | undefined>();
	const [inRowSelectionMode, setInRowSelectionMode] = useState(false);
	const { gameEvents, sendPlayerEvent, clearGameEvents } = useContext(EventsContext);
	const { onGameEvent } = useContext(EventsContext); // ! Used for mocked server
	const [cnt, setCnt] = useState(0); // ! Used for mocked server

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
	}, []);

	const onAppendRow = useCallback((appendRowEvent: AppendRowEvent) => {
		const { card, rowIdx } = appendRowEvent;
		setGame((oldGame) => {
			if (oldGame) {
				const newGame: Game = deepCopy(oldGame);
				const fieldCards = newGame.fieldCards;
				if (rowIdx < 0 || rowIdx >= fieldCards.length) throw "Invalid row idx";

				if (rowIdx >= 6) {
					// The row is full, clear it
					fieldCards[rowIdx] = [];
					// TODO: add score to the player
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
		}, 1000);
	}, []);

	const onClearRow = useCallback((clearRowEvent: ClearRowEvent) => {
		const { card, rowIdx } = clearRowEvent;
		setGame((oldGame) => {
			if (oldGame) {
				const newGame: Game = deepCopy(oldGame);
				const fieldCards = newGame.fieldCards;
				console.log(rowIdx);
				if (rowIdx < 0 || rowIdx >= fieldCards.length) throw "Invalid row idx";

				// Clear the row and add the card
				fieldCards[rowIdx] = [];
				fieldCards[rowIdx].push(card);
				// TODO: add score to the player

				// Delete the leftmost played card, it should be as same as the variable "card"
				newGame.playedCardInfo.shift();
				return newGame;
			}
		});

		// ! Used for mocked server
		setTimeout(() => {
			setCnt((cnt) => cnt + 1);
		}, 1000);
	}, []);

	const onStartRowSelection = useCallback((rowSelectionStartEvent: StartRowSelectionEvent) => {
		setInRowSelectionMode(true);
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
		}, 1000);
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
							onStartRowSelection(gameEvent as StartRowSelectionEvent);
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
		}
	}, [game]);

	// ! Used for mocked server
	useEffect(() => {
		if (cnt > 0) {
			decideRow();
		}
	}, [cnt]);

	return {
		game,
		selectedHandCardId,
		playedCardInfo: game?.playedCardInfo,
		inRowSelectionMode,
		selectRow,
		selectHandCard,
		playCard,
	};
}
