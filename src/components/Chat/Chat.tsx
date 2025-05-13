import React, { useState } from 'react';
import styles from './Chat.module.css';

interface ChatWindowProps {
    isLoading: boolean;
    error: string | null;
    isRecording: boolean;
    onSendMessage: (message: string) => void;
    onMicPress: () => void;
    onMicRelease: () => void;
    setOpenChat: (isOpen: boolean) => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
    isLoading,
    error,
    isRecording,
    onSendMessage,
    onMicPress,
    onMicRelease,
    setOpenChat,
}) => {
    const [inputMessage, setInputMessage] = useState<string>('');

    // Handle Enter key press
    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && inputMessage.trim()) {
            onSendMessage(inputMessage);
            setInputMessage('');
            setOpenChat(true);
        }
    };

    // Handle send button click
    const handleSend = () => {
        if (inputMessage.trim()) {
            onSendMessage(inputMessage);
            setInputMessage('');
            setOpenChat(true);
        }
    };

    return (
        <div className={styles.inputContainer}>
            <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                className={styles.input}
                placeholder="Введите сообщение..."
            />
            <button onClick={handleSend} className={styles.sendButton}>
                Отправить
            </button>
            <button
                onMouseDown={onMicPress}
                onMouseUp={onMicRelease}
                onMouseLeave={onMicRelease}
                className={styles.micButton}
                data-recording={isRecording}
            >
                {isRecording ? 'Отпустите для завершения' : 'Микрофон'}
            </button>
        </div>
    );
};