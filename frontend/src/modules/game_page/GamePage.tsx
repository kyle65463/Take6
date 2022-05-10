import { randomCard } from "@models/card";
import { GameStartEvent } from "@models/game_events";
import { randomPlayer, randomSelfPlayer } from "@models/player";
import { EventsContext, SocketContext } from "@utils/context";
import { generateUid } from "@utils/utils";
import { useContext, useEffect } from "react";
import { useGame } from "./useGame";

function GamePage() {
	const { game } = useGame();
	const { socket } = useContext(SocketContext);
	const { onGameEvent } = useContext(EventsContext); // ! Used for mocked server
	const connecting = socket === undefined;

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

	return (
		<div className='layout'>
			<h1 className='text-4xl'>GAME</h1>
			{/* <p>{connecting && <span>Connecting...</span>}</p> */}
			{game && (
				<main>
					<section className='mt-12'>
						{game.otherPlayers.map((player) => (
							<p key={player.name}>{player.name}</p>
						))}
					</section>

					<section className='mt-12'>
						{game.fieldCards.map((row) => (
							<div>
								{row.map((card) => (
									<div className='mr-4'>{card.number}</div>
								))}
							</div>
						))}
					</section>

					<section className='mt-12'>
						<p>{game.player.name}</p>

						<div className='flex'>
							{game.player.cards.map((card) => (
								<div className='mr-2'>{card.number}</div>
							))}
						</div>
					</section>
				</main>
			)}
		</div>
	);
}

export default GamePage;
