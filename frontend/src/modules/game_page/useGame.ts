import { Game } from "@models/game";
import {
	GameOverEvent,
	GameStartEvent,
	UpdateGameStatusEvent,
} from "@models/game_events";
import { Player, SelfPlayer } from "@models/player";
import { PlayCardEvent, SelectRowEvent } from "@models/player_events";
import { EventsContext } from "@utils/context";
import { generateUid } from "@utils/utils";
import { useCallback, useContext, useEffect, useState } from "react";

export function useGame() {
	const [game, setGame] = useState<Game | undefined>();
	const [selectedHandCardId, setSelctedHandCardId] = useState<
		number | undefined
	>();
	const [inRowSelectionMode, setInRowSelectionMode] = useState(false);
	const [inCardSelectionMode, setInCardSelectionMode] = useState(false);
	const [winners, setWinners] = useState<(Player | SelfPlayer)[]>();
	const { gameEvents, sendPlayerEvent, clearGameEvents } =
		useContext(EventsContext);

	const onGameStart = useCallback((gameStartEvent: GameStartEvent) => {
		const { player, otherPlayers, initialFieldCards } = gameStartEvent;
		if (initialFieldCards.length !== 4)
			throw "initialFieldCards.length must be 4";
		player.cards.sort((a, b) => a.number - b.number);
		setGame({
			player,
			otherPlayers,
			fieldCards: [...initialFieldCards.map((card) => [card])],
			playedCardInfo: [],
			mode: "card selection",
		});
		setInCardSelectionMode(true);
	}, []);

	const onGameOver = useCallback((gameOverEvent: GameOverEvent) => {
		const { winners } = gameOverEvent;
		setWinners(winners);
	}, []);

	const onGameStatusUpdate = useCallback(
		(gameUpdateEvent: UpdateGameStatusEvent) => {
			const { player, otherPlayers, fieldCards, mode, playedCardInfo } =
				gameUpdateEvent;
			setGame({
				player,
				otherPlayers,
				fieldCards,
				mode,
				playedCardInfo,
			});
			switch (mode) {
				case "card selection":
					setInCardSelectionMode(true);
					break;
				case "row selection":
					setInRowSelectionMode(true);
					break;
				case "none":
					break;
			}
		},
		[]
	);

	// Listen for every game events
	useEffect(() => {
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
						case "game status update":
							onGameStatusUpdate(
								gameEvent as UpdateGameStatusEvent
							);
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
			if (game && game.playedCardInfo.length > 0) {
				const selectRowEvent: SelectRowEvent = {
					id: generateUid(),
					type: "select row",
					rowIdx: idx,
					player: game.player,
				};
				sendPlayerEvent(selectRowEvent);
				setInRowSelectionMode(false);
			}
		},
		[game, selectedHandCardId]
	);

	// Invoked after confirming playing a hand card
	const playCard = useCallback(
		(idx: number) => {
			if (game) {
				const { player, otherPlayers } = game;
				if (idx < 0 || idx >= player.cards.length)
					throw "Invalid selected card idx";
				const playedCard = player.cards[idx];
				const playCardEvent: PlayCardEvent = {
					id: generateUid(),
					type: "play card",
					player: game.player,
					card: playedCard,
				};
				player.cards.splice(idx, 1);
				sendPlayerEvent(playCardEvent);
				setSelctedHandCardId(undefined); // Unselect the hand card
				setInCardSelectionMode(false);
			}
		},
		[game]
	);

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
