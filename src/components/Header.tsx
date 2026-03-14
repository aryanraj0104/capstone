import React from 'react';
import { ArrowLeft, LogOut } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
    title?: string;
    showProfile?: boolean;
    showBack?: boolean;
}

const Header: React.FC<HeaderProps> = ({ title, showBack = false }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { roll, logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/login', { replace: true });
    };

    // If we are on dashboard, show the main header style
    // If we are on a sub-page, show the sub-header style (solid green)

    const isDashboard = location.pathname === '/';

    if (isDashboard) {
        return (
            <div className="bg-brand-green text-white p-4 pb-12 rounded-b-[2rem] shadow-lg relative z-10">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2">
                        {/* Simple Logo Placeholder */}
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
                                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                            </svg>
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold text-lg tracking-wide">GITAM</span>
                            <span className="text-[0.6rem] uppercase tracking-wider opacity-80">Deemed to be University</span>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-brand-green shadow-md"
                        aria-label="Log out"
                    >
                        <LogOut size={20} className="transform rotate-180" />
                    </button>
                </div>

                {/* Profile Card Floating - Positioned Absolute usually, but here part of header for flow */}
                <div className="bg-white text-brand-text p-4 rounded-xl shadow-md mx-1 flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden border-2 border-brand-green/10">
                        {/* Placeholder for User Image */}
                        <img
                            src="https://api.dicebear.com/9.x/dylan/svg?seed=Milo"
                            alt="Profile"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="flex-1">
                        <h2 className="font-bold text-lg text-brand-green leading-tight">{roll ?? 'Student'}</h2>
                        <p className="text-sm font-semibold text-brand-green/80">{roll ?? '—'}</p>
                        <p className="text-xs text-brand-green/60 font-medium">GIT, VSP</p>
                    </div>
                </div>
            </div>
        );
    }

    // Sub-header for other pages
    return (
        <div className="bg-brand-green text-white p-4 shadow-md sticky top-0 z-50">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    {showBack && (
                        <button
                            onClick={() => navigate(-1)}
                            className="w-8 h-8 flex items-center justify-center bg-white/20 rounded-full hover:bg-white/30 transition-colors"
                        >
                            <ArrowLeft size={20} />
                        </button>
                    )}
                    <h1 className="text-xl font-medium">{title}</h1>
                </div>
                <div className="w-9 h-9 rounded-full bg-gray-200 overflow-hidden border border-white/50">
                    <img
                        src="https://api.dicebear.com/7.x/avataaars/svg?seed=Jithendra"
                        alt="Profile"
                        className="w-full h-full object-cover"
                    />
                </div>
            </div>
        </div>
    );
};

export default Header;
