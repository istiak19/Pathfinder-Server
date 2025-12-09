import { prisma } from "../../shared/prisma";
import { AppError } from "../../errors/AppError";
import httpStatus from "http-status";
import { CreateUserPayload } from "./user.interface";
import bcrypt from "bcryptjs";
import { JwtPayload } from "jsonwebtoken";
import { FilterParams } from "../../../constants";
import calculatePagination, { IOptions } from "../../helpers/paginationHelper";
import { Prisma, Role, UserStatus } from "@prisma/client";
import { userSearchableFields } from "./user.constant";

const getAllUsers = async (token: JwtPayload, params: FilterParams, options: IOptions) => {
    const { page, limit, skip, sortBy, sortOrder } = calculatePagination(options)
    const { searchTerm, ...filterData } = params;

    const isExistUser = await prisma.user.findUnique({
        where: {
            email: token.email
        }
    });

    if (!isExistUser) {
        throw new AppError(httpStatus.BAD_REQUEST, "User not found");
    };

    const andConditions: Prisma.UserWhereInput[] = [];
    if (searchTerm) {
        andConditions.push({
            OR: userSearchableFields.map(field => ({
                [field]: {
                    contains: searchTerm,
                    mode: "insensitive"
                }
            }))
        })
    };

    if (Object.keys(filterData).length > 0) {
        andConditions.push({
            AND: Object.keys(filterData).map(key => ({
                [key]: {
                    equals: (filterData as any)[key]
                }
            }))
        })
    };

    const whereConditions: Prisma.UserWhereInput = andConditions.length > 0 ? {
        AND: andConditions
    } : {};

    const result = await prisma.user.findMany({
        skip,
        take: limit,
        where: whereConditions,
        orderBy: { [sortBy]: sortOrder }
    });

    const total = await prisma.user.count({ where: whereConditions });
    const totalPages = Math.ceil(total / limit);

    return {
        meta: { page, limit, total, totalPages },
        data: result
    };
};

const getSingleUser = async (token: JwtPayload, id: string) => {
    const isExistUser = await prisma.user.findUnique({
        where: {
            email: token.email
        }
    });

    if (!isExistUser) {
        throw new AppError(httpStatus.BAD_REQUEST, "User not found");
    }

    const user = await prisma.user.findUnique({
        where: { id }
    });

    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }

    // Role-based field filtering
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

    // Guide-specific fields only for GUIDE
    if (user.role === "GUIDE") {
        filteredUser.expertise = user.expertise;
        filteredUser.dailyRate = user.dailyRate;
    }

    // Tourist-specific fields only for TOURIST
    if (user.role === "TOURIST") {
        filteredUser.travelPreferences = user.travelPreferences;
    }

    // Admin → guide/tourist specific fields exclude
    // if (user.role === "ADMIN") {
    //    
    // }

    return filteredUser;
};

const createUser = async (payload: CreateUserPayload) => {
    const { email, password, ...rest } = payload;

    // const isExist = await prisma.user.findUnique({
    //     where: { email }
    // });

    // if (isExist) {
    //     throw new AppError(httpStatus.BAD_REQUEST, "A user with this email already exists.");
    // };

    const hashPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
        data: {
            email,
            password: hashPassword,
            ...rest
        }
    });

    return user;
};

const updateUserProfile = async (token: JwtPayload, payload: Partial<CreateUserPayload>) => {
    const existingUser = await prisma.user.findUnique({
        where: { email: token.email }
    });

    if (!existingUser) {
        throw new AppError(httpStatus.BAD_REQUEST, "User not found");
    }

    // Prevent updating restricted fields
    const forbiddenFields = [
        "role",
        "status",
        "authProvider",
        "providerId",
        "id",
        "email",
        "createdAt",
        "updatedAt",
    ];

    for (const field of forbiddenFields) {
        if (payload[field as keyof typeof payload] !== undefined) {
            delete payload[field as keyof typeof payload];
        }
    }

    // Password hashing
    if (payload.password) {
        payload.password = await bcrypt.hash(payload.password, 10);
    }

    // Role-based restrictions
    if (existingUser.role === "GUIDE") {
        // allowed → expertise, dailyRate
    } else {
        delete payload.expertise;
        delete payload.dailyRate;
    }

    if (existingUser.role === "TOURIST") {
        // allowed → travelPreferences
    } else {
        delete payload.travelPreferences;
    }

    // ADMIN → no guide/tourist fields
    if (existingUser.role === "ADMIN") {
        delete payload.expertise;
        delete payload.dailyRate;
        delete payload.travelPreferences;
    }

    // Convert dailyRate to integer if present
    if (payload.dailyRate !== undefined) {
        payload.dailyRate = payload.dailyRate
            ? parseInt(payload.dailyRate as unknown as string, 10)
            : undefined;
    }

    // Update user
    const updatedUser = await prisma.user.update({
        where: { email: token.email },
        data: payload,
    });

    return updatedUser;
};

const updateUserStatus = async (token: JwtPayload, userId: string, status: UserStatus) => {
    // Check if requester is ADMIN
    if (token.role !== Role.ADMIN) {
        throw new AppError(httpStatus.UNAUTHORIZED, "Only admin can update user status");
    }

    const isExistUser = await prisma.user.findUnique({
        where: { id: userId }
    });

    if (!isExistUser) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }

    // Only update status
    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { status }
    });

    return updatedUser;
};

const updateUserRole = async (token: JwtPayload, userId: string, newRole: Role) => {
    // Ensure requester is ADMIN
    if (token.role !== Role.ADMIN) {
        throw new AppError(httpStatus.UNAUTHORIZED, "Only admin can update user roles");
    }

    const isExistUser = await prisma.user.findUnique({
        where: { id: userId }
    });

    if (!isExistUser) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found");
    };

    // Prevent admin from changing own role
    if (token.role === isExistUser?.role) {
        throw new AppError(httpStatus.FORBIDDEN, "Admin cannot change their own role");
    };

    // Update user role
    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { role: newRole }
    });

    return updatedUser;
};

const deleteUser = async (token: JwtPayload, id: string) => {
    const isExistUser = await prisma.user.findUnique({
        where: {
            email: token.email
        }
    });

    if (!isExistUser) {
        throw new AppError(httpStatus.BAD_REQUEST, "User not found");
    };

    return await prisma.user.delete({
        where: { id },
    });
}

export const userService = {
    createUser,
    getAllUsers,
    getSingleUser,
    updateUserProfile,
    updateUserStatus,
    updateUserRole,
    deleteUser
};