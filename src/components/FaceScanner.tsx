import React, { useEffect, useRef, useState } from 'react';
import { recognizeFace } from '../utils/api';
import { UserX } from 'lucide-react';

interface FaceScannerProps {
    onSuccess: (roll: string) => void;
}

const FaceScanner: React.FC<FaceScannerProps> = ({ onSuccess }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [error, setError] = useState<string | null>(null);
    const [status, setStatus] = useState("Starting camera...");
    const [verifying, setVerifying] = useState(false);

    useEffect(() => {
        let isMounted = true;
        const startCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'user' },
                });
                if (!isMounted || !videoRef.current) return;
                videoRef.current.srcObject = stream;
                videoRef.current.onloadedmetadata = () => {
                    if (videoRef.current) {
                        videoRef.current.play();
                        setStatus("Ready. Tap 'Verify Face' to scan.");
                    }
                };
            } catch (err) {
                console.error("Camera error:", err);
                setError("Camera access denied or system error.");
            }
        };
        startCamera();
        return () => {
            isMounted = false;
            if (videoRef.current?.srcObject) {
                (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const handleVerifyFace = async () => {
        if (!videoRef.current || verifying) return;
        const video = videoRef.current;
        if (video.paused || video.readyState < 2) return;
        setVerifying(true);
        setStatus("Verifying...");
        try {
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                setStatus("Error capturing frame.");
                setVerifying(false);
                return;
            }
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const blob = await new Promise<Blob | null>((resolve) =>
                canvas.toBlob(resolve, 'image/jpeg', 0.92)
            );
            if (!blob) {
                setStatus("Error capturing image.");
                setVerifying(false);
                return;
            }
            const result = await recognizeFace(blob);
            if (result.status === "recognized" && result.person) {
                setStatus("✓ Identity Verified!");
                const video = videoRef.current;
                if (video?.srcObject) {
                    (video.srcObject as MediaStream).getTracks().forEach((track) => track.stop());
                    video.srcObject = null;
                }
                onSuccess(result.person!);
                return;
            }
            setStatus(result.status === "unknown" ? "Face not recognized. Try again." : "Verification failed. Try again.");
        } catch (err) {
            console.error("Verify error:", err);
            setStatus("Verification failed. Please try again.");
        }
        setVerifying(false);
    };

    return (
        <div className="relative w-full h-full bg-black flex flex-col items-center justify-center overflow-hidden">
            <video
                ref={videoRef}
                className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1]"
                playsInline
                muted
            />

            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <div className={`w-64 h-64 border-4 ${status.includes("Verified") ? "border-green-500" : "border-white/50"} rounded-full mb-8 relative overflow-hidden transition-colors duration-300`}>
                    <div className="absolute inset-0 bg-brand-green/10"></div>
                    {!error && status !== "✓ Identity Verified!" && (
                        <div className="absolute top-0 left-0 right-0 h-1 bg-brand-green shadow-[0_0_15px_rgba(0,106,78,1)] animate-[scan_2s_ease-in-out_infinite]"></div>
                    )}
                </div>
                <div className="bg-black/60 px-6 py-2 rounded-full backdrop-blur-sm max-w-[80%] text-center">
                    <p className={`font-medium ${status.includes("Verified") ? "text-green-400" : "text-white"}`}>{status}</p>
                </div>
            </div>

            {error && (
                <div className="absolute inset-0 bg-gray-900 flex flex-col items-center justify-center text-white p-4 text-center z-50">
                    <UserX size={48} className="text-red-500 mb-4" />
                    <p className="font-bold text-lg mb-2">Verification Failed</p>
                    <p className="text-sm opacity-80">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-8 px-6 py-2 bg-brand-green text-white font-bold rounded-full hover:bg-green-700"
                    >
                        Retry
                    </button>
                </div>
            )}

            {!error && (
                <button
                    onClick={handleVerifyFace}
                    disabled={verifying}
                    className="absolute bottom-4 right-4 px-3 py-1 bg-white/20 text-white text-xs rounded-full hover:bg-white/40 z-50 cursor-pointer pointer-events-auto disabled:opacity-60"
                >
                    Verify Face
                </button>
            )}
        </div>
    );
};

export default FaceScanner;
