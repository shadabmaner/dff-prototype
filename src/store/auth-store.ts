import { create } from "zustand";
import { persist, createJSONStorage, PersistOptions } from "zustand/middleware";
import { User } from "@/types/auth";

interface AuthState {
    user: User | null|any;
    accessToken: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    setAuth: (data: { user: User; accessToken: string; refreshToken: string }) => void;
    setTokens: (accessToken: string, refreshToken: string) => void;
    logout: () => void;
    clearStorage: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            setAuth: (data) =>
                set({
                    user: data.user,
                    accessToken: data.accessToken,
                    refreshToken: data.refreshToken,
                    isAuthenticated: true,
                }),
            setTokens: (accessToken: string, refreshToken: string) =>
                set({
                    accessToken,
                    refreshToken,
                }),
            logout: () => {
                const clearStorage = get().clearStorage;
                clearStorage();
                set({
                    user: null,
                    accessToken: null,
                    refreshToken: null,
                    isAuthenticated: false,
                });
            },
            clearStorage: () => {
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('auth-storage');
                }
            },
        }),
        {
            name: "auth-storage",
            storage: createJSONStorage(() => localStorage),
        }
    )
);
