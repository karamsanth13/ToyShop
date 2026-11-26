import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function uploadImage(buffer, folder = "toyshop/shop") {
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    const error = new Error("Cloudinary is not configured.");
    error.status = 503;
    throw error;
  }
  return new Promise((resolve, reject) => {
    const upload = cloudinary.uploader.upload_stream({ folder, resource_type: "image", transformation: [{ width: 1200, height: 1200, crop: "limit" }] }, (error, result) => error ? reject(error) : resolve(result));
    upload.end(buffer);
  });
}

export const uploadShopLogo = (buffer) => uploadImage(buffer, "toyshop/shop");
