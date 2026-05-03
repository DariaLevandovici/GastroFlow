export interface ImageResponseDto {
  id: string;
  url: string;
  filename: string;
  mimeType?: string;
  size?: number;
  createdAt: string;
}

export interface CreateImageDto {
  file: File;
}

export interface UpdateImageDto {
  file?: File;
}
