import axios from "axios";

export const microphoneRunRecognizeAPI = async (content: Blob) => {
    const audioFile = new File([content], 'audio.webm', {type: "audio/webm"});
    const params = new FormData();
    params.append("model_stt", "y-STT-v3");
    params.append("language", "ru-RU");
    params.append("transcription_needed", "0");
    params.append("audio_file", audioFile);

    const response = await axios.post("https://service.deeptalk.tech/new-stt/api/v1/audio/stt/sync/",
        params, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'multipart/form-data',
                'Authorization': `Token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJvcmdfaWQiOiJiOGQzMDhkNy0wNjg4LTQxZTUtYjc3ZS03MWNiYzBhMjhlNzgiLCJncm91cCI6InF3ZSIsInN1Ymdyb3VwIjoicXdlIn0.MQqKEJy4mU4AySKZA_nEJFZbYwbPfIdg_HOSPWZXPDc`
            },
        });

    if (response.status !== 201) {
        throw new Error("Ошибка при преобразование голоса в текст");
    }

    if (!response.data.text.trim() || !response.data.text.length) {
        throw new Error("Сервис распознавания не смог распознать голос");
    }

    return response.data.text.trim();
}; 