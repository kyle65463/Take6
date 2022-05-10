import { useState, useCallback } from "react";

export default function useModal(): [boolean, () => void, () => void] {
	const [isShow, setIsShow] = useState(false);
	const show = useCallback(() => setIsShow(true), []);
	const close = useCallback(() => setIsShow(false), []);
	return [isShow, show, close];
}