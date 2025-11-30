import httpStatus from 'http-status';
import { Request, Response } from 'express';
import { catchAsync } from '../../shared/catchAsync';
import { userService } from './user.service';
import sendResponse from '../../shared/sendResponse';
import { JwtPayload } from 'jsonwebtoken';

const createUser = catchAsync(async (req, res) => {
    const user = await userService.createUser(req.body);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "User created successfully",
        data: user
    });
});

const getAllUsers = catchAsync(async (req, res) => {
    const decodedToken = req.user as JwtPayload;
    const users = await userService.getAllUsers(decodedToken);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Users fetched successfully",
        data: users
    });
});

const getSingleUser = catchAsync(async (req, res) => {
    const decodedToken = req.user as JwtPayload;
    const user = await userService.getSingleUser(decodedToken, req.params.id);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "User fetched successfully",
        data: user
    });
});

export const userController = {
    createUser,
    getAllUsers,
    getSingleUser
};