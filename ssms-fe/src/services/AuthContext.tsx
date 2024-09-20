import { domain } from "@/lib/constant";
import axios, { AxiosError } from "axios";
import React, { createContext, useState, useContext, useEffect } from "react";

interface User {
    userid: string;
    role: 'supreme' | 'staff' | 'principal' | 'faculty' | 'student';
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
        const token = enhancedLocalStorage.getItem("accessToken") || '';
        if (token) {
            console.log("AuthProvider - Token found, validating...");
            await validateToken(token);
        } else {
            console.log("AuthProvider - No token found", token);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        initializeAuth();

        // Set up event listener for revalidation
        const handleRevalidate = () => {
            console.log("AuthProvider - Revalidation triggered");
            initializeAuth();
        };

        window.addEventListener(AUTH_REVALIDATE_EVENT, handleRevalidate);

        // Set up axios interceptor to include the token in all requests
        const interceptor = axios.interceptors.request.use((config) => {
            const token = enhancedLocalStorage.getItem("accessToken");
            if (token) {
                config.headers["Authorization"] = `Bearer ${token}`;
            }
            return config;
        });

        // Cleanup function
        return () => {
            window.removeEventListener(AUTH_REVALIDATE_EVENT, handleRevalidate);
            axios.interceptors.request.eject(interceptor);
        };
    }, []);

    const logout = async () => {
        try {
            await axios.post(`${domain}/api/v1/general/logout`, null, {
                withCredentials: true
            });
            setUser(null);
            enhancedLocalStorage.removeItem("accessToken");
            enhancedLocalStorage.removeItem("refreshToken");
            setIsLoading(false);
        } catch (error) {
            console.error("AuthProvider - Logout error:", error);
        }
    };

    const validateToken = async (token: string) => {
        try {
            console.log("AuthProvider - Validating token...");
            const response = await axios.get(`${domain}/api/v1/general/validate-token`, {
                headers: { Authorization: `Bearer ${token}` },
                withCredentials: true
            });
            console.log("AuthProvider - Token validation response:", response);
            
            if (response.status === 200 && response.data.user) {
                console.log("AuthProvider - Token validated successfully");
                setUser(response.data.user);
                setIsLoading(false);
            } else {
                console.log("AuthProvider - Invalid token response, attempting refresh");
                await refreshToken();
            }
        } catch (error) {
            console.error("AuthProvider - Token validation error:", error);
            await refreshToken();
        }
    };

    const refreshToken = async () => {
        const refreshToken = enhancedLocalStorage.getItem("refreshToken") || '';
        if (!refreshToken) {
            logout();
            return;
        }

        try {
            const response = await axios.post(`${domain}/api/v1/general/refresh-token`, null, {
                headers: { Authorization: `Bearer ${refreshToken}` },
                withCredentials: true
            });
            
            if (response.status === 200 && response.data.newaccessToken && response.data.newrefreshToken) {
                enhancedLocalStorage.setItem("accessToken", response.data.newaccessToken);
                enhancedLocalStorage.setItem("refreshToken", response.data.newrefreshToken);
                setUser(response.data.user);
            } else {
                throw new Error("Invalid refresh token response");
            }
        } catch (error) {
            console.error("Token refresh error:", error);
            logout();
        } finally {
            setIsLoading(false);
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