import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper to check if Cloudinary is configured
export const isCloudinaryConfigured = () => {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
};

// Storage configuration
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // Determine folder based on file type or context if needed
    const folder = 'workflow-pro-uploads';
    
    // Get file extension
    const extension = file.originalname.split('.').pop()?.toLowerCase();
    
    // Support multiple formats including docs, pdfs, etc.
    // Cloudinary 'auto' resource_type handles this
    return {
      folder: folder,
      resource_type: 'auto',
      public_id: `${Date.now()}-${file.originalname.split('.')[0]}`,
      format: extension === 'pdf' ? 'pdf' : undefined, // Explicitly set pdf format if needed
    };
  },
});

export const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

// Simple upload function for use without multer (e.g. in Next.js API routes)
export const uploadToCloudinary = async (fileBuffer: Buffer, fileName: string, mimeType: string) => {
  if (!isCloudinaryConfigured()) {
    console.warn('Cloudinary environment variables are missing. Falling back to mock upload.');
    return {
      url: `https://storage.googleapi.com/workflow-pro-uploads/mock_${Date.now()}_${fileName}`,
      name: fileName,
      type: mimeType
    };
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
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
