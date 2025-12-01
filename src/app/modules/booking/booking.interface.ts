export interface BookingData {
    id: string;
    date: string;
    status: "PENDING" | "CONFIRMED" | "CANCELLED" | "CONFIRMED";
    guests: number;
    listingId: string;
    touristId: string;
    paymentStatus: "UNPAID" | "PAID" | "FAILED" | "REFUNDED";
    paymentId: string | null;
    createdAt: string;
    updatedAt: string;
    listing: Listing;
    tourist: Tourist;
}

export interface Listing {
    id: string;
    title: string;
    description: string;
    itinerary?: string | null;
    price: number;
    duration: string;
    meetingPoint: string;
    maxGroupSize: number;
    category: string;
    city: string;
    images: string[];
    status: "Active" | "Inactive";
    guideId: string;
    createdAt: string;
    updatedAt: string;
}

export interface Tourist {
    id: string;
    name: string;
    email: string;
    password: string;
    role: "TOURIST" | "GUIDE" | "ADMIN";
    profilePic?: string | null;
    bio?: string;
    isVerified: boolean;
    status: string;
    languages: string[];
    expertise: string[];
    dailyRate?: number | null;
    authProvider?: string | null;
    providerId?: string | null;
    createdAt: string;
    updatedAt: string;
}