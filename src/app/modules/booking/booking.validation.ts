import { z } from "zod";

export const createBookingZodSchema = z.object({
    listingId: z.string().uuid({ message: "Listing ID invalid" }),
    date: z.string().datetime({ message: "Date is invalid" }),
    guests: z.number({ message: "Min must be a number" }).optional(),
});

export const updateBookingStatusZodSchema = z.object({
    status: z.enum(["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"], {
        message: "Invalid booking status"
    }),
});