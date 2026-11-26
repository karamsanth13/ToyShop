import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function uploadShopLogo(buffer) {
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    const error = new Error("Cloudinary is not configured.");
    error.status = 503;
    throw error;
  }
  return new Promise((resolve, reject) => {
    const upload = cloudinary.uploader.upload_stream({ folder: "toyshop/shop", resource_type: "image", transformation: [{ width: 800, height: 800, crop: "limit" }] }, (error, result) => error ? reject(error) : resolve(result));
    upload.end(buffer);
  });
}
