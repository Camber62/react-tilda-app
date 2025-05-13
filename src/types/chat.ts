export interface Message {
  text: string;
  isUser: boolean;
  id?: string;
}

export interface WebSocketMessage {
  command: string;
  body: {
    message_id?: string;
    message?: { content: { text: string } };
    text?: string;
    status?: string;
  };
}