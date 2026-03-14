import React, { createContext, useContext, useState } from 'react';

const STORAGE_KEY = 'gitam_roll';

interface AuthContextType {
    roll: string | null;
    login: (roll: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

function getStoredRoll(): string | null {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored?.trim() || null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [roll, setRoll] = useState<string | null>(getStoredRoll);

    const login = (rollNumber: string) => {
        const trimmed = rollNumber.trim();
        if (trimmed) {
            setRoll(trimmed);
            localStorage.setItem(STORAGE_KEY, trimmed);
        }
    };

    const logout = () => {
        setRoll(null);
        localStorage.removeItem(STORAGE_KEY);
    };

    return (
        <AuthContext.Provider value={{ roll, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
