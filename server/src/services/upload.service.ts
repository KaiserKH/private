import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";
import { env } from "../config/env.js";

const configured = Boolean(env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET);

if (configured) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true
  });
}

export const uploadBuffer = async (buffer: Buffer, folder: string, mimeType?: string) => {
  if (!configured) {
    return { url: `data:${mimeType ?? "application/octet-stream"};base64,${buffer.toString("base64")}`, publicId: null };
  }

  return new Promise<{ url: string; publicId: string }>((resolve, reject) => {
    const upload = cloudinary.uploader.upload_stream({ folder, resource_type: "auto" }, (error, result) => {
      if (error || !result) return reject(error ?? new Error("Upload failed"));
      resolve({ url: result.secure_url, publicId: result.public_id });
    });

    Readable.from(buffer).pipe(upload);
  });
};
