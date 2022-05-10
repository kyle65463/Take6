import { Player } from "@models/player";

interface PlayerCardProps {
	player: Player;
}

function PlayerCard({ player }: PlayerCardProps) {
	const { name, score } = player;
	return (
		<div className='mb-8'>
			<p className='font-bold mb-0.5'>{name}</p>
			<p className='text-sm text-gray-600'>Score: {score}</p>
		</div>
	);
}

export default PlayerCard;
