import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login: React.FC = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [rollNumber, setRollNumber] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = rollNumber.trim();
        if (trimmed) {
            login(trimmed);
            navigate('/', { replace: true });
        }
    };

    return (
        <div className="min-h-screen bg-login-bg flex flex-col items-center justify-center px-6">
            <div className="w-full max-w-sm">
                {/* Logo and branding */}
                <div className="flex flex-col items-center mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 rounded-full bg-brand-teal flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-bold text-xl">G</span>
                        </div>
                        <div className="flex flex-col items-start">
                            <span className="text-brand-teal font-bold text-xl tracking-wide">GITAM</span>
                            <span className="text-brand-teal text-[0.65rem] uppercase tracking-wider">Deemed to be University</span>
                        </div>
                    </div>
                    <h1 className="text-xl font-bold text-black mt-4">My-GITAM</h1>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <input
                        type="text"
                        placeholder="Roll Number"
                        value={rollNumber}
                        onChange={(e) => setRollNumber(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-teal/30 focus:border-brand-teal"
                        required
                    />
                    <div className="relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-teal/30 focus:border-brand-teal pr-12"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-teal p-1"
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                    <button
                        type="submit"
                        className="w-full py-3 rounded-lg bg-brand-teal text-white font-semibold hover:bg-brand-teal/90 focus:outline-none focus:ring-2 focus:ring-brand-teal/50 transition-colors"
                    >
                        Sign In
                    </button>
                </form>

                <p className="text-center text-black text-sm mt-10">
                    Powered by <span className="text-brand-teal font-bold">CATS</span>
                </p>
            </div>
        </div>
    );
};

export default Login;
