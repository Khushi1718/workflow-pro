import { v2 as cloudinary } from 'cloudinary';

const readCloudinaryEnv = () => ({
  cloudName: process.env.CLOUDINARY_CLOUD_NAME?.trim(),
  apiKey: process.env.CLOUDINARY_API_KEY?.trim(),
  apiSecret: process.env.CLOUDINARY_API_SECRET?.trim(),
});

// Helper to check if Cloudinary is configured
export const isCloudinaryConfigured = () => {
  const { cloudName, apiKey, apiSecret } = readCloudinaryEnv();
  return !!(
    cloudName &&
    apiKey &&
    apiSecret
  );
};

// Storage configuration (Lazy initialized or re-configured if needed)
export const getCloudinary = () => {
  const { cloudName, apiKey, apiSecret } = readCloudinaryEnv();

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in the deployment environment."
    );
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
  return cloudinary;
};

const getPublicId = (fileName: string) => {
  const baseName = fileName.replace(/\.[^/.]+$/, "");
  const safeName = baseName
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 80);

  return `${Date.now()}-${safeName || "upload"}`;
};

// Simple upload function for use in Next.js API routes
export const uploadToCloudinary = async (fileBuffer: Buffer, fileName: string, mimeType: string) => {
  const client = getCloudinary();

  return new Promise((resolve, reject) => {
    const uploadStream = client.uploader.upload_stream(
      {
        folder: 'workflow-pro-uploads',
        resource_type: 'auto',
        public_id: getPublicId(fileName),
        use_filename: false,
        unique_filename: false,
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          reject(error);
          return;
        }

        if (!result?.secure_url) {
          reject(new Error("Cloudinary upload did not return a secure URL."));
          return;
        }

        resolve({
          url: result.secure_url,
          name: fileName,
          type: mimeType,
          public_id: result.public_id
        });
      }
    );

    uploadStream.on("error", reject);
    uploadStream.end(fileBuffer);
  });
};

export default cloudinary;
