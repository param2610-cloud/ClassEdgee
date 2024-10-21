import { domain } from "@/lib/constant";
import axios, { AxiosError } from "axios";
import React, { createContext, useState, useContext, useEffect } from "react";

interface User {
    username: string;
    role: 'supreme' | 'staff' | 'principal' | 'faculty' | 'student' | 'coordinator';
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    logout: () => void;
    reinitializeAuth: () => void;
}

// Create a custom event name
const AUTH_REVALIDATE_EVENT = 'auth-revalidate';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const enhancedLocalStorage = {
    setItem: (key: string, value: string) => {
        localStorage.setItem(key, value);
        if (key === 'accessToken' || key === 'refreshToken') {
            window.dispatchEvent(new CustomEvent(AUTH_REVALIDATE_EVENT));
        }
    },
    removeItem: (key: string) => {
        localStorage.removeItem(key);
    },
    getItem: (key: string) => localStorage.getItem(key),
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const initializeAuth = async () => {
        const token = enhancedLocalStorage.getItem("accessToken");
        if (token) {
            console.log("AuthProvider - Token found, validating...");
            await validateToken(token);
        } else {
            console.log("AuthProvider - No token found");
            setIsLoading(false);
        }
    };

    useEffect(() => {
        initializeAuth();

        const handleRevalidate = () => {
            console.log("AuthProvider - Revalidation triggered");
            initializeAuth();
        };

        window.addEventListener(AUTH_REVALIDATE_EVENT, handleRevalidate);

        return () => {
            window.removeEventListener(AUTH_REVALIDATE_EVENT, handleRevalidate);
        };
    }, []);

    const logout = async () => {
        const accessToken = enhancedLocalStorage.getItem("accessToken");
        if (accessToken) {
            try {
                await axios.post(`${domain}/api/v1/general/logout`, null, {
                    headers: { Authorization: `Bearer ${accessToken}` },
                    withCredentials: true
                });
            } catch (error) {
                console.error("Logout error:", error);
            }
        }
        setUser(null);
        enhancedLocalStorage.removeItem("accessToken");
        enhancedLocalStorage.removeItem("refreshToken");
        setIsLoading(false);
    };
    const validateToken = async (token: string) => {
        try {
            const response = await axios.get(`${domain}/api/v1/general/validate-token`, {
                headers: { Authorization: `Bearer ${token}` },
                withCredentials: true
            });
            
            if (response.status === 200 && response.data.user) {
                setUser(response.data.user);
                setIsLoading(false);
            } else {
                throw new Error("Invalid token response");
            }
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 401) {
                await refreshToken();
            } else {
                console.error("Token validation error:", error);
                logout();
            }
        }
    };

    const refreshToken = async () => {
        const refreshToken = enhancedLocalStorage.getItem("refreshToken");
        if (!refreshToken) {
            logout();
            return;
        }
    
        try {
            const response = await axios.post(`${domain}/api/v1/general/refresh-token`, null, {
                headers: { Authorization: `Bearer ${refreshToken}` },
                withCredentials: true
            });
            
            if (response.status === 200 && response.data.accessToken && response.data.refreshToken) {
                enhancedLocalStorage.setItem("accessToken", response.data.accessToken);
                enhancedLocalStorage.setItem("refreshToken", response.data.refreshToken);
                await validateToken(response.data.accessToken);
            } else {
                throw new Error("Invalid refresh token response");
            }
        } catch (error) {
            console.error("Token refresh error:", error);
            logout();
        }
    };

    const contextValue: AuthContextType = {
        user,
        isLoading,
        logout,
        reinitializeAuth: initializeAuth,
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};