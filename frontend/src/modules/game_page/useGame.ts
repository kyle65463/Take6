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
  UpdateGameStatusEvent,
} from "@models/game_events";
import {
  Player,
  randomPlayer,
  randomSelfPlayer,
  SelfPlayer,
} from "@models/player";
import { PlayCardEvent, SelectRowEvent } from "@models/player_events";
import { EventsContext } from "@utils/context";
import { deepCopy, generateUid, getRandomInt } from "@utils/utils";
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

  // const onAppendRow = useCallback((appendRowEvent: AppendRowEvent) => {
  // 	const { playerName, card, rowIdx } = appendRowEvent;
  // 	setGame((oldGame) => {
  // 		if (oldGame) {
  // 			const newGame: Game = deepCopy(oldGame);
  // 			const { fieldCards, otherPlayers } = newGame;
  // 			if (rowIdx < 0 || rowIdx >= fieldCards.length) throw "Invalid row idx";

  // 			// Check if the row is full
  // 			if (fieldCards[rowIdx].length >= 5) {
  // 				// The row is full, update player's score
  // 				const score = fieldCards[rowIdx].reduce((prev, cur) => prev + cur.score, 0);
  // 				const player = otherPlayers.find((player) => player.name === playerName);
  // 				if (player) {
  // 					player.score += score;
  // 				} else {
  // 					if (newGame.player.name === playerName) {
  // 						newGame.player.score += score;
  // 					} else throw "Player not found";
  // 				}

  // 				// Clear the row
  // 				fieldCards[rowIdx] = [];
  // 			}

  // 			// Add the card to the target row
  // 			fieldCards[rowIdx].push(card);

  // 			// Delete the leftmost played card, it should be as same as the variable "card"
  // 			newGame.playedCardInfo.shift();
  // 			return newGame;
  // 		}
  // 	});

  // 	// ! Used for mocked server
  // 	setTimeout(() => {
  // 		setCnt((cnt) => cnt + 1);
  // 	}, interval);
  // }, []);

  // const onClearRow = useCallback((clearRowEvent: ClearRowEvent) => {
  // 	const { playerName, card, rowIdx } = clearRowEvent;
  // 	setGame((oldGame) => {
  // 		if (oldGame) {
  // 			const newGame: Game = deepCopy(oldGame);
  // 			const { fieldCards, otherPlayers } = newGame;
  // 			if (rowIdx < 0 || rowIdx >= fieldCards.length) throw "Invalid row idx";

  // 			// Update player's score
  // 			const score = fieldCards[rowIdx].reduce((prev, cur) => prev + cur.score, 0);
  // 			fieldCards[rowIdx] = [];
  // 			const player = otherPlayers.find((player) => player.name === playerName);
  // 			if (player) {
  // 				player.score += score;
  // 			} else {
  // 				if (newGame.player.name === playerName) {
  // 					newGame.player.score += score;
  // 				} else throw "Player not found";
  // 			}

  // 			// Clear the row and add the card
  // 			fieldCards[rowIdx] = [];
  // 			fieldCards[rowIdx].push(card);

  // 			// Delete the leftmost played card, it should be as same as the variable "card"
  // 			newGame.playedCardInfo.shift();
  // 			return newGame;
  // 		}
  // 	});

  // 	// ! Used for mocked server
  // 	setTimeout(() => {
  // 		setCnt((cnt) => cnt + 1);
  // 	}, interval);
  // }, []);

  // const onAllPlayerPlayed = useCallback((gameUpdateEvent: AllPlayerPlayedEvent) => {
  // 	const { playedCardInfo } = gameUpdateEvent;
  // 	playedCardInfo.sort((a, b) => a.card.number - b.card.number);
  // 	setGame((oldGame) => {
  // 		if (oldGame) {
  // 			const newGame: Game = deepCopy(oldGame);
  // 			newGame.playedCardInfo = playedCardInfo;
  // 			return newGame;
  // 		}
  // 	});

  // 	// ! Used for mocked server
  // 	setTimeout(() => {
  // 		setCnt((cnt) => cnt + 1);
  // 	}, interval);
  // }, []);

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
            // case "all player played":
            // 	onAllPlayerPlayed(gameEvent as AllPlayerPlayedEvent);
            // 	break;
            // case "append row":
            // 	onAppendRow(gameEvent as AppendRowEvent);
            // 	break;
            // case "clear row":
            // 	onClearRow(gameEvent as ClearRowEvent);
            //	break;
            // case "start row selection":
            // 	setInRowSelectionMode(true);
            // 	break;
            // case "start card selection":
            // 	setInCardSelectionMode(true);
            // 	break;
            case "game status update":
              onGameStatusUpdate(gameEvent as UpdateGameStatusEvent);
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
