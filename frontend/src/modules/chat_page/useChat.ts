import { Chat } from "@models/chat";
import { ChatEvent } from "@models/chat_events";
import { EventsContext } from "@utils/context";
import { useCallback, useContext, useEffect, useState } from "react";

export function useChat() {
    const [chatList, setChatList] = useState<Chat[]>([]);
    const { chatEvents, sendChatEvent, clearChatEvents } =
        useContext(EventsContext);

    const onChatUpdate = useCallback((chatEvent: ChatEvent) => {
        const { name, msg } = chatEvent;
        let chatMsg: Chat = {
            name,
            msg,
        };
        setChatList((oldChats) => {
            return [...oldChats, chatMsg];
        });
    }, []);

    useEffect(() => {
        if (chatEvents.length > 0) {
            while (chatEvents.length > 0) {
                const chatEvent = chatEvents.shift(); // Pop the first element
                if (chatEvent) {
                    onChatUpdate(chatEvent);
                }
            }
            clearChatEvents();
        }
    }, [chatEvents]);

    return {
        chatList,
    };
}
