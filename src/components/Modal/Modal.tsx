import React, { useEffect, useRef } from 'react';
import { Message } from '../../types/chat';
import LoadingDots from '../LoadingDots/LoadingDots';
import ChatInput from '../ChatInput/ChatInput';
import styles from './Modal.module.css';
import { images } from '../../config/images';

interface ModalProps {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  messages: Message[];
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
}

const Modal: React.FC<ModalProps> = ({ setOpen, messages, onSendMessage, isLoading = false }) => {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const showLoadingDots = isLoading && messages.length > 0 && messages[messages.length - 1].isUser;

  return (
    <div className={styles['modal-overlay']}>
      <div className={styles['modal-container']}>
        <div className={styles['modal-header']}>
          <button
            onClick={() => setOpen(false)}
            className={`${styles['icon-button']} ${styles['close-button']}`}
            aria-label="Close chat"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M18 6L6 18M6 6L18 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
        <div className={styles['messages-area']}>
          {messages.map((msg) => (
            <div
              key={msg.id || msg.text + Math.random()}
              className={`${styles.message} ${msg.isUser ? styles['user-message'] : styles['bot-message']}`}
            >
              <img 
                src={msg.isUser ? images.Frame4 : images.Frame3} 
                alt={msg.isUser ? "User avatar" : "Bot avatar"}
                className={styles['message-avatar']}
              />
              <div className={styles['message-bubble']}>
                <p>{msg.text}</p>
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
        <ChatInput
          visualMode={false}
          onSendMessage={onSendMessage}
          placeholder="Ваш вопрос"
          onError={setError}
        />
      </div>
    </div>
  );
};

export default Modal;