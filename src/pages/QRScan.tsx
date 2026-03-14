import React, { useState } from 'react';
import Header from '../components/Header';
import { CheckCircle } from 'lucide-react';
import FaceScanner from '../components/FaceScanner';
import QRScanner from '../components/QRScanner';
import { useAuth } from '../context/AuthContext';

const QRScan: React.FC = () => {
    const { roll: loggedInRoll } = useAuth();
    const [step, setStep] = useState<'FACE_SCAN' | 'QR_SCAN' | 'SUCCESS'>('FACE_SCAN');
    const [rollNumber, setRollNumber] = useState<string | null>(null);

    const handleFaceSuccess = (roll: string) => {
        setRollNumber(roll);
        setStep('QR_SCAN');
    };

    const handleAttendanceMarked = () => {
        setStep('SUCCESS');
    };

    return (
        <div className="min-h-screen bg-brand-bg flex flex-col">
            <Header title="QR Attendance" showBack />

            <div className="flex-1 p-6 flex flex-col items-center">
                <h2 className="text-xl font-bold text-brand-text mb-6">
                    {step === 'FACE_SCAN' && 'Facial Verification'}
                    {step === 'QR_SCAN' && 'Scan QR Code'}
                    {step === 'SUCCESS' && 'Attendance Marked'}
                </h2>

                {/* Main Content Area */}
                <div className="w-full aspect-[3/4] max-w-sm bg-black rounded-2xl overflow-hidden relative shadow-2xl border-4 border-white">

                    {step === 'FACE_SCAN' && (
                        <FaceScanner onSuccess={handleFaceSuccess} loggedInRoll={loggedInRoll} />
                    )}

                    {step === 'QR_SCAN' && rollNumber && (
                        <QRScanner
                            roll={rollNumber}
                            onAttendanceMarked={handleAttendanceMarked}
                        />
                    )}

                    {step === 'SUCCESS' && (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-white p-6 text-center animate-fadeIn">
                            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
                                <CheckCircle size={64} className="text-green-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-brand-text mb-2">Success!</h3>
                            <p className="text-gray-600">Attendance marked successfully.</p>

                            <div className="mt-8 bg-brand-light-green p-4 rounded-xl w-full">
                                <p className="text-xs text-brand-green font-bold uppercase tracking-wider mb-1">Session</p>
                                <p className="font-semibold text-brand-text">Advanced Computer Networks</p>
                                <p className="text-sm text-brand-text/70">12:30 PM - 01:30 PM</p>
                            </div>
                        </div>
                    )}
                </div>

                {step !== 'SUCCESS' && (
                    <div className="mt-8 text-center max-w-xs">
                        <p className="text-xs text-gray-500">
                            Please ensure you are in a well-lit environment and look directly at the camera.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QRScan;
