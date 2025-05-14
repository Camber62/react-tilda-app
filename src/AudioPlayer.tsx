// src/components/AudioPlayer.tsx

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactHowler from "react-howler";
import { StringSplitting } from "./tools/StringSplitting";
import API from "./api";

interface TextToSpeechResponse {
    audio_file_url: string;
}

export interface PlayerProps {
    message: string;
    startPlayingCB: () => void;
    endPlayingCB: () => void;
    isPause: boolean;
    volume?: number;
}

export const AudioPlayer: React.FC<PlayerProps> = ({
    message,
    isPause,
    endPlayingCB,
    startPlayingCB,
    volume = 100,
}) => {
    const [textChunks, setTextChunks] = useState<string[]>([]);
    const [audioTracks, setAudioTracks] = useState<{ index: number; url: string }[]>([]);
    const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
    const [currentTrackUrl, setCurrentTrackUrl] = useState<string | undefined>(undefined);

    const playerRef = useRef<ReactHowler | null>(null);

    const playerVolume = useMemo(() => {
        const normalizedVolume = (volume ?? 100) / 100;
        return Math.max(0, Math.min(1, normalizedVolume));
    }, [volume]);

    const resetPlayer = useCallback(() => {
        setTextChunks([]);
        setAudioTracks([]);
        setCurrentTrackIndex(0);
        setCurrentTrackUrl(undefined);
        if (playerRef.current) {
            playerRef.current.howler.unload();
        }
    }, []);

    // Установка textChunks без немедленного сброса
    useEffect(() => {
        // console.log("Message received:", message);
        if (message) {
            const chunks = StringSplitting(message);
            // console.log("Chunks created:", chunks);
            setTextChunks(chunks);
            // Убираем resetPlayer() отсюда
        }
    }, [message]);

    const convertTextToAudio = useCallback(async (text: string, index: number) => {
        // console.log("convertTextToAudio called with text:", text, "index:", index);
        try {
            const response: TextToSpeechResponse = await API.textToSpeechAPI(text);
            // console.log("API response:", response);
            if (response && response.audio_file_url) {
                setAudioTracks((prev) => [...prev, { index, url: response.audio_file_url }]);
            } else {
                throw new Error("Неверный формат ответа от API: отсутствует audio_file_url");
            }
        } catch (error) {
            console.error("Ошибка при преобразовании текста в аудио:", error);
        }
    }, []);

    useEffect(() => {
        // console.log("textChunks updated:", textChunks);
        if (textChunks.length > 0) {
            textChunks.forEach((chunk, index) => {
                convertTextToAudio(chunk, index);
            });
        }
    }, [textChunks, convertTextToAudio]);

    const updateCurrentTrack = useCallback(() => {
        const track = audioTracks.find((item) => item.index === currentTrackIndex);
        if (track) {
            // console.log("Updating current track URL:", track.url);
            setCurrentTrackUrl(track.url);
        }
    }, [audioTracks, currentTrackIndex]);

    useEffect(() => {
        if (audioTracks.length > 0 && !currentTrackUrl) {
            updateCurrentTrack();
        }
    }, [audioTracks, currentTrackUrl, updateCurrentTrack]);

    const handleEnd = useCallback(() => {
        if (currentTrackIndex + 1 < textChunks.length) {
            setCurrentTrackIndex((prev) => prev + 1);
            setCurrentTrackUrl(undefined);
        } else {
            resetPlayer(); // Сбрасываем только после завершения всех треков
            endPlayingCB();
        }
    }, [currentTrackIndex, textChunks.length, resetPlayer, endPlayingCB]);

    const handleLoad = useCallback(() => {
        startPlayingCB();
    }, [startPlayingCB]);

    return (
        <>
            {currentTrackUrl && (
                <ReactHowler
                    src={currentTrackUrl}
                    playing={!isPause}
                    volume={playerVolume}
                    format={["ogg"]}
                    onLoad={handleLoad}
                    onEnd={handleEnd}
                    ref={(ref) => {
                        playerRef.current = ref;
                    }}
                />
            )}
        </>
    );
};