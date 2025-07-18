import React, { useEffect, useRef, useState } from 'react';
import { images } from '../../config/images';
import { storageService } from '../../services/storage';
import { ChatHistoryItem, Message } from '../../types/chat';
import ChatInput from '../ChatInput/ChatInput';
import LoadingDots from '../LoadingDots/LoadingDots';
import styles from './Modal.module.css';
import ReactMarkdown from 'react-markdown';

interface ModalProps {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  messages: Message[];
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  closeChat: () => void;
  openChatById: (chatId: string, messages: Message[]) => void;
  isHistoryMode?: boolean;
  isAudioPlaying?: boolean;
  isChatEnded?: boolean;
}

const Modal: React.FC<ModalProps> = ({ messages, onSendMessage, isLoading = false, closeChat, openChatById, isHistoryMode = false, isAudioPlaying, isChatEnded = false }) => {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = React.useState<ChatHistoryItem[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);

  // Получение истории чатов при открытии истории
  useEffect(() => {
    if (showHistory) {
      const chatHistory = storageService.getHistory();
      // Сортируем историю по времени (новые сверху)
      const sortedHistory = [...chatHistory].sort((a, b) => b.timestamp - a.timestamp);
      console.log('Загружена история чатов:', sortedHistory);
      setHistory(sortedHistory);
    }
  }, [showHistory]);

  // Скролл к низу при изменении сообщений
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Отображение точек загрузки при генерации ответа
  const showLoadingDots = isLoading && (messages.length === 0 || messages[messages.length - 1]?.isUser);

  // Обработка клика по истории чатов
  const handleHistoryClick = (item: ChatHistoryItem) => {
    console.log('Открытие чата из истории:', item);
    setIsHistoryLoading(true);
    openChatById(item.id, item.messages);
    setShowHistory(false);
  };

  // Добавляем эффект для сброса состояния загрузки при получении сообщений
  useEffect(() => {
    if (messages.length > 0) {
      setIsHistoryLoading(false);
    }
  }, [messages]);
 
  function formatTimestamp(timestamp: number): string {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (minutes < 60) return `${minutes}мин`;
    if (hours < 24) return `${hours}ч`;
    return `${days}дн`;
  }

  return (
    <div className={styles['modal-overlay']}>
      <div className={styles['modal-container']}>
        <div className={styles['modal-header']} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            {showHistory ? (
              <button
                onClick={() => setShowHistory(false)}
                className={styles['icon-button']}
                aria-label="Назад к чату"
                style={{ marginRight: 8 }}
              >
                <img src={images.Back} alt="Back" />
              </button>
            ) : (
              <button
                onClick={() => setShowHistory((prev) => !prev)}
                className={styles['icon-button']}
              >
                <img src={images.History} alt="History" />
              </button>
            )}
          </div>
          <div />
          <button
            onClick={closeChat}
            className={`${styles['icon-button']} ${styles['close-button']}`}
            aria-label="Close chat"
          >
            <img src={images.Close} alt="Close" />
          </button>
        </div>
        {!showHistory && (
          <>
            {isHistoryLoading ? (
              <div className={styles['loading-container']}>
                <div className={styles['loading-spinner']}></div>
              </div>
            ) : (
              <>
                <div className={styles['messages-area']}>
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`${styles.message} ${msg.isUser ? styles['user-message'] : styles['bot-message']}`}
                    >
                      <img
                        src={msg.isUser ? images.Frame4 : images.Frame3}
                        alt={msg.isUser ? "User avatar" : "Bot avatar"}
                        className={styles['message-avatar']}
                      />
                      <div className={styles['message-bubble']}>
                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                      </div>
                    </div>
                  ))}
                  {showLoadingDots && (
                    <div className={`${styles.message} ${styles['bot-message']}`}>
                      <LoadingDots />
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
                {isChatEnded ? (
                  <div className={styles['chat-ended-message']}>
                    Чат закрыт
                  </div>
                ) : (
                  <ChatInput
                    visualMode={false}
                    onSendMessage={onSendMessage}
                    placeholder={isHistoryMode ? "Начать новый чат" : "Ваш вопрос"}
                    onError={setError}
                    isAudioPlaying={isAudioPlaying}
                  />
                )}
              </>
            )}
          </>
        )}

        {/* <button onClick={() => {
          storageService.clearAllChats();
          storageService.deleteUserInfo();
        }}>Удалить историю</button> */}

        {showHistory && (
          <div className={styles['history-list']} style={{ position: 'relative', margin: 0, top: 0, left: 0, right: 0, boxShadow: 'none', border: 'none', borderRadius: 0, maxHeight: 'none', height: '100%', minHeight: 320 }}>
            <div style={{ height: '1px', background: '#f0f0f0', margin: '0 0 8px 0' }} />
            {history.map((item) => (
              <div
                key={item.id}
                className={styles['history-item']}
                onClick={() => handleHistoryClick(item)}
              >
                <span>{item.firstMessage}</span>
                <span className={styles['history-date']}>
                  {formatTimestamp(item.timestamp)}
                </span>
                <span className={styles['history-arrow']}>
                  <img src={images.Vector6} alt="arrow" style={{ width: 24, height: 24 }} />
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;