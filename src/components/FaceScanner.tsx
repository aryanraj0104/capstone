import React, { useEffect, useRef, useState } from 'react';
import { recognizeFace } from '../utils/api';
import { UserX } from 'lucide-react';
import { FaceMesh } from '@mediapipe/face_mesh';

interface FaceScannerProps {
    onSuccess: (roll: string) => void;
    loggedInRoll?: string | null;
}

const FaceScanner: React.FC<FaceScannerProps> = ({ onSuccess, loggedInRoll }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [error, setError] = useState<string | null>(null);
    const [status, setStatus] = useState("Starting camera...");
    const verifyingRef = useRef(false);
    const faceMeshRef = useRef<FaceMesh | null>(null);
    const animationFrameId = useRef<number | null>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const noFaceCounterRef = useRef(0);
    const belowThresholdCountRef = useRef(0);
    const aboveThresholdCountRef = useRef(0);
    const blinkInProgressRef = useRef(false);

    const EAR_THRESHOLD = 0.22;
    const FRAMES_BELOW_THRESHOLD_FOR_BLINK = 3;
    const FRAMES_ABOVE_THRESHOLD_AFTER_BLINK = 3;

    const stopCameraAndLoop = () => {
        if (animationFrameId.current !== null) {
            cancelAnimationFrame(animationFrameId.current);
            animationFrameId.current = null;
        }
        if (videoRef.current?.srcObject) {
            (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
    };

    const eyeAspectRatio = (landmarks: { x: number; y: number; z: number }[], eyeIndices: number[]) => {
        const p = (i: number) => landmarks[i];
        const dist = (a: { x: number; y: number; z: number }, b: { x: number; y: number; z: number }) => {
            const dx = a.x - b.x;
            const dy = a.y - b.y;
            return Math.hypot(dx, dy);
        };

        const p1 = p(eyeIndices[0]);
        const p2 = p(eyeIndices[1]);
        const p3 = p(eyeIndices[2]);
        const p4 = p(eyeIndices[3]);
        const p5 = p(eyeIndices[4]);
        const p6 = p(eyeIndices[5]);

        const vertical1 = dist(p2, p6);
        const vertical2 = dist(p3, p5);
        const horizontal = dist(p1, p4);

        if (horizontal === 0) return 0;
        return (vertical1 + vertical2) / (2.0 * horizontal);
    };

    const captureFrameAndRecognize = async () => {
        if (!videoRef.current || verifyingRef.current) return;
        const video = videoRef.current;
        if (video.paused || video.readyState < 2) return;

        verifyingRef.current = true;
        setStatus("Verifying...");

        try {
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                setStatus("Error capturing frame.");
                verifyingRef.current = false;
                return;
            }
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const blob = await new Promise<Blob | null>((resolve) =>
                canvas.toBlob(resolve, 'image/jpeg', 0.92)
            );
            if (!blob) {
                setStatus("Error capturing image.");
                verifyingRef.current = false;
                return;
            }
            const result = await recognizeFace(blob);
            if (result.status === "recognized" && result.person) {
                const recognizedRoll = result.person.trim();
                const expectedRoll = loggedInRoll?.trim() ?? '';
                if (expectedRoll && recognizedRoll.toLowerCase() !== expectedRoll.toLowerCase()) {
                    setStatus("Failed - face does not match logged-in user.");
                    stopCameraAndLoop();
                    return;
                }
                setStatus("Verified");
                stopCameraAndLoop();
                onSuccess(result.person!);
                return;
            }
            setStatus(result.status === "unknown" ? "Failed - face not recognized." : "Verification failed.");
            stopCameraAndLoop();
        } catch (err) {
            console.error("Verify error:", err);
            setStatus("Verification failed. Please try again.");
            stopCameraAndLoop();
        } finally {
            verifyingRef.current = false;
        }
    };

    useEffect(() => {
        let isMounted = true;

        const initFaceMesh = () => {
            if (faceMeshRef.current) return;
            const faceMesh = new FaceMesh({
                locateFile: (file) =>
                    `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
            });
            faceMesh.setOptions({
                maxNumFaces: 1,
                refineLandmarks: true,
                minDetectionConfidence: 0.5,
                minTrackingConfidence: 0.5,
            });
            faceMeshRef.current = faceMesh;
        };

        const startDetectionLoop = () => {
            if (!videoRef.current || !faceMeshRef.current) return;
            const video = videoRef.current;
            const faceMesh = faceMeshRef.current;

            const processFrame = async () => {
                if (!videoRef.current || !faceMeshRef.current) return;
                if (video.readyState >= 2 && !verifyingRef.current) {
                    try {
                        await faceMesh.send({ image: video });
                    } catch (e) {
                        console.error("FaceMesh error:", e);
                    }
                }
                animationFrameId.current = requestAnimationFrame(processFrame);
            };

            faceMesh.onResults((results: any) => {
                if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) {
                    noFaceCounterRef.current += 1;
                    if (noFaceCounterRef.current > 5 && !verifyingRef.current) {
                        setStatus("No face detected");
                    }
                    return;
                }

                noFaceCounterRef.current = 0;
                if (verifyingRef.current) {
                    setStatus("Verifying...");
                    return;
                }

                const landmarks = results.multiFaceLandmarks[0] as { x: number; y: number; z: number }[];

                const leftEyeIndices = [33, 160, 158, 133, 153, 144];
                const rightEyeIndices = [362, 385, 387, 263, 373, 380];

                const leftEAR = eyeAspectRatio(landmarks, leftEyeIndices);
                const rightEAR = eyeAspectRatio(landmarks, rightEyeIndices);
                const ear = (leftEAR + rightEAR) / 2.0;

                if (ear < EAR_THRESHOLD) {
                    belowThresholdCountRef.current += 1;
                    aboveThresholdCountRef.current = 0;
                } else {
                    aboveThresholdCountRef.current += 1;
                    belowThresholdCountRef.current = 0;
                }

                if (!verifyingRef.current && !blinkInProgressRef.current) {
                    if (belowThresholdCountRef.current >= FRAMES_BELOW_THRESHOLD_FOR_BLINK) {
                        blinkInProgressRef.current = true;
                        setStatus("Verifying...");
                    } else {
                        setStatus("Blink to verify");
                    }
                } else if (blinkInProgressRef.current) {
                    if (aboveThresholdCountRef.current >= FRAMES_ABOVE_THRESHOLD_AFTER_BLINK) {
                        blinkInProgressRef.current = false;
                        belowThresholdCountRef.current = 0;
                        aboveThresholdCountRef.current = 0;
                        captureFrameAndRecognize();
                    }
                }
            });

            animationFrameId.current = requestAnimationFrame(processFrame);
        };

        const startCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'user' },
                });
                if (!isMounted || !videoRef.current) return;
                streamRef.current = stream;
                videoRef.current.srcObject = stream;
                videoRef.current.onloadedmetadata = () => {
                    if (videoRef.current) {
                        videoRef.current.play();
                        setStatus("Blink to verify");
                        initFaceMesh();
                        startDetectionLoop();
                    }
                };
            } catch (err) {
                console.error("Camera error:", err);
                setError("Camera access denied or system error.");
                stopCameraAndLoop();
            }
        };

        startCamera();

        return () => {
            isMounted = false;
            stopCameraAndLoop();
        };
    }, [loggedInRoll]);

    return (
        <div className="relative w-full h-full bg-black flex flex-col items-center justify-center overflow-hidden">
            <video
                ref={videoRef}
                className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1]"
                playsInline
                muted
            />

            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <div className={`w-64 h-64 border-4 ${status === "Verified" ? "border-green-500" : "border-white/50"} rounded-full mb-8 relative overflow-hidden transition-colors duration-300`}>
                    <div className="absolute inset-0 bg-brand-green/10"></div>
                    {!error && status !== "✓ Identity Verified!" && (
                        <div className="absolute top-0 left-0 right-0 h-1 bg-brand-green shadow-[0_0_15px_rgba(0,106,78,1)] animate-[scan_2s_ease-in-out_infinite]"></div>
                    )}
                </div>
                <div className="bg-black/60 px-6 py-2 rounded-full backdrop-blur-sm max-w-[80%] text-center">
                    <p className={`font-medium ${status === "Verified" ? "text-green-400" : "text-white"}`}>{status}</p>
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

            {/* No manual verify button; blink-based liveness is automatic */}
        </div>
    );
};

export default FaceScanner;
