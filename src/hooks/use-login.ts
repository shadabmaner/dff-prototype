import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useAuthStore } from "@/store/auth-store";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LoginCredentials, LoginResponse } from "@/types/auth";
import { initFCM } from "@/hooks/use-fcm";
import { clearSharedQueryClient } from "@/components/providers/query-provider";

export function useLogin(redirectTo: string = "/dashboard") {
    const router = useRouter();
    const setAuth = useAuthStore((state) => state.setAuth);

    return useMutation({
        mutationFn: async (credentials: LoginCredentials) => {
            const { data } = await apiClient.post<LoginResponse>(
                "/auth/login-email",
                credentials
            );
            return data;
        },
        onSuccess: (response) => {
            if (response.success) {
                clearSharedQueryClient();
                if (typeof window !== "undefined") {
                    sessionStorage.clear();
                }
                setAuth({
                    user: response.data.user,
                    accessToken: response.data.accessToken,
                    refreshToken: response.data.refreshToken,
                });
                toast.success("Login successful!", {
                    description: `Welcome back, ${response.data.user.email}`,
                });

                // Register FCM token so push notifications reach this device
                initFCM().catch(console.warn);
                
                // Role-based redirection
                const userRole = response.data.user.user_type;
                let target = redirectTo;
                
                // If no specific redirect or redirect is generic dashboard, use role-based dashboard
                if (!target || target === "/dashboard") {
                    switch (userRole) {
                        case "sales":
                            target = "/dashboard/sales/dashboard";
                            break;
                        case "marketing":
                            target = "/dashboard/marketing/dashboard";
                            break;
                        case "doctor":
                            target = "/dashboard/doctor/dashboard";
                            break;
                        case "dietitian":
                            target = "/dashboard/dietitian/dashboard";
                            break;
                        case "physio":
                            target = "/dashboard/physio/dashboard";
                            break;
                        case "pharmacist":
                            target = "/dashboard/pharmacy/medication-master";
                            break;
                        case "fitness_coach":
                            target = "/dashboard/fitness-coach/dashboard";
                            break;
                        case "finance":
                            target = "/dashboard/finance/dashboard";
                            break;
                        case "service_operations":
                            target = "/dashboard/service/dashboard";
                            break;
                        case "tele_caller":
                            target = "/dashboard/telecaller";
                            break;
                        case "admin":
                            target = "/dashboard/admin/dashboard";
                            break;
                        case "superadmin":
                            target = "/dashboard/super-admin/dashboard";
                            break;
                        default:
                            // Fallback for unknown roles - redirect to auth login
                            console.warn(`Unknown user role: ${userRole}`);
                            target = "/auth/login";
                    }
                } else {
                    // Use the specific callbackUrl if provided
                    target = redirectTo?.startsWith("/") ? redirectTo : "/dashboard";
                }
                
                router.push(target);
            } else {
                const message = response.message || "Invalid email or password";
                toast.error(message);
                throw new Error(message);
            }
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || "Something went wrong. Please try again.";
            toast.error("Login Error", {
                description: message,
            });
            throw error;
        },
    });
}
