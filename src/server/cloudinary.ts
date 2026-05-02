import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

// Helper to check if Cloudinary is configured
export const isCloudinaryConfigured = () => {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
};

// Storage configuration (Lazy initialized or re-configured if needed)
export const getCloudinary = () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  return cloudinary;
};

// Simple upload function for use in Next.js API routes
export const uploadToCloudinary = async (fileBuffer: Buffer, fileName: string, mimeType: string) => {
  if (!isCloudinaryConfigured()) {
    console.warn('Cloudinary environment variables are missing. Falling back to mock upload.');
    return {
      url: `https://storage.googleapi.com/workflow-pro-uploads/mock_${Date.now()}_${fileName}`,
      name: fileName,
      type: mimeType
    };
  }

  const client = getCloudinary();

  return new Promise((resolve, reject) => {
    const uploadStream = client.uploader.upload_stream(
      {
        folder: 'workflow-pro-uploads',
        resource_type: 'auto',
        public_id: `${Date.now()}-${fileName.split('.')[0]}`,
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          reject(error);
        } else {
          resolve({
            url: result?.secure_url,
            name: fileName,
            type: mimeType,
            public_id: result?.public_id
          });
        }
      }
    );

    uploadStream.end(fileBuffer);
  });
};

export default cloudinary;
