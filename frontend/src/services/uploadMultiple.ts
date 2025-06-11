import axios from 'axios';
import { FILES_BASE_URL, FileService } from './file.service';

// Interface for upload response from API
interface UploadResponse {
  success: boolean;
  filename: string;
  originalname: string;
  url: string;
  size: number;
  mimetype: string;
}

/**
 * Uploads multiple files to the server
 * @param files Array of files to upload
 * @returns Array of uploaded file information
 */
export async function uploadMultipleFiles(files: File[]): Promise<UploadResponse[]> {
  try {
    if (files.length === 0) {
      return [];
    }
    
    // Prepare FormData with multiple files
    const formData = new FormData();
    files.forEach((file) => {
      // Use the key 'files' as expected by the backend
      formData.append('files', file);
    });
    
    // For demo mode, simulate successful responses
    if (typeof window !== 'undefined' && localStorage.getItem('DEMO_MODE') === 'true') {
      console.log('Running in demo mode: Simulating file upload');
      
      // Generate mock responses for the files
      const mockResponses: UploadResponse[] = files.map((file, index) => ({
        success: true,
        filename: `mock-upload-${Date.now()}-${index}.${file.name.split('.').pop()}`,
        originalname: file.name,
        url: FileService.getFileUrl(`/uploads/${file.name}`),
        size: file.size,
        mimetype: file.type
      }));
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      return mockResponses;
    }
    
    // Normal API call for non-demo mode
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
    const token = localStorage.getItem('authToken');
    
    console.log('Uploading files to:', `${API_BASE_URL}/upload/multiple`);
    console.log('Number of files:', files.length);
    
    console.log(`Uploading ${files.length} files to ${API_BASE_URL}/upload/multiple`);  
    const response = await axios.post<{success: boolean, files: UploadResponse[]}>
      (`${API_BASE_URL}/upload/multiple`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    });

    // Ensure correct URLs in the response
    if (response.data && response.data.files) {
      response.data.files.forEach(file => {
        if (file.url) {
          file.url = FileService.getFileUrl(file.url);
        }
      });
    }

    return response.data.files || [];
  } catch (error) {
    console.error('Error uploading multiple files:', error);
    // In demo mode, return mock success response even for errors
    if (typeof window !== 'undefined' && localStorage.getItem('DEMO_MODE') === 'true') {
      return [
        {
          success: true,
          filename: `mock-upload-${Date.now()}.jpg`,
          originalname: 'mock-file.jpg',
          url: FileService.getFileUrl('/uploads/mock-file.jpg'),
          size: 1024,
          mimetype: 'image/jpeg'
        }
      ];
    }
    throw error;
  }
}