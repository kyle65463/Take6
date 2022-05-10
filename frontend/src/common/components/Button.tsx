import clsx from "clsx";
import { MouseEventHandler } from "react";

type ButtonStyle = "primary" | "secondary" | "outline" | "disabled";

interface ButtonProps {
	children?: JSX.Element | string;
	onClick?: MouseEventHandler<HTMLButtonElement>;
	style?: ButtonStyle;
}

function Button({ children, onClick, style }: ButtonProps) {
	return (
		<button
			onClick={onClick}
			className={clsx({
				btn: true,
				"btn-primary": style === "primary",
				"btn-secondary": style === "secondary",
				"btn-outline": style === "outline",
				"btn-disabled": style === "disabled",
			})}
		>
			{children}
		</button>
	);
}

export default Button;
