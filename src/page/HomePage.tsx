import React, { useCallback, useEffect, useState } from 'react';
import { ReadyState } from 'react-use-websocket';
import { v4 as uuidv4 } from 'uuid';
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
import { GetChatHistory } from '../api/chat';

const WS_URL_PREFIX = 'wss://api-ai.deeptalk.tech/chat-server-ws/ws/';

const HomePage: React.FC = () => {
  const [openModal, setOpenModal] = useState(false);
  const [chatId, setChatId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [chatType, setChatType] = useState<ChatType | null>(null);
  const [userInfo, setUserInfo] = useState<ChatJsonData | null>(null);
  const [isHistoryMode, setIsHistoryMode] = useState(false);
  const [historyMessages, setHistoryMessages] = useState<Message[]>([]);
  const [chatNext, setChatNext] = useState(false);
  const [isChatEnded, setIsChatEnded] = useState(false);
  const [startMessage, setStartMessage] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [showPage, setShowPage] = useState(true);

  const { messages, isWaiting: isLoading, sendMessage, closeChat, addMessages, wsState, isEndChat, sendHiddenMessage } = useChatWS(
    startMessage || undefined,
    chatId ? `${WS_URL_PREFIX}${chatId}` : undefined,
    chatType ?? undefined
  );

  const { currentAudioMessage, isAudioPlaying, setIsAudioPlaying, handleAudioEnd } = useChatAudio(messages, openModal);

  // Функция сброса состояния чата
  const resetChatState = useCallback(() => {
    closeChat();
    handleAudioEnd();
    setChatId('');
    setChatType(null);
    setError(null);
    setIsHistoryMode(false);
  }, [closeChat, handleAudioEnd]);

  // Обработка события для открытия модального окна при клике 
  useEffect(() => {
    document.addEventListener('TriggerModalEvent', (event) => {
      handleStartChat(ChatType.MAIN_CHAT_TEST);
      setOpenModal(true);
    });
  }, []);

  useEffect(() => {
    const handleElementAboveTop = (event: any) => {
      if (event.detail?.isAbove) {
        setIsVisible(true);
      }
      if (!event.detail?.showPage) {
        setShowPage(false);
        console.log('showPage', false);
      }
      // if (event.detail?.showPage === true) {
      //   setShowPage(true);
      //   console.log('showPage', true);
    };

    window.addEventListener('ElementAboveTop', handleElementAboveTop);

    return () => {
      window.removeEventListener('ElementAboveTop', handleElementAboveTop);
    };
  }, []);


  useEffect(() => {
    const userInfo = storageService.getUserInfo();
    setUserInfo(userInfo);
    console.log('userInfo', userInfo);
  }, []);


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


      if (chatType === ChatType.CUSTOMER_SURVEY && isEndChat && !isAudioPlaying) {
        console.log('Опрос завершен');
        setTimeout(() => {
          setChatNext(true);
        }, 10);
      }
    }
  }, [messages, chatType, chatId, isHistoryMode]);


  useEffect(() => {
    if (chatType === ChatType.CUSTOMER_SURVEY && isEndChat && chatNext && !isAudioPlaying) {
      const userInfo = storageService.getUserInfo();
      if (userInfo) {
        setStartMessage('start')
        initChatSession(ChatType.MAIN_CHAT, undefined, userInfo);
      }
    }
  }, [chatNext, isAudioPlaying]);


  // Инициализация нового чата
  const initChatSession = useCallback(async (type: ChatType, initialMessage?: string, userInfo?: ChatJsonData, hidden?: boolean) => {
    try {
      resetChatState();
      setIsHistoryMode(false);
      setChatType(type);
      if (type === ChatType.CUSTOMER_SURVEY && !isHistoryMode) {
        setStartMessage('start')
      }
      const response = await initChat(type, JSON.stringify(userInfo || {}));
      setChatId(response.id);
      
      // Сохраняем ID чата опроса в localStorage
      if (type === ChatType.CUSTOMER_SURVEY) {
        storageService.saveSurveyChatId(response.id);
        // console.log('Новый чат', response.id);
      }
      
      setOpenModal(true);

      if (initialMessage) {
        await new Promise(resolve => setTimeout(resolve, 10));
        if (hidden) {
          sendHiddenMessage(initialMessage);
        } else {
          sendMessage(initialMessage);
        }
      }
    } catch (err) {
      setError('Ошибка при запуске чата');
      console.error('Ошибка при запуске чата:', err);
    }

  }, [sendMessage, sendHiddenMessage, resetChatState, isHistoryMode]);


  // Открытие истории чата
  const openChatHistory = useCallback(async (chatId: string, messages: Message[]) => {
    const response = await GetChatHistory(chatId);
    if (response.data.status === 'ended') {
      console.log('Чат завершен');
      setIsChatEnded(true);
    } else {
      setIsChatEnded(false);
    }
    closeChat();
    handleAudioEnd();
    setIsHistoryMode(true);
    setChatId(chatId);
    setHistoryMessages(messages);
    setStartMessage(null);
    setOpenModal(true);
  }, [closeChat, handleAudioEnd]);

  useEffect(() => {
    if (wsState === ReadyState.OPEN && isHistoryMode) {
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

  // Обработка клика на кнопку "Давайте познакомимся"
  const handleStartSurvey = useCallback(async () => {
    try {
      // Проверяем, есть ли у пользователя имя
      if (storageService.hasUserName()) {
        // Если имя есть, получаем ID сохраненного чата опроса
        const savedChatId = storageService.getSurveyChatId();
        if (savedChatId) {
          // Продолжаем существующий чат
          const chatHistory = storageService.getHistory();
          const existingChat = chatHistory.find(chat => chat.id === savedChatId);
          if (existingChat) {
            console.log('Продолжаем существующий чат опроса:', savedChatId);
            openChatHistory(savedChatId, existingChat.messages);
            return;
          }
        }
      }
      
      // Если имени нет или чат не найден, начинаем новый опрос
      console.log('Начинаем новый чат опроса');
      initChatSession(ChatType.CUSTOMER_SURVEY, undefined, userInfo || undefined);
    } catch (err) {
      setError('Ошибка при запуске опроса');
      console.error('Ошибка при запуске опроса:', err);
    }
  }, [userInfo, initChatSession, openChatHistory]);

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
    setStartMessage(null);
    setChatId('');
    setChatType(null);
    // setUserInfo(null);
    setIsHistoryMode(false);
    setIsChatEnded(false);
    addMessages([]);

    // Закрываем WebSocket соединение
    closeChat();
  }, [chatId, chatType, isHistoryMode, closeChat, messages]);


  return (
    <div className={`App ${isVisible ? 'visible' : ''}`}>
      {showPage && <div className={"chatContainer"}>
        <div className="chatAvatarPlaceholder"></div>
        <div className="chatAvatar">
            <img
              id="avatar-gif"
              src="https://raw.githubusercontent.com/Camber62/content/main/1-2mb.gif"
              className="glowingOrb"
              alt="Avatar animation"
              style={{ userSelect: 'none', width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
              onError={(e) => console.error('Image error:', e)}
            />
          </div>
        <div className={`chatContent ${isVisible ? 'visible' : ''}`}>
          <h1 className="greeting">
            Привет! Я ваш помощник в мире образовательных технологий.
            Хочу помочь трансформировать учебный процесс.
            <span className="botName"> Начнем?</span>
          </h1>
          <div className="buttonList">
            {(userInfo === null || userInfo?.step_9.missing_features === null) && (
              <button
                className="actionButton buttonSecond"
                onClick={handleStartSurvey}
              >
                <img src={images.Group9} alt="Lightbulb" className="icon" />
                Давайте познакомимся
              </button>
            )}
            <button
              className="actionButton buttonThird"
              onClick={() => initChatSession(ChatType.MAIN_CHAT, 'Помогу с навигацией', undefined, true)}
            >
              <img src={images.Group10} alt="Map" className="icon" />
              Помогу с навигацией
            </button>
            <button
              className="actionButton buttonFirst"
              onClick={() => initChatSession(ChatType.MAIN_CHAT, 'Расскажу как повысить вовлеченность', undefined, true)}
            >
              <img src={images.Group12} alt="Phone" className="icon" />
              Расскажу как повысить вовлеченность
            </button>
          </div>
          {!openModal && (
            <div className={styles.inputContainer}>
              <ChatInput
                visualMode={true}
                onSendMessage={sendMessageMainChat}
                placeholder={`Что Вас интересует сегодня?\nДавайте я помогу найти нужную информацию!`}
                onError={setError}
              />
            </div>
          )}
          <div className="bottomButtons">
            <button
              className="primaryButton"
              onClick={() => window.open('https://edtech4.org/#form')}
            >
              <img src={images.Vector} alt="Demo" className="icon" />
              ЗАПРОСИТЬ ДЕМОСЕССИЮ
            </button>
          </div>
        </div>
      </div>}
      {openModal && (
        <Modal
          setOpen={setOpenModal}
          messages={messages}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          closeChat={handleCloseChat}
          openChatById={openChatHistory}
          isHistoryMode={isHistoryMode}
          isAudioPlaying={isAudioPlaying}
          isChatEnded={isChatEnded}
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