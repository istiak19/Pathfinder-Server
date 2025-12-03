export interface CreateUserPayload {
    name: string;
    email: string;
    password: string;
    role?: "TOURIST" | "GUIDE" | "ADMIN";
    profilePic?: string;
    bio?: string;
    languages?: string[];
    travelPreferences?: string[];
    expertise?: string[];
    dailyRate?: number;
};