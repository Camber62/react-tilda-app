import { useState, useCallback } from 'react';

// Интерфейс сообщения чата
interface ChatMessageProps {
  // Текст сообщения
  text?: string;
  // Результат файла
  fileResult?: string;
  // Add other relevant properties
}

// Состояние чата
interface ChatState {
  // Массив сообщений
  messages: ChatMessageProps[];
  // Добавить сообщение
  add: (message: ChatMessageProps) => void;
  // Обновить сообщение
  update: (index: number, read: string) => void;
  // Закрыть чат
  close: () => void;
}

// Хук управления чатом
export const useChat = (): ChatState => {
  // Состояние сообщений
  const [messages, setMessages] = useState<ChatMessageProps[]>([]);

  // Добавить сообщение
  const add = useCallback((message: ChatMessageProps) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  // Обновить сообщение
  const update = useCallback((index: number, read: string) => {
    setMessages((prev) => {
      const newMessages = [...prev];
      newMessages[index] = { ...newMessages[index], fileResult: read };
      return newMessages;
    });
  }, []);

  // Закрыть чат
  const close = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    add,
    update,
    close,
  };
};