// src/lib/hooks/useChatSocket.ts
import { useEffect, useRef } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from 'sockjs-client';

/* 메시지 타입 정의 */
export interface ChatMessage {
    sender: string;
    message: string;
    timestamp?: string; // 선택: 시간이 백엔드에서 포함되면 활용 가능
}

/* 커스텀 훅 */
export const useChatSocket = ({
                                  roomId,
                                  onMessageReceive,
                              }: {
    roomId: string;
    onMessageReceive: (message: ChatMessage) => void;
}) => {
    const clientRef = useRef<Client | null>(null);

    useEffect(() => {
        if (!roomId) return;

        const socket = new SockJS(import.meta.env.VITE_API_BASE_URL + "/ws"); // 웹소켓 연결
        const client = new Client({
            webSocketFactory: () => socket,
            debug: (msg) => console.log("🧩 STOMP:", msg),
            onConnect: () => {
                console.log("✅ STOMP 연결됨");
                client.subscribe(`/topic/chat/${roomId}`, (message) => {
                    const payload: ChatMessage = JSON.parse(message.body);
                    onMessageReceive(payload);
                });
            },
            onStompError: (frame) => {
                console.error("❌ STOMP 오류:", frame);
            },
            reconnectDelay: 5000,
        });

        client.activate();
        clientRef.current = client;

        return () => {
            client.deactivate();
        };
    }, [roomId]);

    const send = (message: ChatMessage) => {
        clientRef.current?.publish({
            destination: `/app/chat/${roomId}`,
            body: JSON.stringify(message),
        });
    };

    return { send };
};
