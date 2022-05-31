import { NameContext, SocketContext } from "@utils/context";
import { useRouter } from "next/router";
import { useCallback, useContext, useEffect, useRef } from "react";

function RoomPage() {
	const { room } = useContext(NameContext);

	return (
		<div className='layout flex'>
			Room
			<div>{room && room.roomId}</div>
		</div>
	);
}

export default RoomPage;
