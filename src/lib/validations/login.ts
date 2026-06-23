import { z } from "zod";

export const loginSchema = z.object({
    email: z
        .string()
        .email("Please enter a valid email address")
        .max(254, "Email must be 254 characters or fewer"),
    password: z
        .string()
        .min(6, "Password must be at least 6 characters")
        .max(64, "Password must be 64 characters or fewer"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
