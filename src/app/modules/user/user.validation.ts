import { z } from "zod";

export const createUserZodSchema = z.object({
    name: z.string().min(1, { message: "Name is required" }),
    email: z.string().email({ message: "Invalid email format" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters" }),
    role: z.enum(["ADMIN", "TOURIST", "GUIDE"]).optional(),
    profilePic: z.string().nullable().optional(),
    bio: z.string().nullable().optional(),
    languages: z.array(z.string()).min(1, { message: "At least one language is required" }),
    expertise: z.array(z.string()).optional(),
    dailyRate: z.number().optional(),
});

export const updateUserZodSchema = z.object({
    name: z.string().optional(),
    email: z.string().email({ message: "Invalid email format" }).optional(),
    password: z.string().min(6, { message: "Password must be at least 6 characters" }).optional(),
    role: z.enum(["ADMIN", "TOURIST", "GUIDE"]).optional(),
    profilePic: z.string().nullable().optional(),
    bio: z.string().nullable().optional(),
    languages: z.array(z.string()).optional(),
    expertise: z.array(z.string()).optional(),
    dailyRate: z.number().optional(),
});