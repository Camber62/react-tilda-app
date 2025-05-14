import { ChatType } from '../api/initChat';

export interface Message {
  text: string;
  isUser: boolean;
  id?: string;
}

export interface WebSocketMessage {
  command: string;
  body: {
    message_id?: string;
    message?: { content: { text: string; json?: { message: string } } };
    text?: string;
    status?: string;
  };
}

export interface ChatJsonData {
  message: string;
  step_1: {
    person_name: string | null;
    contact_information: string | null;
  };
  step_2: {
    desired_goal: string | null;
  };
  step_3: {
    profession: string | null;
    challenge: string | null;
    job_title: string | null;
  };
  step_4: {
    primary_need: string | null;
  };
  step_5: {
    information_sources: string | null;
  };
  step_6: {
    automatable_tasks: string | null;
  };
  step_7: {
    implementation_concerns: string | null;
  };
  step_8: {
    existing_technologies: string | null;
  };
  step_9: {
    missing_features: string | null;
  };
}

export interface ChatHistoryMessage {
  id: string;
  text: string;
  timestamp: number;
  type: ChatType;
}

export interface ChatHistoryItem {
  id: string;
  type: ChatType;
  timestamp: number;
  firstMessage: string;
  messages: Message[];
}

export interface ChatHistoryStorage {
  messages: ChatHistoryMessage[];
  lastUpdated: number;
}