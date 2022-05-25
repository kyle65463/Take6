import { Chat } from "@models/chat";
import React from "react";

interface ChatListProps {
    chats: Chat[];
}

export default function ChatList({ chats }: ChatListProps) {
    return (
        <div>
            {chats.map((chat) => (
                <div>
                    {chat.name}: {chat.msg}
                </div>
            ))}
        </div>
    );
}
