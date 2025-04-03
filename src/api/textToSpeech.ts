import axios from "axios";

interface TextToSpeechParams {
    model_tts: string;
    voice: string;
    language: string;
    speed: string;
    tone: string;
    text: string;
    ssml: boolean;
    filter_profanity: boolean;
    numbers_as_words: boolean;
    transcription_needed: boolean;
}

export const textToSpeechAPI = async (text: string) => {
    const params: TextToSpeechParams = {
        model_tts: "y-TTS",
        voice: "ermil",
        language: "ru-RU",
        speed: "1.0",
        tone: "neutral",
        text: text,
        ssml: false,
        filter_profanity: false,
        numbers_as_words: false,
        transcription_needed: false,
    };

    const url = 'https://service.deeptalk.tech/new-stt/api/v1/audio/tts/sync/';

    try {
        const response = await axios.post(
            url,
            params,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJvcmdfaWQiOiJiOGQzMDhkNy0wNjg4LTQxZTUtYjc3ZS03MWNiYzBhMjhlNzgiLCJncm91cCI6InF3ZSIsInN1Ymdyb3VwIjoicXdlIn0.MQqKEJy4mU4AySKZA_nEJFZbYwbPfIdg_HOSPWZXPDc`
                },
            }
        );

        if (![200, 201].includes(response.status)) {
            throw new Error("Ошибка при преобразовании текста в речь");
        }

        return response.data;

    } catch (error) {
        console.error("Ошибка при преобразовании текста в речь:", error);
        throw new Error("Ошибка при преобразовании текста в речь");
    }
}; 