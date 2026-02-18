import React, { useEffect, useRef, useState } from 'react';
import { loadModels, getFaceDescriptor, loadReferenceDescriptor, isMatch } from '../utils/faceApi';
import { UserX } from 'lucide-react';

interface FaceScannerProps {
    onSuccess: () => void;
}

const FaceScanner: React.FC<FaceScannerProps> = ({ onSuccess }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [error, setError] = useState<string | null>(null);
    const [status, setStatus] = useState("Initializing models...");
    const [isReferenceLoaded, setIsReferenceLoaded] = useState(false);

    useEffect(() => {
        let isMounted = true;
        let interval: NodeJS.Timeout;

        const startSystem = async () => {
            try {
                // 1. Load Models
                const modelsLoaded = await loadModels();
                if (!isMounted) return;

                if (!modelsLoaded) {
                    setError("Failed to load face recognition models.");
                    return;
                }

                // 2. Load Reference Image
                setStatus("Loading reference data...");
                // We assume user put 'reference.jpg' in public folder
                const descriptor = await loadReferenceDescriptor('/reference.jpg');
                if (!descriptor) {
                    setError("Reference image not found. Please add 'reference.jpg' to the public/ folder.");
                    return;
                }
                setIsReferenceLoaded(true);

                // 3. Start Camera
                const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.onloadedmetadata = () => {
                        if (videoRef.current) {
                            videoRef.current.play();
                            setStatus("Looking for a match...");

                            // 4. Start Matching Loop
                            interval = setInterval(async () => {
                                if (videoRef.current && !videoRef.current.paused && !videoRef.current.ended) {
                                    try {
                                        // Get live face descriptor
                                        const liveDescriptor = await getFaceDescriptor(videoRef.current);

                                        if (liveDescriptor) {
                                            // Compare with reference
                                            const match = isMatch(liveDescriptor, descriptor);

                                            if (match) {
                                                setStatus("✓ Identity Verified!");
                                                clearInterval(interval);
                                                setTimeout(() => {
                                                    onSuccess();
                                                }, 1000);
                                            } else {
                                                setStatus("Face detected - No match. Please try again.");
                                            }
                                        } else {
                                            // No face detected in frame
                                            setStatus("Position your face in the frame...");
                                        }
                                    } catch (err) {
                                        console.warn("Detection error:", err);
                                        setStatus("Detection error - Retrying...");
                                    }
                                }
                            }, 500); // Check every 0.5 seconds for faster response
                        }
                    };
                }
            } catch (err) {
                console.error("System Error:", err);
                setError("Camera access denied or system error.");
            }
        };

        startSystem();

        return () => {
            isMounted = false;
            clearInterval(interval);
            if (videoRef.current && videoRef.current.srcObject) {
                (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
            }
        };
    }, [onSuccess]);

    return (
        <div className="relative w-full h-full bg-black flex flex-col items-center justify-center overflow-hidden">
            <video
                ref={videoRef}
                className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1]"
                playsInline
                muted
            />

            {/* Overlay UI */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                {/* Face Frame Guide */}
                <div className={`w - 64 h - 64 border - 4 ${status === "Identity Verified!" ? "border-green-500" : "border-white/50"} rounded - full mb - 8 relative overflow - hidden transition - colors duration - 300`}>
                    <div className="absolute inset-0 bg-brand-green/10"></div>

                    {/* Scan Line Animation - only if reference is loaded and not error */}
                    {!error && isReferenceLoaded && status !== "Identity Verified!" && (
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

                    {error.includes("reference.jpg") && (
                        <div className="mt-6 text-xs text-left bg-gray-800 p-4 rounded-lg">
                            <p className="font-bold text-yellow-500 mb-1">Developer Step Required:</p>
                            <p>1. Take a selfie.</p>
                            <p>2. Rename it to <code className="bg-gray-700 px-1 rounded">reference.jpg</code></p>
                            <p>3. Place it in the project's <code className="bg-gray-700 px-1 rounded">public/</code> folder.</p>
                            <p>4. Refresh this page.</p>
                        </div>
                    )}

                    <button
                        onClick={() => window.location.reload()}
                        className="mt-8 px-6 py-2 bg-brand-green text-white font-bold rounded-full hover:bg-green-700"
                    >
                        Retry
                    </button>

                    {/* Fallback for testing regardless */}
                    <button
                        onClick={onSuccess}
                        className="mt-4 px-4 py-2 text-xs text-gray-500 hover:text-white"
                    >
                        [DEV] Skip Verification
                    </button>
                </div>
            )}

            {/* Manual Override hidden unless needed */}
            {!error && (
                <button
                    onClick={onSuccess}
                    className="absolute bottom-4 right-4 px-3 py-1 bg-white/20 text-white text-xs rounded-full hover:bg-white/40 z-50 cursor-pointer pointer-events-auto"
                >
                    Simulate Match
                </button>
            )}
        </div>
    );
};

export default FaceScanner;
