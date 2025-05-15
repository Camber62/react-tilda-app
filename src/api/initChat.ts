import axios from 'axios';

export enum ChatType {
  CUSTOMER_SURVEY = 'customer_survey',
  MAIN_CHAT = 'main_chat',
  MAIN_CHAT_TEST = 'main_chat_test'
}

interface ChatInitResponse {
  id: string;
  organization: string | null;
  user: string | null;
  date_time: string;
}

const CHAT_ENDPOINTS = {
  [ChatType.CUSTOMER_SURVEY]: '/api/v1/chats/landing/customer_survey/ru/',
  [ChatType.MAIN_CHAT]: '/api/v1/chats/landing/main_chat/ru/',
  [ChatType.MAIN_CHAT_TEST]: '/api/v1/chats/landing/main_chat/ru/'
};

export const initChat = async (chatType: ChatType, userInfo: string): Promise<ChatInitResponse> => {
  try {
    const endpoint = CHAT_ENDPOINTS[chatType];
    const baseUrl = 'https://api-ai.deeptalk.tech/core-ai';


    const response = await axios.post<ChatInitResponse>(`${baseUrl}${endpoint}`, { user_info: userInfo },);

    return response.data;
  } catch (error) {
    console.error(`Ошибка при инициализации чата типа ${chatType}:`, error);
    throw error;
  }
};
