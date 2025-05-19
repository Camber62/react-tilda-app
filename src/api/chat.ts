import axios from 'axios';

interface ChatHistoryData {
  status: string;
  id: any[];
  chat_history: any[];
}

export const GetChatHistory = async (chat_id: string) => {
  const response = await axios.get<ChatHistoryData>(`https://api-ai.deeptalk.tech/core-ai/chats/${chat_id}/messages/`);
  return response;
}; 