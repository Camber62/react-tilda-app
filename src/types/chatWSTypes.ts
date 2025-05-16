export interface сhatWSStatus {
  command: 'status';
  body: {
    status: 'generating' | 'done';
  };
}

export interface сhatWSStatusChat {
  command: 'status_chat';
  body: {
    status: 'ended';
  };
}

export interface MessageMetadata {
  date: string;
  condition: 'ok' | 'error';
  modified: boolean;
  last_message: boolean;
}

export interface BaseMessageContent {
  text: string;
  images: string[];
  docs: null | string[];
  json: null | Record<string, any>;
}

export interface CustomerSurveyMessageContent extends BaseMessageContent {
  json: {
    message?: string;
    used_ai?: boolean;
    likes_squid_game?: boolean;
    favorite_work?: string;
    step_1?: { person_name: string | null; contact_information: string | null };
    step_2?: { desired_goal: string | null };
    step_3?: { profession: string | null; challenge: string | null; job_title: string | null };
    step_4?: { primary_need: string | null };
    step_5?: { information_sources: string | null };
    step_6?: { automatable_tasks: string | null };
    step_7?: { implementation_concerns: string | null };
    step_8?: { existing_technologies: string | null };
    step_9?: { missing_features: string | null };
  } | null;
}

export interface MainChatMessageContent extends BaseMessageContent {
  json: null;
}

export interface BaseMessage {
  content: BaseMessageContent;
  change_history: any[];
  message_number: number;
  metadata: MessageMetadata;
}

export interface BaseMessageBody {
  message_id: number;
  role: 'user' | 'ai';
  hide_message: boolean;
  message: BaseMessage;
  status: 'active' | 'inactive';
  id: string;
}

export interface сhatWSSendMessage {
  command: 'send_message';
  body: BaseMessageBody & {
    message: BaseMessage & {
      content: CustomerSurveyMessageContent | MainChatMessageContent;
    };
  };
}

export interface chatMessageStructure {
  isUser: boolean;
  text: string;
  isShow: boolean;
  id: string;
} 