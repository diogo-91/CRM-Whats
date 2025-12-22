import React, { createContext, useContext, useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

interface User {
    id: string;
    name: string;
    email: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    socket: Socket | null;
    login: (token: string, user: User) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// URL do Backend
const API_URL = import.meta.env.PROD ? window.location.origin : 'http://localhost:3001';

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        // Carregar do localStorage ao iniciar
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
        }
    }, []);

    // Conectar Socket quando houver token
    useEffect(() => {
        if (token && !socket) {
            const newSocket = io(API_URL, {
                reconnectionAttempts: 3,
                timeout: 2000,
                query: { token: token } // Enviar token no query se necessário
            });
            setSocket(newSocket);

            return () => {
                newSocket.disconnect();
                setSocket(null);
            }
        } else if (!token && socket) {
            socket.disconnect();
            setSocket(null);
        }
    }, [token]);

    const login = (newToken: string, newUser: User) => {
        setToken(newToken);
        setUser(newUser);
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(newUser));
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ user, token, socket, login, logout, isAuthenticated: !!token }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
