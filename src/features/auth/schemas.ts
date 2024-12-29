import { z } from "zod";

export const loginSchema = z.object({
    email: z.string().trim().min(1, "Email is required.").email(),
    password: z.string().trim().min(1, "Password is required."),
});

export const registerSchema = z.object({
    name: z.string().trim().min(1, "Name is required"),
    email: z.string().trim().min(1, "Email is required.").email(),
    password: z
        .string()
        .trim()
        .min(1, "Password is required.")
        .min(8, "Password should be of at least 8 characters."),
});