import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { markAttendance } from '../utils/api';

interface QRScannerProps {
    roll: string;
    onAttendanceMarked: () => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ roll, onAttendanceMarked }) => {
    const [message, setMessage] = useState('');
    const html5QrRef = useRef<Html5Qrcode | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const submittedRef = useRef(false);

    useEffect(() => {
        const startScanner = async () => {
            if (!containerRef.current) return;
            try {
                const html5Qr = new Html5Qrcode("qr-reader");
                html5QrRef.current = html5Qr;
                await html5Qr.start(
                    { facingMode: "environment" },
                    { fps: 5, qrbox: { width: 250, height: 250 } },
                    (decodedText) => {
                        if (submittedRef.current) return;
                        submittedRef.current = true;
                        let sessionId: string;
                        try {
                            const data = JSON.parse(decodedText);
                            sessionId = data.session ?? decodedText;
                        } catch {
                            sessionId = decodedText;
                        }
                        html5Qr.stop().catch(() => {});
                        html5QrRef.current = null;
                        markAttendance(roll, sessionId)
                            .then((res) => {
                                if (res.status === "success") {
                                    setMessage("Attendance marked successfully");
                                    onAttendanceMarked();
                                } else {
                                    setMessage("Failed to mark attendance. Try again.");
                                    submittedRef.current = false;
                                    startScanner();
                                }
                            })
                            .catch(() => {
                                setMessage("Network error. Try again.");
                                submittedRef.current = false;
                                startScanner();
                            });
                    },
                    () => {}
                );
            } catch (err) {
                console.error("QR scanner error:", err);
                setMessage("Could not start camera. Please allow camera access.");
            }
        };

        startScanner();
        return () => {
            if (html5QrRef.current?.isScanning) {
                html5QrRef.current.stop().catch(() => {});
            }
            html5QrRef.current = null;
        };
    }, [roll]);

    return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-black relative" ref={containerRef}>
            <div id="qr-reader" className="w-full max-w-sm overflow-hidden rounded-lg [&_.qr-shadedRegion]:border-4 [&_.qr-shadedRegion]:border-brand-green" />
            {message && (
                <p className={`text-sm mt-4 px-4 text-center ${message.includes("successfully") ? "text-green-400" : "text-white/80"}`}>
                    {message}
                </p>
            )}
        </div>
    );
};

export default QRScanner;
