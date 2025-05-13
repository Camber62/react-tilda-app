import React, { useCallback, useEffect, useRef, useState } from 'react';
import useWebSocket from 'react-use-websocket';
import API from '../../api';
import { images } from '../../config/images';
import Modal from '../Modal/Modal';
import { AudioPlayer } from '../../AudioPlayer';
import styles from './HomePage.module.css';
import { Message, WebSocketMessage } from '../../types/chat';
import ChatInput from '../ChatInput/ChatInput';
import { useAudioRecording } from '../../hooks/useAudioRecording';

const WS_URL_PREFIX = 'wss://api-ai.deeptalk.tech/chat-server-ws/ws/';
const WebSocketStatus = {
  OPEN: 1,
};

const HomePage: React.FC = () => {
  // Состояния
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [chatId, setChatId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [socketUrl, setSocketUrl] = useState<string | null>(null);
  const [currentAudioMessage, setCurrentAudioMessage] = useState<string>('');
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const processedMessageIds = useRef<Set<string>>(new Set());

  // WebSocket
  const { sendJsonMessage, lastJsonMessage, readyState } = useWebSocket<WebSocketMessage>(
    socketUrl,
    {
      onOpen: () => console.log('WebSocket соединение установлено'),
      shouldReconnect: () => true,
      reconnectAttempts: 3,
      reconnectInterval: 500,
    },
    !!socketUrl
  );

  // Отправка сообщения
  const sendMessage = useCallback(
    (text: string) => {
      if (!text.trim() || readyState !== WebSocketStatus.OPEN) return;

      const userMessage: Message = { text, isUser: true, id: Date.now().toString() };
      setMessages((prev) => [...prev, userMessage]);
      setOpenModal(true);

      sendJsonMessage({
        command: 'send_message',
        body: { text },
      });
    },
    [sendJsonMessage, readyState]
  );

  const {
    isRecording,
    isAudioReady,
    pendingAudio,
    handleMicPress,
    handleMicRelease,
    handleAudioCancel,
    handleAudioConfirm
  } = useAudioRecording({
    onAudioRecognized: sendMessage,
    onError: setError
  });

  useEffect(() => {
    document.addEventListener('TriggerModalEvent', (event) => {
      setOpenModal(true);
    });
  }, []);

  // Инициализация чата
  useEffect(() => {
    const initializeChat = async () => {
      if (chatId) {
        setSocketUrl(`${WS_URL_PREFIX}${chatId}`);
        return;
      }
      try {
        setError(null);
        const chatResponse = await API.initChat();
        setChatId(chatResponse.id);
      } catch (err: any) {
        setError(err.message || 'Не удалось инициализировать чат');
        setMessages([{ text: 'Извините, произошла ошибка', isUser: false }]);
      } finally {
        setIsLoading(false);
      }
    };
    initializeChat();
  }, [chatId]);

  // Обработка сообщений WebSocket
  useEffect(() => {
    if (!lastJsonMessage) return;

    const { command, body } = lastJsonMessage;

    if (command === 'send_message' && body?.message_id) {
      if (processedMessageIds.current.has(body.message_id)) return;

      processedMessageIds.current.add(body.message_id);
      const newMessage: Message = {
        id: body.message_id,
        text: body.message?.content.text || 'Ошибка: текст сообщения отсутствует',
        isUser: false,
      };
      setMessages((prev) => [...prev, newMessage]);
      setIsLoading(false);

      if (newMessage.text && newMessage.text !== 'start') {
        setCurrentAudioMessage(newMessage.text);
        setIsAudioPlaying(true);
      }
    }

    if (command === 'status') {
      setIsLoading(body.status === 'generating');
    }
  }, [lastJsonMessage]);

  // Обработка отправки текстового сообщения
  const handleSend = useCallback(() => {
    if (!inputMessage.trim()) return;
    sendMessage(inputMessage);
    setInputMessage('');
  }, [inputMessage, sendMessage]);

  // Обработка нажатия клавиш
  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

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
            <button className="actionButton">
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