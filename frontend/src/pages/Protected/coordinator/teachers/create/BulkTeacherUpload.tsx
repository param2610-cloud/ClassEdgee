import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from '@/hooks/use-toast';
import { Upload, FileSpreadsheet, Loader2 } from "lucide-react";
import axios from 'axios';
import { domain } from '@/lib/constant';

const FacultyBulkUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      const allowedTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
        'application/vnd.ms-excel' // .xls
      ];
      
      if (!allowedTypes.includes(selectedFile.type)) {
        toast({
          title: "Invalid File Type",
          description: "Please upload an Excel file (.xlsx or .xls)",
          variant: "destructive"
        });
        return;
      }

      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "No File Selected",
        description: "Please choose an Excel file to upload",
        variant: "destructive"
      });
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setIsUploading(true);

    try {
      const response = await axios.post(`${domain}/api/v1/faculty/facultybulkupload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      toast({
        title: "Upload Successful",
        description: `${response.data.total_records} records processed`,
        variant: "default"
      });
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.response?.data?.message || "An error occurred",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      setFile(null);
      
      // Reset file input 
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-6 w-6" />
          Faculty Bulk Upload
        </CardTitle>
        <CardDescription>
          Upload an Excel file with faculty details
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid w-full max-w-sm items-center gap-4">
          <Input 
            ref={fileInputRef}
            id="excel-file" 
            type="file" 
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            className="cursor-pointer"
            disabled={isUploading}
          />
          {file && (
            <div className="text-sm text-muted-foreground flex justify-between items-center">
              <span>{file.name}</span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  setFile(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
                disabled={isUploading}
              >
                Clear
              </Button>
            </div>
          )}
          <Button 
            onClick={handleUpload} 
            disabled={!file || isUploading}
            className="w-full"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload Faculty Data
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default FacultyBulkUpload;