import axios, {AxiosResponse} from "axios";

const BASE_URL = 'https://api-ai.deeptalk.tech/intensive-server';
const authToken = 'Token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJvcmdfaWQiOiI5ZTY1MmJlOC1mNDJhLTRmMjgtOTI2ZC02ODFmZWYzZjczODEiLCJncm91cCI6IjIiLCJzdWJncm91cCI6ImR0bGVjdHVyZSJ9.4RXkSeav+Ux1Bdc3cIQg9OtKnAfrVs8yZyVcNWMSRq8=';

// Тип данных для ответа API
export interface ChatInit {
    chat_id: string,
    id: string,
}

export const init_chat = async (chatId: string): Promise<AxiosResponse<ChatInit>> => {
    const url = `${BASE_URL}/api/v2/chat_init/${chatId}/`;
    const options = {
        headers: {
            Accept: "application/json",
            Authorization: authToken,
        },
    };

    try {
        return await axios.get(url, options);
    } catch (error) {
        console.error("Ошибка при инициализации чата:", error);
        throw error;
    }
}; 