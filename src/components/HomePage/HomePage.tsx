import React from 'react';
import ChatWindow from '../ChatBot/Chat';

const HomePage: React.FC = () => {
  return (
    <div className="App">
    <div className="chatContainer">
      <div className="chatAvatar">
        <img src={`${process.env.PUBLIC_URL}/Frame3.png`} alt="ChatBot Avatar" className="glowingOrb" />
      </div>
      <div className="chatContent">
        <h1 className="greeting">
          Привет! Я — ваш виртуальный помощник,<br/>
          <span className="botName">ChatBot</span>, и я здесь, чтобы помочь вам.
        </h1>
        <p className="subtitle">Вот что я могу для вас сделать:</p>
        
        <div className="buttonList">
          <button className="actionButton">
            <img src={`${process.env.PUBLIC_URL}/Group12.png`} alt="Phone" className="icon" />
            Запомню ваш котакт для связи
          </button>
          <button className="actionButton">
            <img src={`${process.env.PUBLIC_URL}/Group9.png`} alt="Lightbulb" className="icon" />
            Расскажу о продуктах и услугах
          </button>
          <button className="actionButton">
            <img src={`${process.env.PUBLIC_URL}/Group10.png`} alt="Map" className="icon" />
            Помогу с навигацией
          </button>
        </div>
        <ChatWindow />
        <div className="bottomButtons">
          <button className="primaryButton">
            <img src={`${process.env.PUBLIC_URL}/Group11.png`} alt="Experts" className="icon" />
            Связаться с экспертами
          </button>
          <button className="primaryButton">
            <img src={`${process.env.PUBLIC_URL}/Group8.png`} alt="Demo" className="icon" />
            Испытать демо
          </button>
        </div>
      </div>
    </div>
  </div>
  );
};

export default HomePage; 