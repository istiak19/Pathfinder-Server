import { z } from "zod";

export const createListingZodSchema = z.object({
    title: z.string().min(1, { message: "Title is required" }),
    description: z.string().min(1, { message: "Description is required" }),
    itinerary: z.string().optional(),
    price: z.number({ message: "Price must be a number" }),
    duration: z.string().min(1, { message: "Duration is required" }),
    meetingPoint: z.string().min(1, { message: "Meeting point is required" }),
    maxGroupSize: z.number({ message: "Max group size must be a number" }),
    city: z.string().min(1, { message: "City is required" }),
    category: z.string().min(1, { message: "Category is required" }),
    guideId: z.string().min(1, { message: "Guide ID is required" }),
    status: z.string().optional(),

    images: z.array(z.string().url({ message: "Each image must be a valid URL" })).optional(),
});

export const updateListingZodSchema = z.object({
    title: z.string().min(1, { message: "Title is required" }).optional(),
    description: z.string().min(1, { message: "Description is required" }).optional(),
    itinerary: z.string().optional(),
    price: z.number({ message: "Price must be a number" }).optional(),
    duration: z.string().min(1, { message: "Duration is required" }).optional(),
    meetingPoint: z.string().min(1, { message: "Meeting point is required" }).optional(),
    maxGroupSize: z.number({ message: "Max group size must be a number" }).optional(),
    city: z.string().min(1, { message: "City is required" }).optional(),
    category: z.string().min(1, { message: "Category is required" }).optional(),
    guideId: z.string().min(1, { message: "Guide ID is required" }).optional(),
    status: z.string().optional(),

    images: z.array(z.string().url({ message: "Each image must be a valid URL" })).optional(),
});