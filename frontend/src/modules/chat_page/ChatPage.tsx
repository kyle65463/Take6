import { ChatEvent } from "@models/chat_events";
import { EventsContext, NameContext, SocketContext } from "@utils/context";
import { generateUid } from "@utils/utils";
import { useCallback, useContext, useRef, useState } from "react";
import ChatList from "./ChatList";
import { useChat } from "./useChat";

export default function ChatPage() {
	const { chatList } = useChat();
	const { socket } = useContext(SocketContext);
	const connecting = socket === undefined;
	const messageRef = useRef<HTMLInputElement | null>(null);
	const { chatEvents, sendChatEvent, clearChatEvents } =
		useContext(EventsContext);
	const { name } = useContext(NameContext);

	// Invoked when the player submit message
	function messageSend() {
		const message = messageRef.current?.value;
		if (!message) return;
		const chatEvent: ChatEvent = {
			name: name,
			msg: message,
		};
		sendChatEvent(chatEvent);
	}

	return (
		<main className='flex-1 flex flex-col justify-between mb-12'>
			<div className='flex justify-between'>
				<div className='flex items-center mt-16'>
					{/* Chat room */}
					<ul id='messages'></ul>
					<ChatList chats={chatList} />
					<input ref={messageRef} type='text' />
					<button onClick={messageSend}>Send</button>
				</div>
			</div>
		</main>
	);
}
