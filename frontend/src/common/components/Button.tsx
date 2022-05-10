import { MouseEventHandler } from "react";

interface ButtonProps {
	children?: JSX.Element | string;
	onClick?: MouseEventHandler<HTMLButtonElement>;
}

function Button({ children, onClick }: ButtonProps) {
	return <button onClick={onClick}>{children}</button>;
}

export default Button;
