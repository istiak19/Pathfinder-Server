declare module "multer-storage-cloudinary" {
  import { StorageEngine } from "multer";

  interface StorageOptions {
    cloudinary: any;
    params?: any | ((req: any, file: any) => any | Promise<any>);
  }

  export default class CloudinaryStorage implements StorageEngine {
    constructor(options: StorageOptions);
    _handleFile(req: any, file: any, cb: (err?: any, info?: any) => void): void;
    _removeFile(req: any, file: any, cb: (err?: any) => void): void;
  }
}