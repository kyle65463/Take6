import { randomCard } from "@models/card";
import { Game } from "@models/game";
import { AllPlayerPlayedEvent, GameStartEvent, RowUpdateEvent } from "@models/game_events";
import { PlayCardEvent } from "@models/player_events";
import { EventsContext } from "@utils/context";
import { deepCopy, generateUid } from "@utils/utils";
import { useCallback, useContext, useEffect, useState } from "react";

export function useGame() {
	const [game, setGame] = useState<Game | undefined>();
	const [selectedHandCardId, setSelctedHandCardId] = useState<number | undefined>();
	const { gameEvents, sendPlayerEvent, clearGameEvents } = useContext(EventsContext);
	const { onGameEvent } = useContext(EventsContext); // ! Used for mocked server
	const [cnt, setCnt] = useState(0); // ! Used for mocked server

	const onGameStart = useCallback((gameStartEvent: GameStartEvent) => {
		const { player, otherPlayers, initialFieldCards } = gameStartEvent;
		if (initialFieldCards.length !== 4) throw "initialFieldCards.length must be 4";
		setGame({
			player,
			otherPlayers,
			fieldCards: [...initialFieldCards.map((card) => [card])],
			playedCardInfo: [],
		});
	}, []);

	const onRowUpdate = useCallback((rowUpdateEvent: RowUpdateEvent) => {
		const { card, rowIdx } = rowUpdateEvent;
		setGame((oldGame) => {
			if (oldGame) {
				const newGame: Game = deepCopy(oldGame);
				const fieldCards = newGame.fieldCards;
				// Add the card to the target row
				if (rowIdx < 0 || rowIdx >= fieldCards.length) throw "Invalid row idx";
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
						case "row update":
							onRowUpdate(gameEvent as RowUpdateEvent);
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
			const { playedCardInfo, fieldCards } = newGame;

			// Find the best match row for the leftmost played card
			const { card } = playedCardInfo[0];
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
				// TODO: Choose a row to clear
				const rowUpdateEvent: RowUpdateEvent = {
					id: generateUid(),
					type: "row update",
					card,
					rowIdx: 0,
				};
				onGameEvent(rowUpdateEvent);
			} else {
				const rowUpdateEvent: RowUpdateEvent = {
					id: generateUid(),
					type: "row update",
					card,
					rowIdx: bestMatchRowIdx,
				};
				onGameEvent(rowUpdateEvent);
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

	return { game, selectedHandCardId, playedCardInfo: game?.playedCardInfo, selectHandCard, playCard };
}
