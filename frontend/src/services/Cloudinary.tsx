import axios from "axios";

interface UploadOnCloudinaryProps {
    mediaFiles: File[];
    setuploadedImageMediaLinks: (links: string[]) => void;
    setuploadedVideoMediaLinks: (links: string[]) => void;
}

const UploadOnCloudinary = async ({
    mediaFiles,
    setuploadedImageMediaLinks,
    setuploadedVideoMediaLinks,
}: UploadOnCloudinaryProps) => {

    const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;    
    const API_KEY = import.meta.env.VITE_CLOUDINARY_API_KEY;

    if (!CLOUD_NAME || !UPLOAD_PRESET || !API_KEY) {
        console.error("Cloudinary environment variables are not set properly.");
        return;
    }

    const uploadedUrls: string[] = [];

    for (const file of mediaFiles) {
        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("upload_preset", UPLOAD_PRESET);

            const resourceType = file.type.startsWith("video/") ? "video" : "image";
            const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`;

            const response = await axios.post(uploadUrl, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            console.log(response);
            
            if (response.status === 200) {
                const result = response.data;
                const uploadedUrl = result.secure_url;
                console.log(`Uploaded URL: ${uploadedUrl}`);

                if (resourceType === "image") {
                    uploadedUrls.push(uploadedUrl);
                    setuploadedImageMediaLinks([...uploadedUrls]);
                } else if (resourceType === "video") {
                    uploadedUrls.push(uploadedUrl);
                    setuploadedVideoMediaLinks([...uploadedUrls]);
                } 
            } else {
                console.error("Failed to upload file:", response.statusText);
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error("Error uploading file:", error.response?.data || error.message);
            } else {
                console.error("Error uploading file:", error);
            }
        }
    }
};

export default UploadOnCloudinary;
