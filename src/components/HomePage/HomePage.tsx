import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useAudioRecorder } from 'react-audio-voice-recorder';
import useWebSocket from 'react-use-websocket';
import API from '../../api';
import { images } from '../../config/images';
import Modal from '../Modal/Modal';
import { AudioPlayer } from '../../AudioPlayer';
import styles from './HomePage.module.css';

// Интерфейсы
interface Message {
  text: string;
  isUser: boolean;
  id?: string;
}

interface WebSocketMessage {
  command: string;
  body: {
    message_id?: string;
    message?: { content: { text: string } };
    text?: string;
    status?: string;
  };
}

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
  const { startRecording, stopRecording, recordingBlob, isRecording } = useAudioRecorder();

  useEffect(() => {
    document.addEventListener('TriggerModalEvent', (event) => {
      setOpenModal(true);
    });
  }, []);

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

  // Обработка микрофона
  const handleMicPress = useCallback(() => {
    if (!isRecording) startRecording();
  }, [isRecording, startRecording]);

  const handleMicRelease = useCallback(() => {
    if (isRecording) stopRecording();
  }, [isRecording, stopRecording]);

  // Обработка записанного аудио
  useEffect(() => {
    const recognizeAndSend = async () => {
      if (!recordingBlob || isRecording) return;
      try {
        const recognizedText = await API.microphoneRunRecognizeAPI(recordingBlob);
        sendMessage(recognizedText);
      } catch (err: any) {
        setError(err.message || 'Не удалось распознать голос');
      }
    };
    recognizeAndSend();
  }, [recordingBlob, isRecording, sendMessage]);

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
            Привет! Я — ваш виртуальный помощник,<br />
            <span className="botName">ChatBot</span>, и я здесь, чтобы помочь вам.
          </h1>
          <p className="subtitle">Вот что я могу для вас сделать:</p>
          <div className="buttonList">
            <button className="actionButton">
              <img src={images.Group12} alt="Phone" className="icon" />
              Запомню ваш контакт для связи
            </button>
            <button className="actionButton">
              <img src={images.Group9} alt="Lightbulb" className="icon" />
              Расскажу о продуктах и услугах
            </button>
            <button className="actionButton">
              <img src={images.Group10} alt="Map" className="icon" />
              Помогу с навигацией
            </button>
          </div>
          {!openModal && (
            <div className={styles.inputContainer}>
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                className={styles.input}
                placeholder="Введите сообщение..."
              />
              <div className={styles.buttonGroup}>
                <button
                  onMouseDown={handleMicPress}
                  onMouseUp={handleMicRelease}
                  onMouseLeave={handleMicRelease}
                  className={styles.micButton}
                  data-recording={isRecording}
                >
                  {isRecording ? '⏹' : '🎤'}
                </button>
                <button onClick={handleSend} className={styles.sendButton}>
                  ➤
                </button>
              </div>
            </div>
          )}
          <div className="bottomButtons">
            <button className="primaryButton">
              <img src={images.Group8} alt="Demo" className="icon" />
              Запросить демосессию
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