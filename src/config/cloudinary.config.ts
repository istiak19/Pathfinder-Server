import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import stream from "stream";

// Cloudinary config
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer memory storage
export const multerUpload = multer({ storage: multer.memoryStorage() });

// Upload buffer to Cloudinary
export const uploadToCloudinary = (fileBuffer: Buffer, fileName: string) => {
    return new Promise<any>((resolve, reject) => {
        const bufferStream = new stream.PassThrough();
        bufferStream.end(fileBuffer);

        cloudinary.uploader.upload_stream(
            { public_id: fileName, folder: "uploads" },
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        ).end(fileBuffer);
    });
};