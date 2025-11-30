import { prisma } from "../../shared/prisma";
import { AppError } from "../../errors/AppError";
import httpStatus from "http-status";
import { CreateUserPayload } from "./user.interface";
import bcrypt from "bcryptjs";
import { JwtPayload } from "jsonwebtoken";

const getAllUsers = async (token: JwtPayload) => {
    const isExistUser = await prisma.user.findUnique({
        where: {
            email: token.email
        }
    });

    if (!isExistUser) {
        throw new AppError(httpStatus.BAD_REQUEST, "User not found");
    };

    const users = await prisma.user.findMany();
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