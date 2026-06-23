import axios from "axios";
import { useAuthStore } from "@/store/auth-store";

const CHAT_API_BASE_URL = (process.env.NEXT_PUBLIC_CHAT_API_URL || '') + '/api/v1';
const MAIN_API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || '') + '/api/v1';

export const chatApiClient = axios.create({
    baseURL: CHAT_API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
        accept: "*/*",
    },
});

// Interceptor for adding Authorization header
chatApiClient.interceptors.request.use((config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Flag to prevent multiple refresh calls (shared context within this file)
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// Interceptor for handling token expiration
chatApiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return chatApiClient(originalRequest);
                    })
                    .catch((err) => {
                        return Promise.reject(err);
                    });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const refreshToken = useAuthStore.getState().refreshToken;

            if (!refreshToken) {
                useAuthStore.getState().logout();
                window.location.href = "/auth/login";
                return Promise.reject(error);
            }

            try {
                // We always hit the MAIN API BASE URL for token refresh
                const { data } = await axios.post(`${MAIN_API_BASE_URL}/auth/refresh`, {
                    refreshToken,
                });

                const { accessToken: newAccessToken, refreshToken: newRefreshToken } = data.data;

                useAuthStore.getState().setTokens(newAccessToken, newRefreshToken);

                chatApiClient.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

                processQueue(null, newAccessToken);
                isRefreshing = false;

                return chatApiClient(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                isRefreshing = false;
                useAuthStore.getState().logout();
                window.location.href = "/auth/login";
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);
