import React, { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { images } from '../config/images';

interface AudioPreviewProps {
    audioBlob: Blob;
    onCancel: () => void;
    onConfirm: () => void;
    isRecognizing?: boolean;
}

export const AudioPreview: React.FC<AudioPreviewProps> = ({ audioBlob, onCancel, onConfirm, isRecognizing = false }) => {
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
        <div>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                background: '#F5F5F5',
                borderRadius: 16,
                padding: 12,
                position: 'relative',
                width: '100%',
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
                {isRecognizing ? (
                    <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px',
                        padding: '0 8px'
                    }}>
                        <div style={{
                            width: '24px',
                            height: '24px',
                            border: '2px solid #f3f3f3',
                            borderTop: '2px solid #3498db',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite'
                        }} />
                    </div>
                ) : (
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            style={{ border: 'none', cursor: 'pointer', background: 'none' }}
                            onClick={onCancel}
                            aria-label="Отменить"
                        >
                            <img src={images.Close} alt="Close" />
                        </button>
                        <button
                            style={{ border: 'none', cursor: 'pointer', background: 'none' }}
                            onClick={onConfirm}
                            aria-label="Подтвердить"
                        >
                            <img src={images.Ok} alt="Ok" />
                        </button>
                    </div>
                )}
            </div>
            <style>
                {`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}
            </style>
        </div>
    );
}; 