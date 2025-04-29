import axios from 'axios';

interface ChatInitResponse {
  id: string;
  organization: string | null;
  user: string | null;
  date_time: string;
}

export const initChat = async (): Promise<ChatInitResponse> => {
  try {
    const response = await axios.post<ChatInitResponse>('https://api-ai.deeptalk.tech/core-ai/api/v1/chats/deeptalk/fos/ru/');
    return response.data;
  } catch (error) {
    console.error('Ошибка при инициализации чата:', error);
    throw error;
  }
};
