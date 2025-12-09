import httpStatus from 'http-status';
import { AppError } from "../../errors/AppError";
import { prisma } from '../../shared/prisma';
import bcrypt from "bcryptjs";
import { JwtPayload } from 'jsonwebtoken';

const login = async (payload: { email: string, password: string }) => {
    if (!payload.email || !payload.password) {
        throw new AppError(httpStatus.BAD_REQUEST, "Email and password are required.");
    };

    const user = await prisma.user.findUnique({
        where: {
            email: payload.email
        },
    });

    if (!user || !user.password) {
        throw new AppError(httpStatus.UNAUTHORIZED, "Invalid credentials.");
    };

    const isMatch = await bcrypt.compare(payload.password, user.password);

    if (!isMatch) {
        throw new AppError(httpStatus.UNAUTHORIZED, "Incorrect password.");
    };

    return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
    };
};

const getMeUser = async (token: JwtPayload) => {
    const user = await prisma.user.findUnique({
        where: {
            email: token.email
        }
    });

    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }

    // Base fields
    let filteredUser: any = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePic: user.profilePic,
        bio: user.bio,
        languages: user.languages,
        isVerified: user.isVerified,
        status: user.status,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    };

    // GUIDE-specific
    if (user.role === "GUIDE") {
        filteredUser.expertise = user.expertise;
        filteredUser.dailyRate = user.dailyRate;
    }

    // TOURIST-specific
    if (user.role === "TOURIST") {
        filteredUser.travelPreferences = user.travelPreferences;
    }

    // ADMIN → no guide/tourist extra fields added

    return filteredUser;
};

export const authService = {
    login,
    getMeUser
};