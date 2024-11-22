import React, { useState } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Upload, User } from 'lucide-react';
// const cloudinary = require('cloudinary').v2;
import axios from 'axios';
import { domain } from '@/lib/constant';
interface CloudinaryUploadProps {
  setProfileImageLink: (link: string) => void;
  apiKey: string;
  cloudName: string;
  apiSecret: string;
}

const CloudinaryUpload: React.FC<CloudinaryUploadProps> = ({ 
  setProfileImageLink, 
  apiKey, 
  cloudName,
  apiSecret
}) => {
  const [profilePreview, setProfilePreview] = useState<string>('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [signature,setsignature] = useState<string>('');

 

  

  const uploadFile = async (file: File) => {
    try {
      setUploadingImage(true);
      
      // Generate timestamp
      const timestamp = Math.round(Date.now() / 1000);
      
      // Generate signature
      const signatureresponse = await axios.get(`${domain}/api/v1/general/generate-signature`)
      console.log(signatureresponse.data);
      
      setsignature(signatureresponse.data.signature)
      
      // Prepare form data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('timestamp', timestamp.toString());
      formData.append('api_key', apiKey);
      formData.append('signature', signature);
      formData.append('use_filename', 'true');
      console.log(formData);
      
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
        {
          method: 'POST',
          body: formData
        }
      );
console.log(await response.json());


      const data = await response.json();
      const uploadedUrl = data.secure_url;
      
      // Set profile preview
      setProfilePreview(uploadedUrl);
      
      // Pass the uploaded image link to the setter
      setProfileImageLink(uploadedUrl);

      return uploadedUrl;
    } catch (error) {
      console.error('Upload error:', error);
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to Cloudinary
      await uploadFile(file);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <Avatar className="h-32 w-32">
        <AvatarImage
          src={profilePreview}
          alt="Profile preview"
        />
        <AvatarFallback>
          <User className="h-16 w-16" />
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col items-center">
        <Label
          htmlFor="profilePicture"
          className="cursor-pointer"
        >
          <div className="flex items-center space-x-2 bg-secondary p-2 rounded-md">
            <Upload className="h-4 w-4" />
            <span>
              {uploadingImage ? "Uploading..." : "Upload Photo"}
            </span>
          </div>
          <input
            type="file"
            id="profilePicture"
            className="hidden"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={uploadingImage}
          />
        </Label>
      </div>
    </div>
  );
};

export default CloudinaryUpload;