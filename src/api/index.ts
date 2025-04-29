import { initChat } from "./initChat";
import { microphoneRunRecognizeAPI } from "./microphoneRecognize";
import { textToSpeechAPI } from "./textToSpeech";

const API = {
    initChat: initChat,
    textToSpeechAPI: textToSpeechAPI,
    microphoneRunRecognizeAPI: microphoneRunRecognizeAPI,
}

export default API;