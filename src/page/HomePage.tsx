import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { ChatType, initChat } from '../api/initChat';
import { AudioPlayer } from '../AudioPlayer';
import ChatInput from '../components/ChatInput/ChatInput';
import Modal from '../components/Modal/Modal';
import { images } from '../config/images';
import { useChatWS } from '../hooks/chatWS';
import { useChatAudio } from '../hooks/useChatAudio';
import { storageService } from '../services/storage';
import { ChatJsonData, Message } from '../types/chat';
import styles from './HomePage.module.css';
import { v4 as uuidv4 } from 'uuid';
import { ReadyState } from 'react-use-websocket';

const WS_URL_PREFIX = 'wss://api-ai.deeptalk.tech/chat-server-ws/ws/';

const HomePage: React.FC = () => {
  const [openModal, setOpenModal] = useState(false);
  const [chatId, setChatId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [chatType, setChatType] = useState<ChatType | null>(null);
  const [userInfo, setUserInfo] = useState<ChatJsonData | null>(null);
  const [isHistoryMode, setIsHistoryMode] = useState(false);
  const [historyMessages, setHistoryMessages] = useState<Message[]>([]);
  const { messages, isWaiting: isLoading, sendMessage, closeChat, addMessages, wsState } = useChatWS(
    chatType === ChatType.CUSTOMER_SURVEY && !isHistoryMode ? 'start' : undefined,
    chatId ? `${WS_URL_PREFIX}${chatId}` : undefined
  );

  const { currentAudioMessage, isAudioPlaying, setIsAudioPlaying, handleAudioEnd } = useChatAudio(messages, openModal);



  useEffect(() => {
    // console.log('userInfo', userInfo);
    // console.log('chatId', chatId);
    // console.log('isHistoryMode', isHistoryMode);
    console.log('messages', messages);
    // console.log('isLoading', isLoading);
  }, [userInfo, chatId, isHistoryMode, messages, isLoading]);

  // Функция сброса состояния чата
  const resetChatState = useCallback(() => {
    closeChat();
    handleAudioEnd();
    setChatId('');
    setChatType(null);
    setError(null);
    setIsHistoryMode(false);
  }, [closeChat, handleAudioEnd]);

  // Обновляем сообщения и сохраняем данные
  useEffect(() => {
    if (messages.length > 0) {
      if (chatType && chatId) {
        const currentChat = storageService.getHistory().find(item => item.id === chatId);
        const existingMessages = currentChat?.messages || [];

        // Объединяем существующие сообщения с новыми, избегая дубликатов
        const uniqueMessages = [...existingMessages];
        messages.forEach(newMsg => {
          // Проверяем наличие ID и его уникальность
          if (newMsg.id && !uniqueMessages.some(existingMsg => existingMsg.id === newMsg.id)) {
            uniqueMessages.push(newMsg);
          }
        });

        const chatData = {
          id: chatId,
          type: chatType,
          timestamp: Date.now(),
          firstMessage: currentChat?.firstMessage || messages[0].text,
          messages: messages
        };
        storageService.saveChat(chatData);
      }

      // Проверяем последнее сообщение на данные пользователя
      const lastMessage = messages[messages.length - 1];
      if (chatType === ChatType.CUSTOMER_SURVEY &&
        lastMessage?.body?.message?.content?.json) {
        const jsonData = lastMessage.body.message.content.json;
        if (jsonData) {
          const userData = jsonData as ChatJsonData;
          setUserInfo(userData);
          storageService.saveUserInfo(userData);
        }
      }

    }
  }, [messages, chatType, chatId, isHistoryMode]);

  // Инициализация нового чата
  const initChatSession = useCallback(async (type: ChatType, initialMessage?: string) => {
    try {
      resetChatState();
      setIsHistoryMode(false);
      setChatType(type);
      const response = await initChat(type, JSON.stringify({}));
      setChatId(response.id);
      setOpenModal(true);

      if (initialMessage) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        sendMessage(initialMessage);
      }
    } catch (err) {
      setError('Ошибка при запуске чата');
      console.error('Ошибка при запуске чата:', err);
    }
  }, [sendMessage, resetChatState]);


  // Открытие истории чата
  const openChatHistory = useCallback(async (chatId: string, messages: Message[]) => {
    // Сначала закрываем текущий чат и очищаем состояние
    closeChat();
    handleAudioEnd();
    setIsHistoryMode(true);
    setChatId(chatId);
    setHistoryMessages(messages);
    setOpenModal(true);
  }, [closeChat, handleAudioEnd,]);

  useEffect(() => {
    if (wsState === ReadyState.OPEN && isHistoryMode) {
      console.log(88888);
      addMessages(historyMessages);
    } 
  }, [wsState, historyMessages, addMessages, isHistoryMode])

  // Отправка сообщения в чат
  const handleSendMessage = useCallback((message: string) => {
    if (isHistoryMode && chatId) {
      // Сохраняем текущие сообщения перед отправкой нового
      const currentChat = storageService.getHistory().find(item => item.id === chatId);
      if (currentChat) {
        const newMessage = {
          isUser: true,
          text: message,
          isShow: true,
          id: uuidv4().toString(),
        };
        // Обновляем сообщения в текущем чате
        const updatedMessages = [...currentChat.messages, newMessage];
        storageService.updateChatMessages(chatId, updatedMessages);
      }
      // Отправляем сообщение без команды start
      sendMessage(message);
    } else {
      sendMessage(message);
    }
  }, [isHistoryMode, chatId, sendMessage]);

  // Запуск чата
  const handleStartChat = useCallback(async (type: ChatType) => {
    initChatSession(type);
  }, [initChatSession]);

  // Отправка сообщения в основной чат
  const sendMessageMainChat = useCallback(async (text: string) => {
    initChatSession(ChatType.MAIN_CHAT, text);
  }, [initChatSession]);

  // Закрытие чата
  const handleCloseChat = useCallback(() => {
    if (!isHistoryMode && chatType) {
      // Сохраняем чат только если это не режим просмотра истории и есть тип чата
      storageService.saveChat({
        id: chatId,
        type: chatType,
        timestamp: Date.now(),
        firstMessage: messages[0]?.text || '',
        messages: messages
      });
    }

    // Сначала закрываем модальное окно
    setOpenModal(false);
    // Затем очищаем все состояния
    setChatId('');
    setChatType(null);
    setUserInfo(null);
    setIsHistoryMode(false);
    addMessages([]);

    // Закрываем WebSocket соединение
    closeChat();
  }, [chatId, chatType, isHistoryMode, closeChat, messages]);

  return (
    <div className="App">
      <div className="chatContainer">
        <div className="chatAvatar">
          <img src={images.Frame3} alt="ChatBot Avatar" className="glowingOrb" />
        </div>
        <div className="chatContent">
          <h1 className="greeting">
            Привет! Я ваш помощник в мире образовательных<br /> технологий.
            Хочу помочь трансформировать <br />учебный процесс.
            <span className="botName">Начнем?</span>
          </h1>
          <div className="buttonList">
            <button className="actionButton">
              <img src={images.Group12} alt="Phone" className="icon" />
              Расскажу как повысить вовлеченность
            </button>
            <button
              className="actionButton"
              onClick={() => handleStartChat(ChatType.CUSTOMER_SURVEY)}
            >
              <img src={images.Group9} alt="Lightbulb" className="icon" />
              Давайте познакомимся
            </button>
            <button className="actionButton">
              <img src={images.Group10} alt="Map" className="icon" />
              Помогу с навигацией
            </button>
          </div>
          <div className={styles.inputContainer}>
            {!openModal && (
              <ChatInput
                visualMode={true}
                onSendMessage={sendMessageMainChat}
                placeholder={`Что Вас интересует сегодня?\nДавайте я помогу найти нужную информацию!`}
                onError={setError}
              />
            )}
          </div>
          <div className="bottomButtons">
            <button className="primaryButton">
              <img src={images.Vector} alt="Demo" className="icon" />
              ЗАПРОСИТЬ ДЕМОСЕССИЮ
            </button>
          </div>
        </div>
      </div>
      {openModal && (
        <Modal
          setOpen={setOpenModal}
          messages={messages}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          closeChat={handleCloseChat}
          openChatById={openChatHistory}
          isHistoryMode={isHistoryMode}
        />
      )}
      {currentAudioMessage && (
        <AudioPlayer
          message={currentAudioMessage}
          isPause={!isAudioPlaying}
          startPlayingCB={() => setIsAudioPlaying(true)}
          endPlayingCB={handleAudioEnd}
          volume={100}
        />
      )}
    </div>
  );
};

export default HomePage;