import { ChatHistoryItem, Message, ChatJsonData } from '../types/chat';

const STORAGE_KEY = 'chat_history';
const USER_INFO_KEY = 'user_info';
const SURVEY_CHAT_ID_KEY = 'survey_chat_id';

export const storageService = {
  // Получить всю историю чатов
  getHistory: (): ChatHistoryItem[] => {
    const savedHistory = localStorage.getItem(STORAGE_KEY);
    if (!savedHistory) return [];
    const parsedHistory = JSON.parse(savedHistory);
    return Array.isArray(parsedHistory) ? parsedHistory : [];
  },

  // Сохранить новый чат или обновить существующий
  saveChat: (chat: ChatHistoryItem): void => {
    const history = storageService.getHistory();
    const existingIndex = history.findIndex(item => item.id === chat.id);
    
    if (existingIndex !== -1) {
      history[existingIndex] = chat;
      // console.log('Обновлен существующий чат:', chat.id);
    } else {
      history.push(chat);
      // console.log('Добавлен новый чат:', chat.id);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  },

  // Обновить сообщения в существующем чате
  updateChatMessages: (chatId: string, messages: Message[]): void => {
    const history = storageService.getHistory();
    const chatIndex = history.findIndex(item => item.id === chatId);
    
    if (chatIndex !== -1) {
      history[chatIndex].messages = messages;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    }
  },
  
  // Удалить всю историю чатов
  clearAllChats: (): void => {
    localStorage.removeItem(STORAGE_KEY);
  },

  
  // Удалить чат из истории
  deleteChat: (chatId: string): void => {
    const history = storageService.getHistory();
    const filteredHistory = history.filter(item => item.id !== chatId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredHistory));
  },

  // Сохранить информацию о пользователе
  saveUserInfo: (userInfo: ChatJsonData): void => {
    // console.log('Сохранение информации о пользователе:', userInfo);
    localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo));
  },

  // Получить информацию о пользователе
  getUserInfo: (): ChatJsonData | null => {
    const savedUserInfo = localStorage.getItem(USER_INFO_KEY);
    if (!savedUserInfo) return null;
    try {
      return JSON.parse(savedUserInfo);
    } catch {
      return null;
    }
  },

  // Удалить информацию о пользователе
  deleteUserInfo: (): void => {
    localStorage.removeItem(USER_INFO_KEY);
  },

  // Сохранить ID чата опроса
  saveSurveyChatId: (chatId: string): void => {
    localStorage.setItem(SURVEY_CHAT_ID_KEY, chatId);
  },

  // Получить ID чата опроса
  getSurveyChatId: (): string | null => {
    return localStorage.getItem(SURVEY_CHAT_ID_KEY);
  },

  // Удалить ID чата опроса
  deleteSurveyChatId: (): void => {
    localStorage.removeItem(SURVEY_CHAT_ID_KEY);
  },

  // Проверить, есть ли у пользователя имя
  hasUserName: (): boolean => {
    const userInfo = storageService.getUserInfo();
    return userInfo?.step_1?.person_name !== null && 
           userInfo?.step_1?.person_name !== undefined && 
           userInfo?.step_1?.person_name.trim() !== '';
  },

}; 