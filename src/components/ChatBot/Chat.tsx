import React, { useCallback, useEffect, useRef, useState } from 'react';
import useWebSocket from 'react-use-websocket';
import API from '../../api';
import styles from './Chat.module.css';
import { AudioPlayer } from '../../AudioPlayer';
import { useAudioRecorder } from 'react-audio-voice-recorder';

interface Message {
  text: string;
  isUser: boolean;
  id?: string;
}

interface WebSocketMessage {
  command: string;
  body: {
    message_id?: string;
    message?: {
      content: {
        text: string;
      };
    };
    text?: string;
    status?: string;
  };
}


const ChatWindow: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [chatId, setChatId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [socketUrl, setSocketUrl] = useState<string | undefined>(undefined);
  const [inputMessage, setInputMessage] = useState<string>('');
  const processedMessageIds = useRef<Set<string>>(new Set());
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [currentAudioMessage, setCurrentAudioMessage] = useState<string>('');

  // Используем хук для записи аудио
  const { startRecording, stopRecording, recordingBlob, isRecording } = useAudioRecorder();

  // Инициализация WebSocket
  const { sendJsonMessage, lastJsonMessage, readyState } = useWebSocket<WebSocketMessage>(
    socketUrl || null,
    {
      onOpen: () => console.log('WebSocket connection opened'),
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
        setSocketUrl(`wss://api-ai.deeptalk.tech/chat-server-ws/ws/${chatId}`);
        return;
      }

      try {
        setError(null);
        const chatResponse = await API.initChat();
        console.log('Chat initialized with ID:', chatResponse.id);
        setChatId(chatResponse.id);
        setMessages([{ text: 'Привет! Как я могу вам помочь?', isUser: false }]);
      } catch (error: any) {
        console.error('Ошибка при инициализации чата:', error);
        setError(error.message || 'Произошла ошибка при инициализации чата');
        setMessages([{ text: 'Извините, произошла ошибка', isUser: false }]);
      } finally {
        setIsLoading(false);
      }
    };

    initializeChat();
  }, [chatId]);

  // Обработка входящих сообщений от WebSocket
  useEffect(() => {
    if (lastJsonMessage && lastJsonMessage.command === 'send_message' && lastJsonMessage.body?.message_id) {
      if (!processedMessageIds.current.has(lastJsonMessage.body.message_id)) {
        processedMessageIds.current.add(lastJsonMessage.body.message_id);
        const newMessage = {
          id: lastJsonMessage.body.message_id,
          text: lastJsonMessage.body.message?.content.text || 'Ошибка: нет текста сообщения',
          isUser: false,
        };
        setMessages((prev) => [...prev, newMessage]);
        setIsLoading(false);

        if (newMessage.text && newMessage.text !== 'start') {
          setCurrentAudioMessage(newMessage.text);
        }
      }
    }

    if (lastJsonMessage?.command === 'status') {
      setIsLoading(lastJsonMessage.body.status === 'generating');
    }
  }, [lastJsonMessage]);

  // Функция отправки сообщения
  const sendMessage = useCallback(
    (message: string) => {
      if (!message.trim() || readyState !== WebSocket.OPEN) return;

      const userMessage = { text: message, isUser: true, id: Date.now().toString() };
      setMessages((prev) => [...prev, userMessage]);

      sendJsonMessage({
        command: 'send_message',
        body: {
          text: message,
        },
      });
      setInputMessage('');
    },
    [sendJsonMessage, readyState]
  );

  // Обработка записи и распознавания
  const handleMicPress = () => {
    if (!isRecording) {
      startRecording(); // Начинаем запись при нажатии
    }
  };

  const handleMicRelease = useCallback(async () => {
    if (isRecording) {
      stopRecording(); // Останавливаем запись при отпускании
    }
  }, [isRecording, stopRecording]);

  // Обработка Blob после завершения записи
  useEffect(() => {
    if (!isRecording && recordingBlob) {
      const recognizeAndSend = async () => {
        try {
          const recognizedText = await API.microphoneRunRecognizeAPI(recordingBlob);
          sendMessage(recognizedText); // Отправляем распознанный текст через WebSocket
        } catch (err: any) {
          console.error('Ошибка распознавания:', err);
          setError(err.message || 'Ошибка при распознавании голоса');
        }
      };
      recognizeAndSend();
    }
  }, [recordingBlob, isRecording, sendMessage]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      sendMessage(inputMessage);
    }
  };

  if (isLoading && !messages.length) {
    return (
      <div className={styles.chatContainer}>
        <div className={styles.spinnerContainer}>
          <div className={styles.spinner}></div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.chatContainer}>
      {error && <div className={styles.errorMessage}>{error}</div>}
      <div className={styles.messagesContainer}>
        {messages.map((message) => (
          <div
            key={message.id || message.text + Math.random()}
            className={`${styles.message} ${message.isUser ? styles.userMessage : styles.otherMessage}`}
          >
            {message.text}
          </div>
        ))}
        {isLoading && <div className={styles.loading}>Загрузка...</div>}
      </div>
      <div className={styles.inputContainer}>
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          className={styles.input}
          placeholder="Введите сообщение..."
          disabled={readyState !== WebSocket.OPEN}
        />
        <button
          onClick={() => sendMessage(inputMessage)}
          className={styles.sendButton}
          disabled={readyState !== WebSocket.OPEN}
        >
          Отправить
        </button>
        <button
          onMouseDown={handleMicPress}
          onMouseUp={handleMicRelease}
          onMouseLeave={handleMicRelease}
          className={styles.micButton}
          disabled={readyState !== WebSocket.OPEN}
          data-recording={isRecording}
        >
          {isRecording ? 'Отпустите для завершения' : 'Микрофон'}
        </button>
      </div>
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

export default ChatWindow;