import Button from "@common/components/Button";
import { ChatEvent } from "@models/chat_events";
import { EventsContext, NameContext } from "@utils/context";
import { useContext, useRef } from "react";
import ChatList from "./ChatList";
import { useChat } from "./useChat";

export default function ChatPage() {
	const { chatList } = useChat();
	const messageRef = useRef<HTMLInputElement | null>(null);
	const { sendChatEvent } = useContext(EventsContext);
	const { name } = useContext(NameContext);

	// Invoked when the player submit message
	function messageSend() {
		const message = messageRef.current?.value;
		if (!message || message.length === 0) return;
		if (messageRef.current) {
			messageRef.current.value = "";
		}
		const chatEvent: ChatEvent = {
			name: name,
			msg: message,
		};
		sendChatEvent(chatEvent);
	}

	return (
		<main className='flex-1 flex flex-col justify-between'>
			<div className='pl-3 pt-1 bg-emerald-200/30 rounded-lg box-border h-80 w-80 border-4 border-emerald-400 overflow-auto'>
				{/* Chat room */}
				<ul id='messages'></ul>
				<ChatList chats={chatList} />
			</div>
			<div className='mt-3 flex flex-row items-center'>
				<input className='input mr-4 text-lg' ref={messageRef} type='text' />
				<Button style='primary' onClick={messageSend}>
					Send
				</Button>
			</div>
		</main>
	);
}
