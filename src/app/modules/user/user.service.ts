import bcrypt from "bcryptjs";
import httpStatus from 'http-status';
import { prisma } from "../../shared/prisma";
import { AppError } from "../../errors/AppError";

const createUser = async (payload:any) => {
    const { email, password, ...rest } = payload;
    const isExist = await prisma.user.findUnique
    if (isExist) {
        throw new AppError(httpStatus.BAD_REQUEST, "A user with this email already exists.");
    };

    const hashPassword = await bcrypt.hash(password as string, 10);

    // const auth: IAuthProvider = {
    //     provider: "credentials",
    //     providerId: email as string
    // };

    const user = await prisma.user.create({
        email,
        password: hashPassword,
        ...rest
    });

    return user;
};

export const userService = {
    createUser
};