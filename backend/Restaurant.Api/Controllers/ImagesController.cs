using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Restaurant.BusinessLayer.Interfaces;
using Restaurant.Domain.Models.Image;

namespace Restaurant.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ImagesController : ControllerBase
{
    private readonly IImageService _imageService;

    public ImagesController(IImageService imageService)
    {
        _imageService = imageService;
    }

    [HttpPost]
    public async Task<ActionResult<ImageResponseDto>> UploadImage([FromForm] IFormFile file)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest("No file uploaded.");
        }

        try
        {
            using var stream = file.OpenReadStream();
            var result = await _imageService.UploadImageAsync(stream, file.FileName, file.ContentType);
            return CreatedAtAction(nameof(GetImageById), new { id = result.Id }, result);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpGet]
    public async Task<IActionResult> GetAllImages()
    {
        var images = await _imageService.GetAllImagesAsync();
        return Ok(images);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ImageResponseDto>> GetImageById(Guid id)
    {
        var image = await _imageService.GetImageByIdAsync(id);
        if (image == null)
        {
            return NotFound();
        }

        return Ok(image);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ImageResponseDto>> UpdateImage(Guid id, [FromForm] IFormFile? file)
    {
        try
        {
            Stream? stream = null;
            string? fileName = null;
            string? contentType = null;

            if (file != null && file.Length > 0)
            {
                stream = file.OpenReadStream();
                fileName = file.FileName;
                contentType = file.ContentType;
            }

            var result = await _imageService.UpdateImageAsync(id, stream, fileName, contentType);
            
            if (result == null)
            {
                return NotFound();
            }

            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteImage(Guid id)
    {
        var success = await _imageService.DeleteImageAsync(id);
        if (!success)
        {
            return NotFound();
        }

        return NoContent();
    }

    [HttpPost("migrate-local")]
    public async Task<IActionResult> MigrateLocalImages([FromQuery] string directoryPath)
    {
        if (string.IsNullOrWhiteSpace(directoryPath) || !System.IO.Directory.Exists(directoryPath))
        {
            return BadRequest("Invalid directory path.");
        }

        var files = System.IO.Directory.GetFiles(directoryPath);
        var results = new System.Collections.Generic.List<ImageResponseDto>();
        var errors = new System.Collections.Generic.List<string>();

        foreach (var filePath in files)
        {
            try
            {
                var fileInfo = new System.IO.FileInfo(filePath);
                var extension = fileInfo.Extension.ToLower();
                var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp" };
                
                if (!System.Linq.Enumerable.Contains(allowedExtensions, extension))
                {
                    continue; // Skip non-image files
                }

                string contentType = extension switch
                {
                    ".jpg" or ".jpeg" => "image/jpeg",
                    ".png" => "image/png",
                    ".webp" => "image/webp",
                    _ => "application/octet-stream"
                };

                using var stream = System.IO.File.OpenRead(filePath);
                var result = await _imageService.UploadImageAsync(stream, fileInfo.Name, contentType);
                results.Add(result);
            }
            catch (Exception ex)
            {
                errors.Add($"Failed to upload {filePath}: {ex.Message}");
            }
        }

        return Ok(new { Migrated = results.Count, Results = results, Errors = errors });
    }
}
