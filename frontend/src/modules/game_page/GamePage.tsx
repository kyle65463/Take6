import Button from "@common/components/Button";
import Modal from "@common/components/Modal";
import ChatPage from "@modules/chat_page/ChatPage";
import DisplayCard from "@modules/game_page/DisplayCard";
import { NameContext, SocketContext } from "@utils/context";
import { useContext } from "react";
import PlayerCard from "./PlayerCard";
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
	const { socket } = useContext(SocketContext);
	const connecting = socket === undefined;

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
											<DisplayCard
												size='sm'
												card={card}
											/>
										))}
										{inRowSelectionMode && (
											<div className='ml-8'>
												<Button
													style='primary'
													onClick={() => selectRow(i)}
												>
													Clear
												</Button>
											</div>
										)}
									</>
								</div>
							))}
						</section>

						<div className='flex items-center mt-16'>
							{/* Played cards */}
							<section className='flex mr-16'>
								{playedCardInfo?.map(({ playerName, card }) => (
									<div className=''>
										<p className='mb-2'>{playerName}</p>
										<DisplayCard size='sm' card={card} />
									</div>
								))}
							</section>

							{/* Players info */}
							<section>
								{game.otherPlayers.map((player) => (
									<PlayerCard player={player} />
								))}
							</section>
						</div>
					</div>

					<section className='mt-12'>
						<div className='px-16 w-full flex justify-between items-end mb-4'>
							<p>
								<span className='text-xl font-bold mr-4'>
									{game.player.name}
								</span>
								<span className='text-gray-600'>
									Score: {game.player.score}
								</span>
							</p>
							{selectedHandCardId !== undefined ? (
								<Button
									style='primary'
									onClick={() => playCard(selectedHandCardId)}
								>
									Confirm
								</Button>
							) : (
								<Button style='invisible' />
							)}
						</div>

						<div className='flex justify-center'>
							{game.player.cards.map((card, i) => (
								<DisplayCard
									onClick={
										inCardSelectionMode
											? () => selectHandCard(i)
											: undefined
									}
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
							isShow={winners !== undefined}
							closeModal={() => {
								location.reload();
							}}
						>
							<div>
								<p>The game is over, the ranking is:</p>
								<div className='mt-10 mb-6'>
									{winners?.map(({ name }) => (
										<div className='flex justify-center items-end my-6'>
											<span className='text-3xl font-bold'>
												{name}
											</span>
										</div>
									))}
								</div>
							</div>
						</Modal>
					</section>
				</main>
			)}
			<ChatPage />
		</div>
	);
}

export default GamePage;
