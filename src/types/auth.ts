export interface User {
    id: string;
    email: string;
    phone: string;
    user_type: string;
    is_active: boolean;
    is_verified: boolean;
    profile_photo_url: string | null;
    last_login_at: string;
    device_token: string | null;
    preferred_language: string;
    created_at: string;
    updated_at: string;
}

export interface LoginResponse {
    success: boolean;
    statusCode: number;
    message: string;
    data: {
        accessToken: string;
        refreshToken: string;
        user: User;
    };
}

export interface LoginCredentials {
    email: string;
    password: string;
}
