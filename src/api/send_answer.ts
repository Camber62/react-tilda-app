interface SendAnswerRequest {
    answer?: string[]; // Сделали опциональным
    image?: File;
}

interface AnswerResponse {
    id: string;
    question: string;
    status: "user_answer" | "check_image_data" | "load_answer" | "check_answer" | "generation" | "start" | "end";
    end_date: string | null;
    image_data: string;
    image_url: string;
    report: string;
    is_correct: boolean;

}

const BASE_URL = 'https://api-ai.deeptalk.tech/intensive-server';
const authToken = 'Token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJvcmdfaWQiOiI5ZTY1MmJlOC1mNDJhLTRmMjgtOTI2ZC02ODFmZWYzZjczODEiLCJncm91cCI6IjIiLCJzdWJncm91cCI6ImR0bGVjdHVyZSJ9.4RXkSeav+Ux1Bdc3cIQg9OtKnAfrVs8yZyVcNWMSRq8=';

export const send_answer = async (
    userQuestionId: string,
    request: SendAnswerRequest
): Promise<AnswerResponse> => {
    const url = `${BASE_URL}/api/v2/send_answer/${userQuestionId}/`;
    const form = new FormData();

    if (request.answer && request.answer.length > 0) {
        request.answer.forEach((ans) => form.append('answer', ans));
    } else {
        form.append('answer', ''); // Отправляем пустую строку, если answer не указан
    }
    if (request.image) {
        form.append('image', request.image);
    }

    const options = {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Authorization': authToken,
        },
        body: form,
    };

    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            const errorText = await response.text(); // Получаем текст ошибки
            console.error(`Ошибка ${response.status}: ${errorText}`);
            throw new Error(`Ошибка ${response.status}: ${errorText}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Ошибка при отправке ответа:", error);
        throw error;
    }
};