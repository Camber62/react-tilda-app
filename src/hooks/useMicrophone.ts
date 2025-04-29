import {useAudioRecorder} from "react-audio-voice-recorder";
import {useEffect} from "react";

export const useMicrophone = (is: boolean) => {

    const {startRecording, stopRecording, recordingBlob, isRecording} = useAudioRecorder();

    useEffect(() => {
        if (is) {
            startRecording();
        } else {
            stopRecording();
        }
    }, [is, startRecording, stopRecording]);

    return {isRecording, recordingBlob};
};
