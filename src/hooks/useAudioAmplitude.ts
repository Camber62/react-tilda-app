    // src/hooks/useAudioAmplitude.ts
import { useEffect, useRef } from 'react';

// Объявление типа для webkitAudioContext
declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
  }
}

const useAudioAmplitude = (audioUrl: string | null) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!audioUrl) return;

    const audio = new Audio(audioUrl);
    audio.crossOrigin = 'anonymous'; // Добавляем поддержку CORS
    audioRef.current = audio;

    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaElementSource(audio);

    analyser.fftSize = 2048;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    source.connect(analyser);
    analyser.connect(audioContext.destination);

    const analyzeAmplitude = () => {
      analyser.getByteTimeDomainData(dataArray);

      // Вычисляем среднюю амплитуду
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        const value = (dataArray[i] - 128) / 128; // Нормализация от -1 до 1
        sum += Math.abs(value);
      }
    //   const average = sum / bufferLength;

      // Преобразуем в диапазон от 0 до 10
    //   const amplitude = Math.min(10, Math.round(average * 10 * 10)); // Умножаем на 10 для усиления
    //   console.log('Amplitude (0-10):', amplitude);

      if (!audio.ended) {
        requestAnimationFrame(analyzeAmplitude);
      }
    };

    audio.onplay = () => {
      analyzeAmplitude();
    };

    audio.play().catch((error) => {
      console.error('Ошибка воспроизведения:', error);
    });

    return () => {
      audio.pause();
      audioContext.close();
    };
  }, [audioUrl]);

  return audioRef;
};

export default useAudioAmplitude;