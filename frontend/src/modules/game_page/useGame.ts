import { Game } from "@models/game";
import { GameStartEvent } from "@models/game_events";
import { EventsContext } from "@utils/context";
import { useCallback, useContext, useEffect, useState } from "react";

export function useGame() {
	const [game, setGame] = useState<Game>();
	const [selectedHandCardId, setSelctedHandCardId] = useState<number | undefined>();
	const { gameEvents } = useContext(EventsContext);

	// Listen for every game events
	useEffect(() => {
		// TODO: catch errors?
		const gameEvent = gameEvents.shift(); // Pop the first element
		if (gameEvent) {
			// Handle the game event
			switch (gameEvent.type) {
				case "game start":
					const { player, otherPlayers, initialFieldCards } = gameEvent as GameStartEvent;
					if (initialFieldCards.length !== 4) throw "initialFieldCards.length must be 4";
					const newGame = {
						player,
						otherPlayers,
						fieldCards: [...initialFieldCards.map((card) => [card])],
					};
					setGame(newGame);
				case "game update":
					console.log("hi");
			}
		}
	}, [gameEvents]);

	const selectHandCard = useCallback(
		(id: number) => {
			if (id === selectedHandCardId) {
				// Unselect it
				setSelctedHandCardId(undefined);
			} else {
				setSelctedHandCardId(id);
			}
		},
		[selectedHandCardId]
	);

	return { game, selectedHandCardId, selectHandCard };
}
