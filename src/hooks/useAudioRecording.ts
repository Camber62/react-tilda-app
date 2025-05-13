import { useState, useCallback, useEffect } from 'react';
import { useAudioRecorder } from 'react-audio-voice-recorder';
import API from '../api';

interface UseAudioRecordingProps {
  onAudioRecognized: (text: string) => void;
  onError?: (error: string) => void;
}

export const useAudioRecording = ({ onAudioRecognized, onError }: UseAudioRecordingProps) => {
  const { startRecording, stopRecording, recordingBlob, isRecording } = useAudioRecorder();
  const [isAudioReady, setIsAudioReady] = useState(false);
  const [pendingAudio, setPendingAudio] = useState<Blob | null>(null);

  const handleMicPress = useCallback(() => {
    if (!isRecording) startRecording();
  }, [isRecording, startRecording]);

  const handleMicRelease = useCallback(() => {
    if (isRecording) stopRecording();
  }, [isRecording, stopRecording]);

  useEffect(() => {
    if (!recordingBlob || isRecording) return;
    setPendingAudio(recordingBlob);
    setIsAudioReady(true);
  }, [recordingBlob, isRecording]);

  const handleAudioCancel = useCallback(() => {
    setPendingAudio(null);
    setIsAudioReady(false);
  }, []);

  const handleAudioConfirm = useCallback(async () => {
    if (!pendingAudio) return;
    
    try {
      const recognizedText = await API.microphoneRunRecognizeAPI(pendingAudio);
      onAudioRecognized(recognizedText);
    } catch (err: any) {
      onError?.(err.message || 'Не удалось распознать голос');
    } finally {
      setPendingAudio(null);
      setIsAudioReady(false);
    }
  }, [pendingAudio, onAudioRecognized, onError]);

  return {
    isRecording,
    isAudioReady,
    pendingAudio,
    handleMicPress,
    handleMicRelease,
    handleAudioCancel,
    handleAudioConfirm
  };
}; 