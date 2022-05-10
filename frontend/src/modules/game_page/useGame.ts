import { randomCard } from "@models/card";
import { Game } from "@models/game";
import { GameStartEvent, GameUpdateEvent } from "@models/game_events";
import { PlayCardEvent } from "@models/player_events";
import { EventsContext } from "@utils/context";
import { deepCopy, generateUid } from "@utils/utils";
import { useCallback, useContext, useEffect, useState } from "react";

export function useGame() {
	const [game, setGame] = useState<Game | undefined>();
	const [selectedHandCardId, setSelctedHandCardId] = useState<number | undefined>();
	const { gameEvents, sendPlayerEvent } = useContext(EventsContext);
	const { onGameEvent } = useContext(EventsContext); // ! Used for mocked server

	const onGameStart = useCallback((gameStartEvent: GameStartEvent) => {
		const { player, otherPlayers, initialFieldCards } = gameStartEvent;
		if (initialFieldCards.length !== 4) throw "initialFieldCards.length must be 4";
		setGame({
			player,
			otherPlayers,
			fieldCards: [...initialFieldCards.map((card) => [card])],
		});
	}, []);

	const onGameUpdate = useCallback((gameUpdateEvent: GameUpdateEvent) => {
		const { playedCardInfo } = gameUpdateEvent;
		playedCardInfo.sort((a, b) => a.card.number - b.card.number);

		// Append each card to the end of the corresponding row by the rule
		setGame((oldGame) => {
			if (oldGame) {
				const newGame = deepCopy(oldGame);
				const fieldCards = newGame.fieldCards;
				playedCardInfo.forEach(({ card }) => {
					// Find the best match row for each played card
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
					} else {
						// Append the played card to the corresponding row
						fieldCards[bestMatchRowIdx].push(card);
					}
				});
				return newGame;
			}
		});
	}, []);

	// Listen for every game events
	useEffect(() => {
		// TODO: catch errors?
		while (gameEvents.length > 0) {
			const gameEvent = gameEvents.shift(); // Pop the first element
			if (gameEvent) {
				// Handle the game event
				switch (gameEvent.type) {
					case "game start":
						onGameStart(gameEvent as GameStartEvent);
						break;
					case "game update":
						onGameUpdate(gameEvent as GameUpdateEvent);
						break;
				}
			}
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
				const gameUpdateEvent: GameUpdateEvent = {
					id: generateUid(),
					type: "game update",
					playedCardInfo: [
						{ playerName: player.name, card: playedCard },
						...otherPlayers.map((otherPlayer) => ({
							playerName: otherPlayer.name,
							card: randomCard(),
						})),
					],
				};
				onGameEvent(gameUpdateEvent);
			}
		},
		[game]
	);

	return { game, selectedHandCardId, selectHandCard, playCard };
}
