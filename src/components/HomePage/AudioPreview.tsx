import React, { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { images } from '../../config/images';

interface AudioPreviewProps {
    audioBlob: Blob;
    onCancel: () => void;
    onConfirm: () => void;
}

export const AudioPreview: React.FC<AudioPreviewProps> = ({ audioBlob, onCancel, onConfirm }) => {
    const waveformRef = useRef<HTMLDivElement>(null);
    const wavesurfer = useRef<WaveSurfer | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        if (waveformRef.current && audioBlob) {
            if (wavesurfer.current) {
                wavesurfer.current.destroy();
            }
            wavesurfer.current = WaveSurfer.create({
                container: waveformRef.current,
                waveColor: '#ccc',
                progressColor: '#222',
                height: 48,
                barWidth: 2,
                cursorWidth: 0,
            });
            wavesurfer.current.loadBlob(audioBlob);

            wavesurfer.current.on('finish', () => setIsPlaying(false));
        }
        return () => {
            wavesurfer.current && wavesurfer.current.destroy();
        };
    }, [audioBlob]);

    const handlePlayPause = () => {
        if (wavesurfer.current) {
            wavesurfer.current.playPause();
            setIsPlaying(wavesurfer.current.isPlaying());
        }
    };

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            background: '#F5F5F5',
            borderRadius: 16,
            padding: 12,
            position: 'relative',
            width: '100%',
            //   margin: '0 auto',
            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
            gap: 12
        }}>
            <button
                onClick={handlePlayPause}
                aria-label={isPlaying ? 'Пауза' : 'Воспроизвести'}
                style={{
                    width: 44, height: 44, borderRadius: '50%', background: '#fff', border: 'none',
                    fontSize: 24, marginRight: 8, cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s',
                }}
            >
                {isPlaying ? '⏸' : '▶'}
            </button>
            <div style={{ flex: 1, position: 'relative', height: 48, display: 'flex', alignItems: 'center', borderRadius: 8, padding: '0 8px' }}>
                <div ref={waveformRef} style={{ width: '100%' }} />
            </div>
            <button
                onClick={onCancel}
                aria-label="Отменить"
            >
                <img src={images.Close} alt="Close" />
            </button>
            <button
                onClick={onConfirm}
                aria-label="Отправить"
            >
                <img src={images.Ok} alt="Ok" />
            </button>
        </div>
    );
}; 