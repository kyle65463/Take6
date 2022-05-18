import { Card } from "@models/card";
import clsx from "clsx";
import React from "react";

type CardSize = "base" | "sm";

interface HandCardProps {
	card: Card;
	selected?: boolean;
	onClick?: () => void;
	size?: CardSize;
	disabled?: boolean;
}

function DisplayCard({ card, selected = false, onClick, size = "base", disabled = false }: HandCardProps) {
	const { number, score } = card;
	function generateTokens(){
		var token = ""
		for(let i = 0; i < score; i++){
			token += "&"
		}
		return token
	}

	return (
		<div
			onClick={onClick}
			className={clsx("card rounded-md shadow-sm m-2 duration-150 select-none", {
				// Base size
				"h-40": size === "base",
				"w-28": size === "base",
				"cursor-pointer": onClick !== undefined,
				// Small size
				"h-28": size === "sm",
				"w-20": size === "sm",
				"bg-gradient-to-b from-rose-600/50 to-rose-300/50": !disabled && score === 3,
				"bg-gradient-to-b from-amber-600/50 to-amber-300/50": !disabled && score === 2,
				"bg-gradient-to-b from-sky-600/50 to-sky-300/50": !disabled && score === 1,
				"bg-gray-300": disabled,
				"text-gray-500": disabled,
				"selected-card": selected,
			})}
		>
			<div className='card-body flex justify-center items-center'>
				<span className='text-2xl font-bold'>{number}</span>
				<span className='mt-3'>{generateTokens()}</span>
			</div>
		</div>
	);
}

export default DisplayCard;
