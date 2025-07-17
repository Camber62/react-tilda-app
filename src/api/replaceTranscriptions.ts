import axios from "axios";

interface ReplaceTranscriptionsParams {
    text: string;
    group_id: string;
}

interface ReplaceTranscriptionsResponse {
    original_text: string;
    transcribed_text: string;
}

export const replaceTranscriptionsAPI = async (
    text: string, 
    groupId: string = "6"
): Promise<ReplaceTranscriptionsResponse> => {
    const params: ReplaceTranscriptionsParams = {
        text: text,
        group_id: groupId,
    };

    const url = "https://api-ai.deeptalk.tech/replace-transcriptions/api/v1/audio/api/v1/audio/tts/replace-transcriptions/";

    try {
        const response = await axios.post<ReplaceTranscriptionsResponse>(
            url,
            params,
            {
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );

        if (![200, 201].includes(response.status)) {
            throw new Error("Ошибка при обработке текста через справочник озвучки");
        }

        return response.data;
    } catch (error) {
        console.error("Ошибка при обработке текста через справочник озвучки:", error);
        // В случае ошибки возвращаем исходный текст
        return {
            original_text: text,
            transcribed_text: text
        };
    }
}; 