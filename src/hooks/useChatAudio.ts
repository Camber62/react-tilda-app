import { useEffect, useState, useMemo } from 'react';
import { Message } from '../types/chat';

export const useChatAudio = (messages: Message[], isModalOpen: boolean) => {
  const [currentAudioMessage, setCurrentAudioMessage] = useState<string>('');
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  const lastMessage = useMemo(() => messages[messages.length - 1], [messages]);

  useEffect(() => {
    if (lastMessage && !lastMessage.isUser && lastMessage.text && lastMessage.text !== 'start' && isModalOpen) {
      setCurrentAudioMessage(lastMessage.text);
      setIsAudioPlaying(true);
    } else if (!isModalOpen) {
      // Останавливаем воспроизведение при закрытии модалки
      setIsAudioPlaying(false);
      setCurrentAudioMessage('');
    }
  }, [lastMessage, isModalOpen]);

  const handleAudioEnd = () => {
    setIsAudioPlaying(false);
    setCurrentAudioMessage('');
  };

  return {
    currentAudioMessage,
    isAudioPlaying,
    setIsAudioPlaying,
    handleAudioEnd
  };
};