import React, { useCallback, useEffect, useRef, useState } from 'react';
import useWebSocket from 'react-use-websocket';
import API from '../../api';
import { ChatType } from '../../api/initChat';
import { AudioPlayer } from '../../AudioPlayer';
import { images } from '../../config/images';
import { storageService } from '../../services/storage';
import { ChatHistoryItem, ChatJsonData, Message, WebSocketMessage } from '../../types/chat';
import ChatInput from '../ChatInput/ChatInput';
import Modal from '../Modal/Modal';
import styles from './HomePage.module.css';

const WS_URL_PREFIX = 'wss://api-ai.deeptalk.tech/chat-server-ws/ws/';
const WebSocketStatus = { OPEN: 1, };

const HomePage: React.FC = () => {
  // Состояния
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [chatId, setChatId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [socketUrl, setSocketUrl] = useState<string | null>(null);
  const [currentAudioMessage, setCurrentAudioMessage] = useState<string>('');
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const processedMessageIds = useRef<Set<string>>(new Set());
  const [userInfo, setUserInfo] = useState<ChatJsonData | null>(null);
  const [isChatInitialized, setIsChatInitialized] = useState(false);
  const [chatType, setChatType] = useState<ChatType>(ChatType.CUSTOMER_SURVEY);
  const [isTransitionChat, setIsTransitionChat] = useState(false);

  useEffect(() => {
    console.log('isChatInitialized', isChatInitialized);
    console.log('chatType', chatType);
  }, [isChatInitialized, chatType]);



  // WebSocket
  const { sendJsonMessage, lastJsonMessage, readyState } = useWebSocket<WebSocketMessage>(
    socketUrl,
    {
      onOpen: () => {
        console.log('WebSocket соединение установлено');
        sendJsonMessage({
          command: 'send_message',
          body: { text: 'start' },
        });
        setIsLoading(true);
      },
      onError: (event) => {
        console.error('WebSocket ошибка:', event);
        setError('Ошибка соединения с сервером. Попробуйте снова.');
      },
      shouldReconnect: () => true,
      reconnectAttempts: 3,
      reconnectInterval: 500,
    },
    !!socketUrl
  );

  // Открытие чата по id
  const openChatHistory = useCallback((chatId: string, message: Message[]) => {
    setChatId(chatId);
    setSocketUrl(`${WS_URL_PREFIX}${chatId}`);
    setMessages(message);
  }, []);

  // Отправка сообщения
  const sendMessage = useCallback((text: string) => {
    if (readyState !== WebSocketStatus.OPEN) {
      handleStartChat(ChatType.MAIN_CHAT);
    }
    if (!text.trim()) return;
    const userMessage: Message = { text, isUser: true, id: Date.now().toString() };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsLoading(true);

    sendJsonMessage({
      command: 'send_message',
      body: { text },
    });
  }, [sendJsonMessage, readyState, messages]);

  // Открытие модального окна
  useEffect(() => {
    if (messages.length > 0) {
      setOpenModal(true);
    }
  }, [messages]);

  // Обработчик события для открытия модального окна
  useEffect(() => {
    document.addEventListener('TriggerModalEvent', (event) => {
      handleStartChat(ChatType.MAIN_CHAT_TEST);
      setOpenModal(true);
    });
  }, []);

  // Обработчик клика для инициализации чата
  const handleStartChat = async (chatType: ChatType) => {
    setIsLoading(true);
    setChatType(chatType);

    if (isChatInitialized) {
      console.log('чат уже инициализирован');
      return;
    }

    try {
      console.log('идет инициализация');

      setError(null);

      // Получаем актуальные данные из localStorage перед инициализацией чата
      const currentUserInfo = storageService.getUserInfo();
      const chatResponse = await API.initChat(chatType, JSON.stringify(currentUserInfo));
      setChatId(chatResponse.id);
      setIsChatInitialized(true);
      setOpenModal(true);
      console.log('Chat initialized', chatResponse.id);
    } catch (err: any) {
      setError(err.message || 'Не удалось инициализировать чат');
      setMessages([{ text: 'Извините, произошла ошибка', isUser: false }]);
    } finally {
      setIsLoading(false);
    }
  };


  // useEffect для инициализации чата
  useEffect(() => {
    if (chatId) {
      setSocketUrl(`${WS_URL_PREFIX}${chatId}`);
    }
  }, [chatId]);


  // Обработка сообщений WebSocket
  useEffect(() => {
    if (!lastJsonMessage) return;

    const { command, body } = lastJsonMessage;

    // Обработка входящих сообщений
    if (command === 'send_message' && body?.message_id) {
      // Проверяем, не обрабатывали ли мы уже это сообщение
      if (processedMessageIds.current.has(body.message_id)) return;
      processedMessageIds.current.add(body.message_id);
      setIsLoading(false);

      // Для опроса (customer_survey) сохраняем данные пользователя
      if (chatType === ChatType.CUSTOMER_SURVEY && body.message?.content?.text) {
        const jsonData = JSON.parse(body.message.content.text) as ChatJsonData;
        setUserInfo(jsonData);
        storageService.saveUserInfo(jsonData);
      }

      // Создаем новое сообщение для отображения
      const newMessage: Message = {
        id: body.message_id,
        // Для опроса берем сообщение из json, для обычного чата из text
        text: (chatType === ChatType.CUSTOMER_SURVEY
          ? body.message?.content?.json?.message
          : body.message?.content?.text) || 'Нет сообщения',
        isUser: false,
      };

      // Обновляем список сообщений и сохраняем историю
      setMessages((prev) => {
        const updatedMessages = [...prev, newMessage];

        // Сохраняем чат в localStorage при любом изменении сообщений
        if (chatId) {
          const firstUserMessage = updatedMessages.find(msg => msg.isUser)?.text || '';
          const chatData: ChatHistoryItem = {
            id: chatId,
            type: chatType,
            timestamp: Date.now(),
            firstMessage: firstUserMessage,
            messages: updatedMessages
          };
          storageService.saveChat(chatData);
        }

        return updatedMessages;
      });

      // Проверяем завершение опроса и переключаем на основной чат
      if (chatType === ChatType.CUSTOMER_SURVEY && body.status === 'ended') {
        console.log('Опрос завершен, переключение на основной чат...');
        // Затем закрываем текущий чат
        closeChat();
        setIsTransitionChat(true);
      }


      // Если есть текст сообщения и это не 'start', запускаем аудио
      if (newMessage.text && newMessage.text !== 'start') {
        setCurrentAudioMessage(newMessage.text);
        setIsAudioPlaying(true);
      }
    }


  }, [lastJsonMessage]);

  // Функция закрытия чата
  const closeChat = () => {
    console.log('Закрытие чата, сброс состояний...');
    // Закрываем WebSocket соединение
    setSocketUrl(null);
    // Сбрасываем все состояния чата
    setMessages([]);
    setChatId('');
    setError(null);
    setIsChatInitialized(false);
    setCurrentAudioMessage('');
    setIsAudioPlaying(false);
    setOpenModal(false);
  }

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
                onSendMessage={sendMessage}
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
          onSendMessage={sendMessage}
          isLoading={isLoading}
          closeChat={closeChat}
          openChatById={openChatHistory}
        />
      )}
      {currentAudioMessage && (
        <AudioPlayer
          message={currentAudioMessage}
          isPause={!isAudioPlaying}
          startPlayingCB={() => setIsAudioPlaying(true)}
          endPlayingCB={() => {
            setIsAudioPlaying(false);
            setCurrentAudioMessage('');
          }}
          volume={100}
        />
      )}
    </div>
  );
};

export default HomePage;