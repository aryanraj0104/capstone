import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    CreditCard,
    Fingerprint,
    GraduationCap,
    Calendar,
    FileText,
    CalendarDays,
    QrCode,
    Bell,
    Phone,
    Headphones
} from 'lucide-react';
import Header from '../components/Header';

interface MenuOption {
    icon: React.ReactNode;
    label: string;
    path?: string;
    color?: string; // Optional custom color for icon
}

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const videoRef = useRef<HTMLVideoElement>(null);
    const [message, setMessage] = useState('');

    const menuOptions: MenuOption[] = [
        { icon: <CreditCard size={28} />, label: 'Digital ID', path: '/digital-id' },
        { icon: <Fingerprint size={28} />, label: 'Attendance' },
        { icon: <GraduationCap size={28} />, label: 'Academic Track' },
        { icon: <Calendar size={28} />, label: 'Time Table' },
        { icon: <FileText size={28} />, label: 'Fee' },
        { icon: <CalendarDays size={28} />, label: 'Events' },
        { icon: <QrCode size={28} />, label: 'QR Scan', path: '/qr-scan' }, // Primary Action
        { icon: <Bell size={28} />, label: 'G-Comms' },
        { icon: <Phone size={28} className="text-red-500" />, label: 'SoS', color: 'bg-red-50' }, // SOS has different style
        { icon: <Headphones size={28} />, label: 'Helpdesk' },
    ];

    const startCamera = async () => {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play();
            }
        }
    };

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
                    } catch (error) {
                        setMessage('Verification failed. Please try again.');
                    }
                }
            }
        }
    };

    return (
        <div className="min-h-screen bg-brand-bg pb-10">
            <Header />

            <main className="px-6 mt-6">
                <div className="bg-white rounded-3xl p-6 shadow-sm grid grid-cols-4 gap-y-8 gap-x-2">
                    {menuOptions.map((option, index) => (
                        <div
                            key={index}
                            className="flex flex-col items-center gap-2 cursor-pointer transition-transform active:scale-95"
                            onClick={() => option.path && navigate(option.path)}
                        >
                            <div className={`w-14 h-14 rounded-full flex items-center justify-center border border-brand-green/20 ${option.color || 'bg-brand-green/5 text-brand-green'}`}>
                                {option.icon}
                            </div>
                            <span className="text-[0.7rem] font-bold text-center text-gray-700 leading-tight max-w-[4rem]">
                                {option.label}
                            </span>
                        </div>
                    ))}
                </div>
            </main>

            <footer className="mt-12 text-center">
                <p className="text-gray-300 font-bold tracking-widest text-sm uppercase">Powered by CATS</p>
            </footer>

        </div>
    );
};

export default Dashboard;
