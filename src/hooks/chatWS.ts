import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { v4 as uuidv4 } from 'uuid';
import { сhatWSStatus, сhatWSStatusChat, сhatWSSendMessage } from '../types/chatWSTypes';
import { Message } from '../types/chat';

const webSocketOptions = {
  shouldReconnect: () => true,
  reconnectAttempts: 3,
  reconnectInterval: 500,
};

export const useChatWS = (
  initialPhrase: string | undefined,
  urlWS: string | undefined
) => {
  const [returnIsWaiting, setReturnIsWaiting] = useState<boolean>(false);
  const [returnIsEndChat, setReturnIsEndChat] = useState<boolean>(false);
  const [returnMessages, setReturnMessages] = useState<Message[]>([]);
  const [returnUsesAI, setReturnUsesAI] = useState<boolean>(false);
  const [returnLikesSquidGame, setReturnLikesSquidGame] = useState<boolean>(false);
  const [returnFavoriteWork, setReturnFavoriteWork] = useState<string>('');

  const isSendFerstMessage = useRef<boolean>(false);
  const processedMessageIds = useRef<Set<any>>(new Set());

  // Проверяем, установлено ли соединение
  const webSocketConnetcing = useMemo<boolean>(() => {
    return urlWS !== undefined;
  }, [urlWS]);

  const addMessages = useCallback((messages: Message[]) => {
    setReturnMessages([])
    setReturnMessages(prevState => {
      // Фильтруем только уникальные сообщения по ID
      const uniqueMessages = messages.filter(newMsg =>
        !prevState.some(existingMsg => existingMsg.id === newMsg.id)
      );
      return [...prevState, ...uniqueMessages];
    });
  }, [])

  // Очищаем сообщения только при создании нового чата
  useEffect(() => {
    // Очищаем все состояния при изменении urlWS
    setReturnMessages([]);
    setReturnIsWaiting(false);
    setReturnIsEndChat(false);
    setReturnUsesAI(false);
    setReturnLikesSquidGame(false);
    setReturnFavoriteWork('');
    processedMessageIds.current.clear();
    isSendFerstMessage.current = false;
    console.log(99999);
  }, [urlWS]);

  const { sendJsonMessage, lastJsonMessage, readyState, getWebSocket } = useWebSocket<
    сhatWSStatus | сhatWSStatusChat | сhatWSSendMessage
  >(urlWS ?? null, webSocketOptions, webSocketConnetcing);

  // Обработчик отправки сообщения
  const commandSendMessage = useCallback((message: сhatWSSendMessage) => {
    const messageId = message.body.message_id.toString();

    // Проверяем, если сообщение еще не было обработано
    if (!processedMessageIds.current.has(messageId)) {
      processedMessageIds.current.add(messageId);

      // Получаем контент сообщения в зависимости от типа
      const messageContent = message.body.message.content;
      const isCustomerSurvey = messageContent.json !== null;

      // Устанавливаем дополнительные данные только для CUSTOMER_SURVEY
      if (isCustomerSurvey) {
        setReturnUsesAI(messageContent.json?.used_ai ?? false);
        setReturnLikesSquidGame(messageContent.json?.likes_squid_game ?? false);
        setReturnFavoriteWork(messageContent.json?.favorite_work ?? '');
      }

      // Получаем текст сообщения в зависимости от типа
      const messageText = isCustomerSurvey
        ? messageContent.json?.message ?? messageContent.text
        : messageContent.text;

      const newMessage = {
        isUser: message.body.role !== 'ai',
        text: messageText,
        isShow: !message.body.hide_message,
        id: messageId,
        body: message.body
      };

      setReturnMessages(prevState => [...prevState, newMessage]);
    }
  }, []);

  // Функция отправки сообщения пользователем
  const userSendMessage = useCallback(
    (message: string) => {
      const newMessageId = uuidv4().toString();
      sendJsonMessage({
        command: 'send_message',
        body: { text: message },
      });

      // Добавляем новое сообщение к существующим
      setReturnMessages(prevState => {
        const newMessage = {
          isUser: true,
          text: message,
          isShow: true,
          id: newMessageId,
        };
        // Проверяем, нет ли уже такого сообщения
        if (prevState.some(msg => msg.id === newMessageId)) {
          return prevState;
        }
        // Создаем новый массив с новым сообщением
        return [...prevState, newMessage];
      });
    },
    [sendJsonMessage]
  );

  // Функция закрытия чата
  const closeChat = useCallback(() => {
    if (readyState === ReadyState.OPEN) {
      sendJsonMessage({
        command: 'close_chat',
        body: {},
      });
      getWebSocket()?.close();
      setReturnIsEndChat(true);
      // Не очищаем сообщения при закрытии чата
      setReturnIsWaiting(false);
      setReturnUsesAI(false);
      setReturnLikesSquidGame(false);
      setReturnFavoriteWork('');
      // Не очищаем processedMessageIds при закрытии чата
      isSendFerstMessage.current = false;
    }
  }, [readyState, sendJsonMessage, getWebSocket]);

  // Обработчик закрытия соединения
  useEffect(() => {
    return () => {
      if (webSocketConnetcing && readyState === ReadyState.OPEN) {
        getWebSocket()?.close();
      }
    };
  }, [webSocketConnetcing, getWebSocket, readyState]);

  // Обработчик отправки первого сообщения
  useEffect(() => {
    if (readyState === ReadyState.OPEN && !isSendFerstMessage.current && initialPhrase) {
      isSendFerstMessage.current = true;
      setReturnIsWaiting(true);
      sendJsonMessage({
        command: 'send_message',
        body: {
          text: initialPhrase,
        },
      });
    }
  }, [initialPhrase, readyState, sendJsonMessage]);

  // Обработчик входящих сообщений
  useEffect(() => {
    if (lastJsonMessage) {
      if (lastJsonMessage.command === 'status') {
        if (lastJsonMessage.body.status === 'generating') {
          setReturnIsWaiting(true);
        }
        if (lastJsonMessage.body.status === 'done') {
          setReturnIsWaiting(false);
        }
      }

      if (lastJsonMessage.command === 'status_chat') {
        setReturnIsEndChat(lastJsonMessage.body.status === 'ended');
      }

      if (lastJsonMessage.command === 'send_message') {
        // Проверяем, не является ли сообщение частью истории
        const messageId = lastJsonMessage.body.message_id.toString();
        if (!processedMessageIds.current.has(messageId)) {
          commandSendMessage(lastJsonMessage);
        }
      }
    }
  }, [lastJsonMessage, commandSendMessage]);

  return {
    isWaiting: returnIsWaiting,//true - идет генерация ответа
    isEndChat: returnIsEndChat,//true - чат закончен
    messages: returnMessages,//массив сообщений
    usesAI: returnUsesAI,//true - используется AI
    likesSquidGame: returnLikesSquidGame,//true - нравится squid game
    favoriteWork: returnFavoriteWork,//строка - любимая работа
    sendMessage: userSendMessage,//функция отправки сообщения
    getWebSocket: getWebSocket,//функция получения WebSocket
    closeChat: closeChat,//функция закрытия чата
    addMessages: addMessages,//функция добавления сообщения
    wsState: getWebSocket()?.readyState,
  };
};
