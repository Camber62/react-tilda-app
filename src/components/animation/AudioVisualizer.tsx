import React from 'react';
interface AudioVisualizerProps {
  audioUrl: string;
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ audioUrl }) => {
  // const containerRef = useRef<HTMLDivElement>(null);
  // const waveRef = useRef<CircularAudioWave | null>(null);
  // const [isPlaying, setIsPlaying] = useState(false);
  // const [error, setError] = useState<string | null>(null);

  // useEffect(() => {
  //   if (containerRef.current) {
  //     try {
  //       waveRef.current = new CircularAudioWave(containerRef.current);
  //       waveRef.current.loadAudio(audioUrl);
  //       setError(null);
  //     } catch (err) {
  //       setError('Ошибка при загрузке аудио');
  //       console.error(err);
  //     }
  //   }

  //   return () => {
  //     if (waveRef.current) {
  //       // Очистка ресурсов при размонтировании компонента
  //       waveRef.current = null;
  //     }
  //   };
  // }, [audioUrl]);

  // const handlePlay = () => {
  //   if (waveRef.current) {
  //     waveRef.current.play();
  //     setIsPlaying(true);
  //   }
  // };

  // const handlePause = () => {
  //   if (waveRef.current) {
  //     waveRef.current.pause();
  //     setIsPlaying(false);
  //   }
  // };

  return (
    <div>
      {/* {error ? (
        <div style={{ color: 'red' }}>{error}</div>
      ) : (
        <>
          <div style={{ marginBottom: '10px' }}>
            <button 
              onClick={isPlaying ? handlePause : handlePlay}
              style={{ marginRight: '10px' }}
            >
              {isPlaying ? 'Пауза' : 'Воспроизвести'}
            </button>
            <span>Статус: {isPlaying ? 'Воспроизведение' : 'Пауза'}</span>
          </div>
          <div 
            ref={containerRef} 
            style={{ 
              width: '100%', 
              height: '400px',
              margin: '20px 0'
            }} 
          />
        </>
      )} */}
    </div>
  );
};

export default AudioVisualizer; 
// src/components/AudioPlayer.tsx

// import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
// import { StringSplitting } from "./tools/StringSplitting";
// import API from "./api";

// interface TextToSpeechResponse {
//     audio_file_url: string;
// }

// export interface PlayerProps {
//     message: string;
//     startPlayingCB: () => void;
//     endPlayingCB: () => void;
//     isPause: boolean;
//     volume?: number;
//     onAmplitudeUpdate?: (amplitude: number) => void;
// }

// export const AudioPlayer: React.FC<PlayerProps> = ({
//     message,
//     isPause,
//     endPlayingCB,
//     startPlayingCB,
//     volume = 100,
//     onAmplitudeUpdate,
// }) => {
//     const [textChunks, setTextChunks] = useState<string[]>([]);
//     const [audioTracks, setAudioTracks] = useState<{ index: number; url: string }[]>([]);
//     const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
//     const [currentTrackUrl, setCurrentTrackUrl] = useState<string | undefined>(undefined);

//     const audioRef = useRef<HTMLAudioElement | null>(null);
//     const audioContextRef = useRef<AudioContext | null>(null);
//     const analyserRef = useRef<AnalyserNode | null>(null);
//     const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
//     const animationFrameRef = useRef<number | null>(null);

//     const playerVolume = useMemo(() => {
//         const normalizedVolume = (volume ?? 100) / 100;
//         return Math.max(0, Math.min(1, normalizedVolume));
//     }, [volume]);

//     const resetPlayer = useCallback(() => {
//         setTextChunks([]);
//         setAudioTracks([]);
//         setCurrentTrackIndex(0);
//         setCurrentTrackUrl(undefined);
//         if (audioRef.current) {
//             audioRef.current.pause();
//             audioRef.current = null;
//         }
//         cleanupAudioAnalysis();
//     }, []);

//     const setupAudioAnalysis = useCallback(() => {
//         if (!audioRef.current || !currentTrackUrl) return;

//         const audioContext = new (window.AudioContext || window.webkitAudioContext)();
//         const analyser = audioContext.createAnalyser();
//         analyser.fftSize = 2048;
//         const bufferLength = analyser.frequencyBinCount;
//         const dataArray = new Uint8Array(bufferLength);

//         const source = audioContext.createMediaElementSource(audioRef.current);
//         source.connect(analyser);
//         analyser.connect(audioContext.destination);

//         audioContextRef.current = audioContext;
//         analyserRef.current = analyser;
//         sourceRef.current = source;

//         const analyzeAmplitude = () => {
//             if (!analyserRef.current || isPause) {
//                 animationFrameRef.current = requestAnimationFrame(analyzeAmplitude);
//                 return;
//             }

//             analyserRef.current.getByteTimeDomainData(dataArray);
//             let sum = 0;
//             for (let i = 0; i < bufferLength; i++) {
//                 const value = (dataArray[i] - 128) / 128;
//                 sum += Math.abs(value);
//             }
//             const average = sum / bufferLength;
//             const amplitude = Math.min(10, Math.round(average * 10 * 10));

//             if (onAmplitudeUpdate) {
//                 onAmplitudeUpdate(amplitude);
//             }

//             animationFrameRef.current = requestAnimationFrame(analyzeAmplitude);
//         };

//         animationFrameRef.current = requestAnimationFrame(analyzeAmplitude);
//     }, [currentTrackUrl, isPause, onAmplitudeUpdate]);

//     const cleanupAudioAnalysis = useCallback(() => {
//         if (animationFrameRef.current) {
//             cancelAnimationFrame(animationFrameRef.current);
//         }
//         if (audioContextRef.current) {
//             audioContextRef.current.close();
//         }
//         audioContextRef.current = null;
//         analyserRef.current = null;
//         sourceRef.current = null;
//     }, []);

//     useEffect(() => {
//         if (message) {
//             const chunks = StringSplitting(message);
//             setTextChunks(chunks);
//         }
//     }, [message]);

//     const convertTextToAudio = useCallback(async (text: string, index: number) => {
//         try {
//             const response: TextToSpeechResponse = await API.textToSpeechAPI(text);
//             if (response && response.audio_file_url) {
//                 setAudioTracks((prev) => [...prev, { index, url: response.audio_file_url }]);
//             }
//         } catch (error) {
//             console.error("Ошибка при преобразовании текста в аудио:", error);
//         }
//     }, []);

//     useEffect(() => {
//         if (textChunks.length > 0) {
//             textChunks.forEach((chunk, index) => {
//                 convertTextToAudio(chunk, index);
//             });
//         }
//     }, [textChunks, convertTextToAudio]);

//     const updateCurrentTrack = useCallback(() => {
//         const track = audioTracks.find((item) => item.index === currentTrackIndex);
//         if (track) {
//             setCurrentTrackUrl(track.url);
//         }
//     }, [audioTracks, currentTrackIndex]);

//     useEffect(() => {
//         if (audioTracks.length > 0 && !currentTrackUrl) {
//             updateCurrentTrack();
//         }
//     }, [audioTracks, currentTrackUrl, updateCurrentTrack]);

//     useEffect(() => {
//         if (currentTrackUrl) {
//             const audio = new Audio(currentTrackUrl);
//             audio.crossOrigin = "anonymous";
//             audio.volume = playerVolume;
//             audioRef.current = audio;

//             audio.onloadeddata = () => {
//                 startPlayingCB();
//                 setupAudioAnalysis();
//                 if (!isPause) {
//                     audio.play().catch((error) => console.error("Ошибка воспроизведения:", error));
//                 }
//             };
//             audio.onended = () => {
//                 if (currentTrackIndex + 1 < textChunks.length) {
//                     setCurrentTrackIndex((prev) => prev + 1);
//                     setCurrentTrackUrl(undefined);
//                 } else {
//                     resetPlayer();
//                     endPlayingCB();
//                 }
//             };

//             return () => {
//                 audio.pause();
//                 cleanupAudioAnalysis();
//             };
//         }
//     }, [currentTrackUrl, isPause, playerVolume, startPlayingCB, endPlayingCB, setupAudioAnalysis, resetPlayer, currentTrackIndex, textChunks.length]);

//     useEffect(() => {
//         if (audioRef.current) {
//             if (isPause) {
//                 audioRef.current.pause();
//             } else {
//                 audioRef.current.play().catch((error) => console.error("Ошибка воспроизведения:", error));
//             }
//         }
//     }, [isPause]);

//     return null; // Компонент не рендерит ничего в DOM
// };