using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using Restaurant.Domain.Models.Image;

namespace Restaurant.BusinessLayer.Interfaces;

public interface IImageService
{
    Task<ImageResponseDto> UploadImageAsync(Stream fileStream, string fileName, string contentType);
    Task<IEnumerable<ImageResponseDto>> GetAllImagesAsync();
    Task<ImageResponseDto?> GetImageByIdAsync(Guid id);
    Task<ImageResponseDto?> UpdateImageAsync(Guid id, Stream? fileStream, string? fileName, string? contentType);
    Task<bool> DeleteImageAsync(Guid id);
}
