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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initializeAuth = async () => {
            const token = localStorage.getItem("accessToken") || '';
            if (token) {
                console.log("AuthProvider - Token found, validating...");
                await validateToken(token);
            } else {
                console.log("AuthProvider - No token found",token);
                setIsLoading(false);
            }
        };

        initializeAuth();

        // Set up axios interceptor to include the token in all requests
        axios.interceptors.request.use((config) => {
            const token = localStorage.getItem("accessToken");
            if (token) {
                config.headers["Authorization"] = `Bearer ${token}`;
            }
            return config;
        });
    }, []);

    const logout = async () => {
        try {
            await axios.post(`${domain}/api/v1/general/logout`, null, {
                withCredentials: true
            });
            setUser(null);
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
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
        const refreshToken = localStorage.getItem("refreshToken") || '';
        if (!refreshToken) {
            logout();
            return;
        }

        try {
            const response = await axios.post(`${domain}/api/v1/general/refresh-token`, null, {
                headers: { Authorization: `Bearer ${refreshToken}` },
                withCredentials: true
            });
            
            console.log(response);
            if (response.status === 200 && response.data.newaccessToken && response.data.newrefreshToken) {
                localStorage.setItem("accessToken", response.data.newaccessToken);
                localStorage.setItem("refreshToken", response.data.newrefreshToken);
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