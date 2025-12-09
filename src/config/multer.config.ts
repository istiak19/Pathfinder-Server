import multer from "multer";
import { cloudinaryUpload } from "./cloudinary.config";
import { CloudinaryStorage } from "multer-storage-cloudinary";

const storage = new CloudinaryStorage({
    cloudinary: cloudinaryUpload,
    params: {
        public_id: (req, file) => {
            // const fileName = file.originalname
            //     .toLowerCase()
            //     .replace(/\s+/g, "-")  // empty space remove replace with dash
            //     .replace(/\./g, "-")
            //     // eslint-disable-next-line no-useless-escape
            //     .replace(/[^a-z0-9\-\.]/g, "") // non alpha numeric - !@#$
            // // const extension = file.originalname.split(".").pop();
            // const uniqueFileName = Math.random().toString(36).substring(2) + "-" + Date.now() + "-" + fileName;
            // return uniqueFileName;

            // way-2
            const originalName = file.originalname;

            // Remove .png or .jpg extension from the end
            const cleanedName = originalName.replace(/\.(png|jpg)$/i, "");

            // Format the cleaned name: lowercase, replace spaces with "-", remove special characters
            const fileName = cleanedName
                .toLowerCase()
                .replace(/\s+/g, "-")              // Replace spaces with dash
                .replace(/\./g, "-")               // Replace dots with dash
                // eslint-disable-next-line no-useless-escape
                .replace(/[^a-z0-9\-]/g, "");      // Remove non-alphanumeric/dash

            const uniqueFileName = Math.random().toString(36).substring(2) + "-" + Date.now() + "-" + fileName;

            return uniqueFileName;
        }
    }
});

export const multerUpload = multer({ storage: storage });