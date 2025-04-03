export interface ChatMessage {
    id: string;
    text: string;
    isUser?: boolean;
}

export interface WebSocketMessage {
    command: string;
    body?: {
        message_id?: string;
        status?: string;
        message?: {
            content: {
                text: string;
            };
        };
    };
} 