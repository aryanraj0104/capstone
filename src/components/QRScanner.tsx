import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';

interface QRScannerProps {
    onVerificationSuccess: (roll: string) => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ onVerificationSuccess }) => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const startCamera = async () => {
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.play();
                }
            }
        };

        startCamera();

        return () => {
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const captureAndVerify = async () => {
        if (videoRef.current) {
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
                const imageBlob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve));
                if (imageBlob) {
                    const formData = new FormData();
                    formData.append('image', imageBlob, 'snapshot.jpg');

                    try {
                        const response = await axios.post('http://127.0.0.1:5000/recognize', formData);
                        const { message, roll } = response.data;
                        setMessage(`${message}: ${roll}`);
                        if (message === 'Match found') {
                            onVerificationSuccess(roll);
                        }
                    } catch (error) {
                        setMessage('Verification failed. Please try again.');
                    }
                }
            }
        }
    };

    return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-black relative">
            <video ref={videoRef} className="w-full max-w-sm overflow-hidden rounded-lg" />
            <button
                onClick={captureAndVerify}
                className="absolute bottom-4 right-4 px-3 py-1 bg-white/20 text-white text-xs rounded-full hover:bg-white/40 z-50"
            >
                Verify Face
            </button>
            {message && <p className="text-white/60 text-sm mt-4">{message}</p>}
        </div>
    );
};

export default QRScanner;
