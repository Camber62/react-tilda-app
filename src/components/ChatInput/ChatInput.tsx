import React, { useState } from 'react';
import { images } from '../../config/images';
import { useAudioRecording } from '../../hooks/useAudioRecording';
import { AudioPreview } from '../AudioPreview';
import styles from './ChatInput.module.css';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  placeholder?: string;
  onError?: (error: string | null) => void;
  visualMode: boolean;
  disabled?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({visualMode, onSendMessage, placeholder, onError, disabled = false }) => {
  const [inputText, setInputText] = useState('');
  const [isRecognizing, setIsRecognizing] = useState(false);

  const {
    isRecording,
    isAudioReady,
    pendingAudio,
    handleMicPress,
    handleMicRelease,
    handleAudioCancel,
    handleAudioConfirm
  } = useAudioRecording({
    onAudioRecognized: (text) => {
      setIsRecognizing(false);
      onSendMessage(text);
    },
    onError: onError || (() => {})
  });

  const handleSend = () => {
    if (!inputText.trim()) return;
    onSendMessage(inputText);
    setInputText('');
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleAudioConfirmClick = () => {
    setIsRecognizing(true);
    handleAudioConfirm();
  };

  if (isAudioReady && pendingAudio) {
    return (
      <AudioPreview
        audioBlob={pendingAudio}
        onCancel={handleAudioCancel}
        onConfirm={handleAudioConfirmClick}
        isRecognizing={isRecognizing}
      />
    );
  }

  return (
  <>
    {!visualMode ? 
    (<div className={styles.inputContainer}>
      <input
        type="text"
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        onKeyDown={handleKeyPress}
        className={styles.inputModal}
        placeholder=" "
        disabled={disabled}
      />
      <div className={styles.customPlaceholder}>
        <span>{placeholder}</span>
      </div>
      <div className={styles.buttonGroup}>
        <button
          onMouseDown={handleMicPress}
          onMouseUp={handleMicRelease}
          onMouseLeave={handleMicRelease}
          className={styles.micButton}
          data-recording={isRecording}
          disabled={disabled}
        >
          {isRecording ? '⏹' : <img src={images.Group67} alt="Mic" className="icon" />}
        </button>
        <button onClick={handleSend} className={styles.sendButton} disabled={disabled}>
          <img src={images.Group66} alt="Send" className="icon" />
        </button>
      </div>
    </div>
    ):(
    <div className={styles.inputContainerModal}>
      <input
        type="text"
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        onKeyDown={handleKeyPress}
        className={styles.input}
        placeholder=" "
        disabled={disabled}
      />
      <div className={styles.customPlaceholder}>
        <span>{placeholder}</span>
      </div>
      <div className={styles.buttonGroup}>
        <button
          onMouseDown={handleMicPress}
          onMouseUp={handleMicRelease}
          onMouseLeave={handleMicRelease}
          className={styles.micButton}
          data-recording={isRecording}
          disabled={disabled}
        >
          {isRecording ? '⏹' : <img src={images.Group67} alt="Mic" className="icon" />}
        </button>
        <button onClick={handleSend} className={styles.sendButton} disabled={disabled}>
          <img src={images.Group66} alt="Send" className="icon" />
        </button>
      </div>
    </div>
    )}
  </>
  );
};

export default ChatInput; 