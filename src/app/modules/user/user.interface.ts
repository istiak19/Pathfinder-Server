export interface CreateUserPayload {
    name: string;
    email: string;
    password: string;
    role?: "TOURIST" | "GUIDE" | "ADMIN";
    profilePic?: string;
    bio?: string;
    languages?: string[];
    expertise?: string[];
    dailyRate?: number;
};