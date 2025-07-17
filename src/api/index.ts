import { initChat } from "./initChat";
import { microphoneRunRecognizeAPI } from "./microphoneRecognize";
import { textToSpeechAPI } from "./textToSpeech";
import { replaceTranscriptionsAPI } from "./replaceTranscriptions";

const API = {
    initChat: initChat,
    textToSpeechAPI: textToSpeechAPI,
    microphoneRunRecognizeAPI: microphoneRunRecognizeAPI,
    replaceTranscriptionsAPI: replaceTranscriptionsAPI,
}

export default API;