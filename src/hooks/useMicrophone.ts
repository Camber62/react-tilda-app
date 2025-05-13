import {useAudioRecorder} from "react-audio-voice-recorder";
import {useEffect, useState, useCallback} from "react";

interface MicrophoneOptions {
    onError?: (error: Error) => void;
    onStart?: () => void;
    onStop?: (blob: Blob | null) => void;
}

export const useMicrophone = (isRecording: boolean, options: MicrophoneOptions = {}) => {
    const [isMicrophoneAvailable, setIsMicrophoneAvailable] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    const {
        startRecording,
        stopRecording,
        recordingBlob,
        isRecording: isCurrentlyRecording,
    } = useAudioRecorder();

    const checkMicrophoneAvailability = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({audio: true});
            stream.getTracks().forEach(track => track.stop());
            setIsMicrophoneAvailable(true);
            setError(null);
        } catch (err) {
            setIsMicrophoneAvailable(false);
            setError(err instanceof Error ? err : new Error('Не удалось получить доступ к микрофону'));
            options.onError?.(err instanceof Error ? err : new Error('Не удалось получить доступ к микрофону'));
        }
    }, [options]);

    useEffect(() => {
        checkMicrophoneAvailability();
    }, [checkMicrophoneAvailability]);

    useEffect(() => {
        if (!isMicrophoneAvailable) return;

        if (isRecording) {
            try {
                startRecording();
                options.onStart?.();
            } catch (err) {
                const error = err instanceof Error ? err : new Error('Ошибка при начале записи');
                setError(error);
                options.onError?.(error);
            }
        } else if (isCurrentlyRecording) {
            try {
                stopRecording();
                options.onStop?.(recordingBlob || null);
            } catch (err) {
                const error = err instanceof Error ? err : new Error('Ошибка при остановке записи');
                setError(error);
                options.onError?.(error);
            }
        }
    }, [isRecording, isMicrophoneAvailable, startRecording, stopRecording, recordingBlob, options, isCurrentlyRecording]);

    return {
        isRecording: isCurrentlyRecording,
        recordingBlob,
        isMicrophoneAvailable,
        error,
        checkMicrophoneAvailability,
    };
};
