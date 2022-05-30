import Button from "@common/components/Button";
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
			<div className='mt-3 pl-3 pt-1 bg-emerald-200/30 rounded-lg box-border h-80 w-44 border-4 border-emerald-400 overflow-auto'>
				{/* Chat room */}
				<ul id='messages'></ul>
				<ChatList chats={chatList} />
			</div>
			<div className="mt-2">
				<input className='mr-2' ref={messageRef} type='text'/>
				<Button style='primary' onClick={messageSend}>Send</Button>					
			</div>
		</main>
	);
}
