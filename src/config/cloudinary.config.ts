/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import stream from "stream";
import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import { AppError } from '../app/errors/AppError';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

export const uploadInvoiceToCloudinary = async (buffer: Buffer, fileName: string): Promise<UploadApiResponse | undefined> => {
    try {
        return new Promise((resolve, reject) => {
            const public_id = `pdf/${fileName}-${Date.now()}`;
            const bufferStream = new stream.PassThrough();
            bufferStream.end(buffer);
            cloudinary.uploader.upload_stream({
                resource_type: "auto",
                public_id: public_id,
                folder: "pdf"
            },
                (error, result) => {
                    if (error) {
                        return reject(error)
                    }
                    resolve(result)
                }
            ).end(buffer)
        })
    } catch (error: any) {
        console.log(error);
        throw new AppError(httpStatus.BAD_REQUEST, `Error uploading file ${error.message}`);
    }
};

export const deleteImageFromCLoudinary = async (url: string) => {
    try {
        // https://res.cloudinary.com/dtqtvdnuo/image/upload/v1753245642/oreu3b2g21a-1753245635105-rangpurtown.jpg
        const regex = /\/v\d+\/(.*?)\.(jpg|jpeg|png|gif|webp)$/i;
        const match = url.match(regex);
        if (match && match[1]) {
            const public_id = match[1];
            await cloudinary.uploader.destroy(public_id)
            console.log(`File ${public_id} is deleted from cloudinary`);
        };
    } catch (error: any) {
        throw new AppError(401, "Cloudinary image deletion failed", error.message);
    }
};

export const cloudinaryUpload = cloudinary;