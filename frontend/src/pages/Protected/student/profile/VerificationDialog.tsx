import React, { useRef, useState, useCallback } from 'react';
import { Camera, AlertCircle, CameraIcon } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import UploadOnCloudinary from '@/services/Cloudinary';
import { fastapidomain } from '@/lib/constant';

const CAPTURE_INSTRUCTIONS = [
  { id: 1, pose: "Neutral", description: "Look straight at the camera with a neutral expression" },
  { id: 2, pose: "Slight Right", description: "Turn your head slightly to the right" },
  { id: 3, pose: "Slight Left", description: "Turn your head slightly to the left" },
  { id: 4, pose: "Slight Up", description: "Tilt your head slightly upward" },
  { id: 5, pose: "Slight Down", description: "Tilt your head slightly downward" },
  { id: 6, pose: "Smile", description: "Look straight and smile naturally" },
  { id: 7, pose: "Neutral with Glasses", description: "If you wear glasses, put them on and look straight" },
  { id: 8, pose: "Quarter Right", description: "Turn your head 45 degrees to the right" },
  { id: 9, pose: "Quarter Left", description: "Turn your head 45 degrees to the left" },
  { id: 10, pose: "Natural Expression", description: "Make a natural, relaxed expression" }
];

const FaceVerification = ({ user_id }: { user_id: number }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [capturedImages, setCapturedImages] = useState<File[]>([]);
  const [uploadedImageMediaLinks, setUploadedImageMediaLinks] = useState<string[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [showPreparationAlert, setShowPreparationAlert] = useState(false);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream as MediaStream;
      }
      setShowPreparationAlert(true);
      setTimeout(() => setShowPreparationAlert(false), 5000);
    } catch (err) {
      console.error('Error accessing camera:', err);
    }
  };

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  }, [stream]);

  const captureImage = async () => {
    if (!videoRef.current || isCapturing) return;

    setIsCapturing(true);
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (!context) {
      console.error('Failed to get canvas context');
      setIsCapturing(false);
      return;
    }

    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, 'image/jpeg', 0.8);
    });

    if (!blob) {
      console.error('Failed to create blob');
      setIsCapturing(false);
      return;
    }

    const file = new File([blob], `${user_id}-face-${CAPTURE_INSTRUCTIONS[currentStep].pose}.jpg`, { type: 'image/jpeg' });
    setCapturedImages((prev) => [...prev, file]);

    setIsCapturing(false);

    if (currentStep < CAPTURE_INSTRUCTIONS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      uploadImages([...capturedImages, file]);
    }
  };

  const uploadImages = async (images: File[]) => {
    await UploadOnCloudinary({
      mediaFiles: images,
      setuploadedImageMediaLinks: (links) => setUploadedImageMediaLinks(links),
      setuploadedVideoMediaLinks: () => {}, // Not using video uploads for face verification
    });
    stopCamera();
  };

  const sendUrlsToBackend = async () => {
    if (uploadedImageMediaLinks.length === 0) {
      console.error('No images uploaded yet');
      return;
    }

    try {
      const response = await fetch(`${fastapidomain}/api/face-recognition/register-face`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageUrls: uploadedImageMediaLinks, user_id }),
      });

      if (!response.ok) {
        throw new Error('Failed to send URLs to backend');
      }

      const data = await response.json();
      console.log('Backend response:', data);
    } catch (error) {
      console.error('Error sending URLs to backend:', error);
    }
  };

  React.useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return (
    <div className="flex flex-col items-center space-y-4 p-4">
      {showPreparationAlert && (
        <Alert className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Position yourself in a well-lit area, ensuring your face is clearly visible
          </AlertDescription>
        </Alert>
      )}

      <div className="relative w-full max-w-md aspect-video bg-gray-100 rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
        {stream && (
          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-4">
            <h3 className="text-lg font-semibold">
              {CAPTURE_INSTRUCTIONS[currentStep].pose}
            </h3>
            <p className="text-sm">
              {CAPTURE_INSTRUCTIONS[currentStep].description}
            </p>
            <div className="mt-2 h-1 bg-gray-200 rounded">
              <div 
                className="h-full bg-green-500 rounded transition-all duration-300"
                style={{ width: `${((currentStep + 1) / CAPTURE_INSTRUCTIONS.length) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex space-x-4">
        {!stream && (
          <button
            onClick={startCamera}
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            <Camera className="w-5 h-5 mr-2" />
            Start Camera
          </button>
        )}

        {stream && currentStep < CAPTURE_INSTRUCTIONS.length && (
          <button
            onClick={captureImage}
            disabled={isCapturing}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400 flex items-center"
          >
            {isCapturing ? 'Capturing...' : 'Capture Image'}
            <CameraIcon className="w-4 h-4 ml-2" />
          </button>
        )}

        {uploadedImageMediaLinks.length > 0 && (
          <button
            onClick={sendUrlsToBackend}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
          >
            Send to Backend
          </button>
        )}
      </div>

      {uploadedImageMediaLinks.length > 0 && (
        <div className="mt-4">
          <p className="text-sm text-gray-600">
            {uploadedImageMediaLinks.length} images uploaded successfully
          </p>
        </div>
      )}
    </div>
  );
};

export default FaceVerification;