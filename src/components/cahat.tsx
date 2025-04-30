import React, { useState } from 'react';

type Message = {
  id: number;
  text: string;
  sender: 'user' | 'bot';
};

const ChatWidget: React.FC<{ setIsOpen: React.Dispatch<React.SetStateAction<boolean>> }> = ({ setIsOpen }) => {
  const [input, setInput] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: 'Привет! Как я могу вам помочь?', sender: 'bot' },
  ]);

  const handleSendMessage = () => {
    if (!input.trim()) return;

    const newMessage: Message = {
      id: Date.now(),
      text: input,
      sender: 'user',
    };

    setMessages((prev) => [...prev, newMessage]);
    setInput('');

    // Имитация ответа бота
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), text: 'Я получил ваше сообщение!', sender: 'bot' },
      ]);
    }, 1000);
  };

  const toggleChat = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <div className="chat-widget">
      <div className="chat-window">
        <div className="chat-header">
          <span>Чат с поддержкой</span>
          <button className="close-btn" onClick={toggleChat}>
            &times;
          </button>
        </div>
        <div className="chat-messages">
          {messages.map((msg) => (
            <div key={msg.id} className={`message ${msg.sender}-message`}>
              {msg.text}
            </div>
          ))}
        </div>
        <div className="chat-input">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Введите сообщение..."
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <button onClick={handleSendMessage}>Отправить</button>
        </div>
      </div>

      {/* Стили внутри компонента — для упрощения */}
      <style>{`
        .chat-widget {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 9999;
          font-family: Arial, sans-serif;
        }

        .chat-button {
          background-color: #0d6efd;
          color: white;
          border: none;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          font-size: 24px;
          cursor: pointer;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
        }

        .chat-window {
          width: 300px;
          height: 400px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .chat-header {
          background-color: #0d6efd;
          color: white;
          padding: 12px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .close-btn {
          background: none;
          color: white;
          border: none;
          font-size: 20px;
          cursor: pointer;
        }

        .chat-messages {
          flex: 1;
          padding: 10px;
          overflow-y: auto;
          background-color: #f9f9f9;
        }

        .message {
          margin: 5px 0;
          padding: 8px 12px;
          border-radius: 10px;
          max-width: 80%;
          line-height: 1.4;
        }

        .user-message {
          background-color: #dcf8c6;
          align-self: flex-end;
        }

        .bot-message {
          background-color: #e5e5ea;
          align-self: flex-start;
        }

        .chat-input {
          display: flex;
          padding: 10px;
          border-top: 1px solid #ddd;
          background: #fff;
        }

        .chat-input input {
          flex: 1;
          padding: 8px;
          border: 1px solid #ccc;
          border-radius: 4px;
          margin-right: 8px;
        }

        .chat-input button {
          padding: 8px 12px;
          background-color: #0d6efd;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default ChatWidget;