import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/server/db";
import { uploadToCloudinary, isCloudinaryConfigured } from "@/server/cloudinary";
import { verifyToken } from "@/server/jwt";

// Helper for standardized responses
const ok = (message: string, data?: any, status = 200) => 
  NextResponse.json({ success: true, message, data }, { status });

const fail = (status: number, message: string, error?: any) => 
  NextResponse.json({ success: false, message, error: error || message }, { status });

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // 1. Auth Check
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return fail(401, "Authorization header missing");
    }
    const user = verifyToken(authHeader.slice(7));
    if (!user) {
      return fail(401, "Invalid or expired token");
    }

    // 2. Parse Form Data
    let formData: FormData;
    try {
      formData = await request.formData();
    } catch (e: any) {
      console.error("Upload FormData parse error:", e);
      return fail(400, "Failed to parse form data. Ensure you are sending multipart/form-data.");
    }

    const files = formData.getAll("files");
    if (!files || files.length === 0) {
      return fail(400, "No files found in the 'files' field.");
    }

    const uploadResults = [];

    for (const fileItem of files) {
      // Basic check if it's a file
      if (typeof fileItem === 'string' || !('arrayBuffer' in fileItem)) {
        continue;
      }

      const file = fileItem as File;
      
      try {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        // Sanitize filename for Cloudinary Public ID (remove spaces and special chars)
        const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_').split('.')[0];
        
        const result: any = await uploadToCloudinary(buffer, file.name, file.type);
        
        uploadResults.push({
          id: result.public_id || `file_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          name: file.name,
          url: result.url,
          type: file.type
        });
      } catch (fileError: any) {
        console.error(`Error uploading ${file.name}:`, fileError);
        // We continue with other files but log the error
      }
    }

    if (uploadResults.length === 0) {
      return fail(500, "All file uploads failed. Check server logs or Cloudinary credentials.");
    }

    return ok("Upload successful", uploadResults.length === 1 ? uploadResults[0] : uploadResults);

  } catch (error: any) {
    console.error("Global Upload API Error:", error);
    return fail(500, "Internal Server Error during upload", error.message);
  }
}

// Ensure Vercel doesn't cache this route
export const dynamic = 'force-dynamic';
