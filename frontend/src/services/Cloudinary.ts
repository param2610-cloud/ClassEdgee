const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

interface UploadResponse {
  secure_url: string;
  public_id: string;
  resource_type: string;
}

interface CloudinaryError {
  message: string;
  error?: any;
}

/**
 * Uploads a file to Cloudinary using the REST API
 * @param file - File to upload
 * @param folder - Optional folder name in Cloudinary
 */
export const uploadFile = async (
  file: File,
  folder?: string
): Promise<UploadResponse | CloudinaryError> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    if (folder) {
      formData.append('folder', folder);
    }

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    return {
      secure_url: data.secure_url,
      public_id: data.public_id,
      resource_type: data.resource_type
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    return {
      message: 'Failed to upload file',
      error
    };
  }
};

/**
 * Deletes a file from Cloudinary
 * Note: This should typically be done through your backend for security
 * @param publicId - Public ID of the file to delete
 */
export const deleteFile = async (
  publicId: string
): Promise<{ message: string } | CloudinaryError> => {
  try {
    // It's recommended to handle deletion through your backend
    // This is just an example of how you might structure the request
    const response = await fetch('/api/cloudinary/delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ publicId }),
    });

    if (!response.ok) {
      throw new Error(`Delete failed: ${response.statusText}`);
    }

    return { message: 'File deleted successfully' };
  } catch (error) {
    console.error('Error deleting file:', error);
    return {
      message: 'Failed to delete file',
      error
    };
  }
};