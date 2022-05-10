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

function DisplayCard({ card, selected, onClick, size = "base", disabled = false }: HandCardProps) {
	const { number, score } = card;
	return (
		<div
			onClick={onClick}
			className={clsx("card rounded-md shadow-sm mx-2 my-2 duration-75 select-none", {
				// Base size
				"h-40": size === "base",
				"w-28": size === "base",
				"cursor-pointer ": onClick !== undefined,
				// Small size
				"h-28": size === "sm",
				"w-20": size === "sm",
				"bg-base-100": !disabled,
				"bg-gray-300": disabled,
				"text-gray-500": disabled,
				"selected-card": selected,
			})}
		>
			<div className='card-body flex justify-center items-center'>
				<span className='text-2xl font-bold'>{number}</span>
				<span className='mt-3'>x{score}</span>
			</div>
		</div>
	);
}

export default DisplayCard;
