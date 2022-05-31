import Button from "@common/components/Button";
import Modal from "@common/components/Modal";
import ChatPage from "@modules/chat_page/ChatPage";
import DisplayCard from "@modules/game_page/DisplayCard";
import { SocketContext, UserContext } from "@utils/context";
import { useRouter } from "next/router";
import { useContext } from "react";
import PlayerInfo from "./PlayerInfo";
import { useGame } from "./useGame";

function GamePage() {
	const {
		game,
		selectedHandCardId,
		playedCardInfo,
		inRowSelectionMode,
		inCardSelectionMode,
		winners,
		selectRow,
		selectHandCard,
		playCard,
	} = useGame();
	const { socket, clearSocket } = useContext(SocketContext);
	const { clearRoom } = useContext(UserContext);
	const connecting = socket === undefined;
	const router = useRouter();

	return (
		<div className='layout'>
			{/* <p>{connecting && <span>Connecting...</span>}</p> */}
			{game && (
				<main className='flex-1 flex flex-col justify-between mb-12'>
					<div className='flex justify-between'>
						{/* Field cards */}
						<section className='mt-12'>
							{game.fieldCards.map((row, i) => (
								<div className='flex items-center'>
									<>
										{row.map((card) => (
											<DisplayCard size='sm' card={card} />
										))}
										{inRowSelectionMode && (
											<div className='ml-8'>
												<Button style='primary' onClick={() => selectRow(i)}>
													Clear
												</Button>
											</div>
										)}
									</>
								</div>
							))}
						</section>

						<div className='flex mt-16'>
							{/* Played cards */}
							<section className='flex mr-16 mt-12'>
								{playedCardInfo?.map(({ playerName, card }) => (
									<div className=''>
										<p className='font-bold pl-2 mb-2'>{playerName}</p>
										<DisplayCard size='sm' card={card} />
									</div>
								))}
							</section>

							{/* Players info */}
							<section className='flex flex-col items-end'>
								<div className='flex'>
									{game.otherPlayers.map((player) => (
										<div className='ml-6'>
											<PlayerInfo player={player} />
										</div>
									))}
								</div>
								{/* Chat room */}
								<ChatPage />
							</section>
						</div>
					</div>

					{/* Self info and Confirm button */}
					<section className='mt-6'>
						<div className='px-16 w-full flex justify-between items-end mb-4'>
							<p>
								<span className='text-xl font-bold mr-4'>{game.player.name}</span>
								<span className='text-gray-600'>Score: {game.player.score}</span>
							</p>
							{selectedHandCardId !== undefined ? (
								<Button style='primary' onClick={() => playCard(selectedHandCardId)}>
									Confirm
								</Button>
							) : (
								<Button style='invisible' />
							)}
						</div>

						<div className='flex justify-center'>
							{game.player.cards.map((card, i) => (
								<DisplayCard
									onClick={inCardSelectionMode ? () => selectHandCard(i) : undefined}
									card={card}
									selected={i === selectedHandCardId}
									disabled={!inCardSelectionMode}
								/>
							))}
						</div>

						{/* Game over modal */}
						<Modal
							title='Game Over'
							buttonText='Play again'
							onConfirm={() => {
								clearRoom();
								socket?.disconnect();
								clearSocket();
								router.push("/");
							}}
							isShow={winners !== undefined}
							closeModal={() => {}}
						>
							<div className='relative overflow-y-auto'>
								<table className='w-full text-lg text-left text-gray-500 '>
									<thead className='text-gray-700 uppercase'>
										<tr>
											<th>Rank</th>
											<th>Name</th>
											<th>Score</th>
										</tr>
									</thead>
									<tbody>
										{winners?.map(({ name, score }, index) => (
											<tr className='bg-white py-2'>
												<td>{index + 1}</td>
												<td>{name}</td>
												<td>{score}</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</Modal>
					</section>
				</main>
			)}
		</div>
	);
}

export default GamePage;
