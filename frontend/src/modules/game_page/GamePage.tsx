import { randomCard } from "@models/card";
import { GameStartEvent } from "@models/game_events";
import { randomPlayer } from "@models/player";
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
			players: [...Array.from(Array(4).keys()).map((i) => randomPlayer(i + 1))], // 4 random players
			initialFieldCards: [...Array.from(Array(4).keys()).map(() => randomCard())], // 4 random initial field cards
		};
		onGameEvent(mockedGameStartEvent);
	}, []);

	return (
		<div className='layout'>
			<h1 className='text-4xl'>GAME</h1>
			{/* <p>{connecting && <span>Connecting...</span>}</p> */}
			{game && (
				<section>
					<div>
						{game.players.map((player) => (
							<p key={player.name}>{player.name}</p>
						))}
					</div>

					<div>
						{game.fieldCards.map((row) => (
							<div>
								{row.map((card) => (
									<div className='mr-4'>{card.number}</div>
								))}
							</div>
						))}
					</div>
				</section>
			)}
		</div>
	);
}

export default GamePage;
