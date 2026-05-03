import { API_ENDPOINTS } from '../config/api';
import type { ImageResponseDto } from '../types/imageTypes';

export const uploadImage = async (file: File): Promise<ImageResponseDto> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(API_ENDPOINTS.images, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Failed to upload image: ${response.statusText}`);
  }

  return response.json();
};

export const getAllImages = async (): Promise<ImageResponseDto[]> => {
  const response = await fetch(API_ENDPOINTS.images);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch images: ${response.statusText}`);
  }

  return response.json();
};

export const getImageById = async (id: string): Promise<ImageResponseDto> => {
  const response = await fetch(`${API_ENDPOINTS.images}/${id}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.statusText}`);
  }

  return response.json();
};

export const updateImage = async (id: string, file: File): Promise<ImageResponseDto> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_ENDPOINTS.images}/${id}`, {
    method: 'PUT',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Failed to update image: ${response.statusText}`);
  }

  return response.json();
};

export const deleteImage = async (id: string): Promise<void> => {
  const response = await fetch(`${API_ENDPOINTS.images}/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error(`Failed to delete image: ${response.statusText}`);
  }
};
