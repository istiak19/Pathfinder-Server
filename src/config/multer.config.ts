import { uploadToCloudinary } from "./cloudinary.config";

/**
 * Upload multiple files to Cloudinary and return array of URLs
 */
export const uploadMultipleFiles = async (files: Express.Multer.File[], folder: string = "uploads") => {
    const uploadPromises = files.map(file => {
        const uniqueFileName =
            Math.random().toString(36).substring(2) +
            "-" +
            Date.now() +
            "-" +
            file.originalname.replace(/\s+/g, "-").toLowerCase();

        return uploadToCloudinary(file.buffer, `${folder}/${uniqueFileName}`);
    });

    const results = await Promise.all(uploadPromises);
    return results.map((res: any) => res.secure_url);
};