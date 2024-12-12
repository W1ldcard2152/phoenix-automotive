import { useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from "@/components/ui/button";
import { Image, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";

const ImageUpload = ({ onImageUploaded, className }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);

  const validateFile = (file) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      throw new Error('Please upload a valid image file (JPG, PNG, or WebP)');
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error('File size must be less than 5MB');
    }

    return true;
  };

  const handleUpload = async (event) => {
    setError(null);
    setProgress(0);
    
    const file = event.target.files[0];
    if (!file) return;
  
    try {
      validateFile(file);
      setUploading(true);
  
      console.log('Starting upload:', {
        name: file.name,
        type: file.type,
        size: `${(file.size / 1024 / 1024).toFixed(2)}MB`
      });
  
      const formData = new FormData();
      formData.append('image', file);
  
      const response = await fetch('/api/upload', { 
        method: 'POST',
        body: formData
      });
  
      console.log('Upload response status:', response.status);
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Upload failed:', {
          status: response.status,
          statusText: response.statusText,
          errorText
        });
  
        throw new Error(errorText);
      }
  
      const data = await response.json();
      console.log('Upload response data:', data);
  
      if (!data.url) {
        throw new Error('No URL in response');
      }
  
      console.log('Upload successful:', {
        url: data.url,
        publicId: data.public_id
      });
  
      onImageUploaded(data.url);
      setError(null);
    } catch (error) {
      console.error('Upload error:', error);
      setError(error.message || 'Failed to upload image');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-4">
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleUpload}
          style={{ display: 'none' }}
          id="image-upload"
          disabled={uploading}
        />
        <Button
          type="button"
          variant="outline"
          className="flex items-center gap-2"
          disabled={uploading}
          asChild
        >
          <label htmlFor="image-upload" className="cursor-pointer">
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading... {progress > 0 && `${Math.round(progress)}%`}
              </>
            ) : (
              <>
                <Image className="h-4 w-4" />
                Upload Image
              </>
            )}
          </label>
        </Button>
      </div>
      
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

ImageUpload.propTypes = {
  onImageUploaded: PropTypes.func.isRequired,
  className: PropTypes.string
};

ImageUpload.defaultProps = {
  className: ''
};

export default ImageUpload;