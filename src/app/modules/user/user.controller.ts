import httpStatus from 'http-status';
import { Request, Response } from 'express';
import { catchAsync } from '../../shared/catchAsync';
import { userService } from './user.service';
import sendResponse from '../../shared/sendResponse';
import { JwtPayload } from 'jsonwebtoken';
import pick from '../../helpers/pick';
import { userFilterableFields } from './user.constant';
import { uploadToCloudinary } from '../../../config/cloudinary.config';

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
    const filters = pick(req.query, userFilterableFields) // searching , filtering
    const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]) // pagination and sorting
    const result = await userService.getAllUsers(decodedToken, filters, options);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Users fetched successfully",
        meta: result.meta,
        data: result.data,
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

const updateUserProfile = catchAsync(async (req, res) => {
    const decoded = req.user as JwtPayload;
    let profilePic: string | undefined;

    if (req.file) {
        // Create a unique file name
        const fileName =
            Math.random().toString(36).substring(2) +
            "-" +
            Date.now() +
            "-" +
            req.file.originalname.replace(/\s+/g, "-").toLowerCase();

        // Upload to Cloudinary
        const cloudRes: any = await uploadToCloudinary(req.file.buffer, fileName);
        profilePic = cloudRes.secure_url;
    }

    let bodyData: any = req.body;
    if (req.body.data) {
        bodyData = JSON.parse(req.body.data);
    }

    const payload = {
        profilePic,
        ...bodyData,
    };

    const user = await userService.updateUserProfile(decoded, payload);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "User updated successfully",
        data: user,
    });
});

const updateUserStatus = catchAsync(async (req, res) => {
    const decoded = req.user as JwtPayload;
    const user = await userService.updateUserStatus(decoded, req.params.id, req.body.status);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "User status updated successfully",
        data: user,
    });
});

const updateUserRole = catchAsync(async (req, res) => {
    const decoded = req.user as JwtPayload;

    const result = await userService.updateUserRole(decoded, req.params.id, req.body.role);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "User role updated successfully",
        data: result,
    });
});

const deleteUser = catchAsync(async (req, res) => {
    const decoded = req.user as JwtPayload;
    await userService.deleteUser(decoded, req.params.id);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "User deleted successfully",
        data: null,
    });
});

export const userController = {
    createUser,
    getAllUsers,
    getSingleUser,
    updateUserProfile,
    updateUserStatus,
    updateUserRole,
    deleteUser
};