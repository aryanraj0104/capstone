import React, { useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

interface QRScannerProps {
    onScanSuccess: (decodedText: string) => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ onScanSuccess }) => {
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);

    useEffect(() => {
        // Initialize scanner
        // "reader" is the ID of the HTML element
        const scanner = new Html5QrcodeScanner(
            "reader",
            {
                fps: 10,
                qrbox: { width: 250, height: 250 },
                aspectRatio: 1.0,
                showTorchButtonIfSupported: true,
            },
            /* verbose= */ false
        );

        scannerRef.current = scanner;

        scanner.render(
            (decodedText) => {
                scanner.clear();
                onScanSuccess(decodedText);
            },
            () => {
                // parse error, ignore usually
                // console.log(errorMessage); 
            }
        );

        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(err => console.error("Failed to clear scanner", err));
            }
        };
    }, [onScanSuccess]);

    return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-black relative">
            <div id="reader" className="w-full max-w-sm overflow-hidden rounded-lg"></div>
            <p className="text-white/60 text-sm mt-4">Point at a QR Code</p>

            {/* Manual Override for Testing/Demo */}
            <button
                onClick={() => onScanSuccess("DEMO_QR_CODE_DATA")}
                className="absolute bottom-4 right-4 px-3 py-1 bg-white/20 text-white text-xs rounded-full hover:bg-white/40 z-50"
            >
                Simulate Scan
            </button>
        </div>
    );
};

export default QRScanner;
