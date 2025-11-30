import { prisma } from "../../shared/prisma";
import { AppError } from "../../errors/AppError";
import httpStatus from "http-status";
import { CreateUserPayload } from "./user.interface";
import bcrypt from "bcryptjs";
import { JwtPayload } from "jsonwebtoken";
import { FilterParams } from "../../../constants";
import calculatePagination, { IOptions } from "../../helpers/paginationHelper";
import { Prisma } from "@prisma/client";
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

    const users = await prisma.user.findMany({
        skip,
        take: limit,
        where: whereConditions,
        orderBy: { [sortBy]: sortOrder }
    });

    return users;
};

const getSingleUser = async (token: JwtPayload, id: string) => {
    const isExistUser = await prisma.user.findUnique({
        where: {
            email: token.email
        }
    });

    if (!isExistUser) {
        throw new AppError(httpStatus.BAD_REQUEST, "User not found");
    };

    const user = await prisma.user.findUnique({
        where: { id }
    });

    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }

    return user;
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

const updateUser = async (token: JwtPayload, id: string, payload: Partial<CreateUserPayload>) => {
    const isExistUser = await prisma.user.findUnique({
        where: {
            email: token.email
        }
    });

    if (!isExistUser) {
        throw new AppError(httpStatus.BAD_REQUEST, "User not found");
    };

    if (payload.password) {
        payload.password = await bcrypt.hash(payload.password, 10);
    }

    return await prisma.user.update({
        where: { id },
        data: payload,
    });
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
    updateUser,
    deleteUser
};