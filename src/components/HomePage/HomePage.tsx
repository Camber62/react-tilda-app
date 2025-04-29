import React from 'react';
import ChatWindow from '../ChatBot/Chat';
import { images } from '../../config/images';

const HomePage: React.FC = () => {
  return (
    <div className="App">
    <div className="chatContainer">
      <div className="chatAvatar">
        <img src={images.Frame3} alt="ChatBot Avatar" className="glowingOrb" />
      </div>
      <div className="chatContent">
        <h1 className="greeting">
          Привет! Я — ваш виртуальный помощник,<br/>
          <span className="botName">ChatBot</span>, и я здесь, чтобы помочь вам.
        </h1>
        <p className="subtitle">Вот что я могу для вас сделать:</p>
        
        <div className="buttonList">
          <button className="actionButton">
            <img src={images.Group12} alt="Phone" className="icon" />
            Запомню ваш котакт для связи
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
        <ChatWindow />
        <div className="bottomButtons">
          <button className="primaryButton">
            <img src={images.Group11} alt="Experts" className="icon" />
            Связаться с экспертами
          </button>
          <button className="primaryButton">
            <img src={images.Group8} alt="Demo" className="icon" />
            Испытать демо
          </button>
        </div>
      </div>
    </div>
  </div>
  );
};

export default HomePage; 