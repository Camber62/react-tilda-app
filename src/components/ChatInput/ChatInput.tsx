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
  isAudioPlaying?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({visualMode, onSendMessage, placeholder, onError, disabled = false, isAudioPlaying }) => {
  const [inputText, setInputText] = useState('');
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [showAudioPreview, setShowAudioPreview] = useState(false);
  const [isSending, setIsSending] = useState(false);

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

  const handleSend = async () => {
    if (inputText.trim()) {
      onSendMessage(inputText);
      setInputText('');
    }
    
    if (pendingAudio && isAudioReady) {
      setIsSending(true);
      setIsRecognizing(true);
      try {
        await handleAudioConfirm();
      } finally {
        setIsSending(false);
      }
    }
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

  const handleAudioButtonClick = () => {
    setShowAudioPreview(true);
  };

  if (showAudioPreview && isAudioReady && pendingAudio) {
    return (
      <AudioPreview
        audioBlob={pendingAudio}
        onCancel={() => {
          setShowAudioPreview(false);
          handleAudioCancel();
        }}
        onConfirm={handleAudioConfirmClick}
        isRecognizing={isRecognizing}
      />
    );
  }

  const renderButtonGroup = () => {
    if (isSending || isRecognizing) {
      return (
        <div className={styles.buttonGroup}>
          <div className={styles.loader}>Распознавание...</div>
        </div>
      );
    }

    return (
      <div className={styles.buttonGroup}>
        <button
          onMouseDown={handleMicPress}
          onMouseUp={handleMicRelease}
          onMouseLeave={handleMicRelease}
          className={styles.micButton}
          data-recording={isRecording}
          disabled={isAudioPlaying || Boolean(pendingAudio && isAudioReady)}
        >
          {isRecording ? '⏹' : <img src={images.Group67} alt="Mic" className="icon" />}
        </button>
        {pendingAudio && <button onClick={handleAudioButtonClick} className={styles.sendButton} disabled={isAudioPlaying}>
          <img src={images.Group66} alt="audio" className="icon" />
        </button>}
        <button onClick={handleSend} className={styles.sendButton} disabled={isAudioPlaying}>
          <img src={images.Send} alt="Send" className="icon" />
        </button>
      </div>
    );
  };

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
      {renderButtonGroup()}
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
      {renderButtonGroup()}
    </div>
    )}
  </>
  );
};

export default ChatInput; 