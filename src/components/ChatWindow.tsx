// src/ChatWindow.tsx
import React, { useEffect, useRef, useState } from 'react';
import './ChatWindow.css';
import { Button, Spin, Input, Form, message } from 'antd';
import { SendOutlined, CloseOutlined } from '@ant-design/icons';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { init_chat } from '../api/init_chat';
import { WebSocketMessage } from '../type/types';

interface Message {
  id: string;
  text: string;
  isUser?: boolean;
}

const ChatWindow: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [isInitialLoading, setIsInitialLoading] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);
  const [socketUrl, setSocketUrl] = useState<string | undefined>(undefined);
  const [isConnected, setIsConnected] = useState(false);
  const processedMessageIds = useRef<Set<string>>(new Set());
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const handleConnect = async (values: { chatId: string }) => {
    try {
      setIsInitialLoading(true);
      const response = await init_chat(values.chatId);
      setChatId(response.data.chat_id);
      setIsConnected(true);
    } catch (error) {
      console.error('Ошибка при инициализации чата:', error);
      message.error('Ошибка подключения к чату. Проверьте ID и попробуйте снова.');
      setIsInitialLoading(false);
    }
  };

  // Инициализация чата
  useEffect(() => {
    const initializeChat = async () => {
      try {
        console.log('Начало инициализации чата...');
        const response = await init_chat('a8b0496e-fc2b-49a4-bf2b-8108c90b8fe0');
        console.log('Ответ от сервера:', response);
        setChatId(response.data.chat_id);
      } catch (error) {
        console.error('Ошибка при инициализации чата:', error);
        setMessages([{ id: Date.now().toString(), text: 'Ошибка инициализации чата' }]);
        setIsInitialLoading(false);
      }
    };

    initializeChat();
  }, []);

  // Установка WebSocket URL после получения chatId
  useEffect(() => {
    if (chatId) {
      console.log('Установка WebSocket URL для chatId:', chatId);
      setSocketUrl(`wss://api-ai.deeptalk.tech/chat-server-ws/ws/${chatId}`);
      processedMessageIds.current.clear();
    }
  }, [chatId]);

  // Подключение WebSocket
  const { sendJsonMessage, lastJsonMessage, readyState } = useWebSocket<WebSocketMessage>(
    socketUrl || null,
    {
      onOpen: () => {
        console.log('WebSocket подключен');
        setIsInitialLoading(false);
      },
      onClose: () => console.log('WebSocket отключен'),
      onError: (error) => {
        console.error('Ошибка WebSocket:', error);
        setIsInitialLoading(false);
      },
      shouldReconnect: () => true,
      reconnectAttempts: 3,
      reconnectInterval: 500,
    },
    !!socketUrl
  );

  // Обработка входящих сообщений
  useEffect(() => {
    if (lastJsonMessage && lastJsonMessage.command === 'send_message' && lastJsonMessage.body?.message_id) {
      if (!processedMessageIds.current.has(lastJsonMessage.body.message_id)) {
        processedMessageIds.current.add(lastJsonMessage.body.message_id);
        const newMessage = {
          id: lastJsonMessage.body.message_id,
          text: lastJsonMessage.body.message?.content.text || 'Ошибка: нет текста сообщения',
        };
        setMessages((prev) => [...prev, newMessage]);
        setIsInitialLoading(false);
      }
    }
  }, [lastJsonMessage]);

  // Отправка "start" при подключении
  useEffect(() => {
    if (readyState === ReadyState.OPEN) {
      sendJsonMessage({
        command: 'send_message',
        body: {
          text: 'start',
        },
      });
    }
  }, [readyState, sendJsonMessage]);

  // Отправка сообщения
  const sendMessage = () => {
    if (inputValue.trim() && readyState === ReadyState.OPEN) {
      const userMessage = {
        id: Date.now().toString(),
        text: inputValue,
        isUser: true,
      };
      setMessages((prev) => [...prev, userMessage]);
      sendJsonMessage({
        command: 'send_message',
        body: {
          text: inputValue,
        },
      });
      setInputValue('');
      scrollToBottom();
    }
  };

  // Прокрутка вниз
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  };

  // Закрытие чата (опционально)
  const closeChat = () => {
    setMessages([]);
    setChatId(null);
    setSocketUrl(undefined);
  };

  return (
    <div className="chat-container">
      {!isConnected ? (
        <div className="connect-form">
          <Form onFinish={handleConnect}>
            <Form.Item
              name="chatId"
              rules={[{ required: true, message: 'Пожалуйста, введите ID чата' }]}
            >
              <Input placeholder="Введите ID чата" disabled={isInitialLoading} />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={isInitialLoading}>
                Подключиться
              </Button>
            </Form.Item>
          </Form>
        </div>
      ) : (
        <>
          <Button
            type="text"
            icon={<CloseOutlined />}
            onClick={closeChat}
            className="close-button"
          />
          <div ref={chatContainerRef} className="messages-container">
            {isInitialLoading && (
              <div className="loading-container" style={{ textAlign: 'center', padding: '20px' }}>
                <Spin />
                <div style={{ marginTop: '8px', color: '#666' }}>Подключение к чату...</div>
              </div>
            )}
            {messages.map((message) => (
              <div
                key={message.id}
                className={`message ${message.isUser ? 'user-message' : 'other-message'}`}
              >
                <span className="text">{message.text}</span>
              </div>
            ))}
          </div>
          <div className="input-container">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Введите сообщение"
              disabled={isInitialLoading}
              className="input-field"
            />
            <Button
              icon={<SendOutlined />}
              onClick={sendMessage}
              disabled={isInitialLoading}
              className="send-button"
            />
          </div>
        </>
      )}
    </div>
  );
};

export default ChatWindow;