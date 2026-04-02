import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { v2 as cloudinary } from "cloudinary";

@Injectable()
export class CloudinaryService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async uploadAvatar(file: Express.Multer.File, userId: number) {
    try {
      const result = await new Promise<{ secure_url: string }>(
        (resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: "messenger/avatars",
              public_id: `user-${userId}-${Date.now()}`,
              overwrite: true,
              resource_type: "image",
            },
            (error, result) => {
              if (error) {
                reject(error);
                return;
              }

              if (!result) {
                reject(new Error("Cloudinary result is empty"));
                return;
              }

              resolve({ secure_url: result.secure_url });
            },
          );

          stream.end(file.buffer);
        },
      );

      return result.secure_url;
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      throw new InternalServerErrorException("Ошибка загрузки в Cloudinary");
    }
  }
}
