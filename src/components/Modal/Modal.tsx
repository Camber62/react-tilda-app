import React, { useState, useRef, useEffect } from 'react';
import './Modal.css';
import LoadingDots from '../LoadingDots/LoadingDots';

interface Message {
  text: string;
  isUser: boolean;
  id?: string;
}

interface ModalProps {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  messages: Message[];
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
}

const Modal: React.FC<ModalProps> = ({ setOpen, messages, onSendMessage, isLoading = false }) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle sending message
  const handleSend = () => {
    if (!inputText.trim()) return;
    onSendMessage(inputText);
    setInputText('');
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSend();
  };

  const showLoadingDots = isLoading && messages.length > 0 && messages[messages.length - 1].isUser;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <button
            onClick={() => setOpen(false)}
            className="icon-button close-button"
            aria-label="Close chat"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div className="messages-area">
          {messages.map((msg) => (
            <div
              key={msg.id || msg.text + Math.random()}
              className={`message ${msg.isUser ? 'user-message' : 'bot-message'}`}
            >
              <div className="message-bubble">
                <p>{msg.text}</p>
              </div>
            </div>
          ))}
          {showLoadingDots && (
            <div className="message bot-message">
              <LoadingDots />
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="input-area">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ваш вопрос"
          />
          <button
            onClick={handleSend}
            className="icon-button send-button"
            aria-label="Send message"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;