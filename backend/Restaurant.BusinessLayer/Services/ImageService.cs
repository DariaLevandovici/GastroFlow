using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Restaurant.BusinessLayer.Interfaces;
using Restaurant.DataAccess.Context;
using Restaurant.Domain.Entities;
using Restaurant.Domain.Models.Image;

namespace Restaurant.BusinessLayer.Services;

public class ImageService : IImageService
{
    private readonly AppDbContext _context;
    private readonly string _storagePath;
    private readonly string _baseUrl = "http://localhost:5224"; // The API URL

    public ImageService(AppDbContext context)
    {
        _context = context;
        _storagePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images");
        
        if (!Directory.Exists(_storagePath))
        {
            Directory.CreateDirectory(_storagePath);
        }
    }

    public async Task<ImageResponseDto> UploadImageAsync(Stream fileStream, string fileName, string contentType)
    {
        var ext = Path.GetExtension(fileName).ToLower();
        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp" };
        if (!allowedExtensions.Contains(ext))
        {
            throw new ArgumentException("Invalid file type. Only jpg, png, and webp are allowed.");
        }

        if (fileStream.Length > 5 * 1024 * 1024)
        {
            throw new ArgumentException("File size exceeds 5MB limit.");
        }

        var id = Guid.NewGuid();
        var uniqueFileName = $"{id}{ext}";
        var filePath = Path.Combine(_storagePath, uniqueFileName);

        using (var fileStreamOutput = new FileStream(filePath, FileMode.Create))
        {
            await fileStream.CopyToAsync(fileStreamOutput);
        }

        var publicUrl = $"{_baseUrl}/images/{uniqueFileName}";

        var imageEntity = new Image
        {
            Id = id,
            Url = publicUrl,
            Path = uniqueFileName,
            Filename = fileName,
            MimeType = contentType,
            Size = (int)fileStream.Length,
            CreatedAt = DateTime.UtcNow
        };

        _context.Images.Add(imageEntity);
        await _context.SaveChangesAsync();

        return MapToDto(imageEntity);
    }

    public async Task<IEnumerable<ImageResponseDto>> GetAllImagesAsync()
    {
        var images = await _context.Images.ToListAsync();
        return images.Select(MapToDto);
    }

    public async Task<ImageResponseDto?> GetImageByIdAsync(Guid id)
    {
        var imageEntity = await _context.Images.FindAsync(id);
        if (imageEntity == null) return null;

        return MapToDto(imageEntity);
    }

    public async Task<ImageResponseDto?> UpdateImageAsync(Guid id, Stream? fileStream, string? fileName, string? contentType)
    {
        var imageEntity = await _context.Images.FindAsync(id);
        if (imageEntity == null) return null;

        if (fileStream != null && !string.IsNullOrEmpty(fileName) && !string.IsNullOrEmpty(contentType))
        {
            var ext = Path.GetExtension(fileName).ToLower();
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp" };
            if (!allowedExtensions.Contains(ext))
            {
                throw new ArgumentException("Invalid file type. Only jpg, png, and webp are allowed.");
            }

            if (fileStream.Length > 5 * 1024 * 1024)
            {
                throw new ArgumentException("File size exceeds 5MB limit.");
            }

            // Delete old file
            var oldFilePath = Path.Combine(_storagePath, imageEntity.Path);
            if (File.Exists(oldFilePath))
            {
                File.Delete(oldFilePath);
            }

            var uniqueFileName = $"{id}{ext}";
            var newFilePath = Path.Combine(_storagePath, uniqueFileName);

            using (var fileStreamOutput = new FileStream(newFilePath, FileMode.Create))
            {
                await fileStream.CopyToAsync(fileStreamOutput);
            }

            var publicUrl = $"{_baseUrl}/images/{uniqueFileName}";

            imageEntity.Url = publicUrl;
            imageEntity.Path = uniqueFileName;
            imageEntity.Filename = fileName;
            imageEntity.MimeType = contentType;
            imageEntity.Size = (int)fileStream.Length;
        }

        await _context.SaveChangesAsync();

        return MapToDto(imageEntity);
    }

    public async Task<bool> DeleteImageAsync(Guid id)
    {
        var imageEntity = await _context.Images.FindAsync(id);
        if (imageEntity == null) return false;

        var filePath = Path.Combine(_storagePath, imageEntity.Path);
        if (File.Exists(filePath))
        {
            File.Delete(filePath);
        }

        _context.Images.Remove(imageEntity);
        await _context.SaveChangesAsync();

        return true;
    }

    private static ImageResponseDto MapToDto(Image image)
    {
        return new ImageResponseDto
        {
            Id = image.Id,
            Url = image.Url,
            Filename = image.Filename,
            MimeType = image.MimeType,
            Size = image.Size,
            CreatedAt = image.CreatedAt
        };
    }
}
