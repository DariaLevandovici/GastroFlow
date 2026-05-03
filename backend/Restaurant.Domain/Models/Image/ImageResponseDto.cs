using System;

namespace Restaurant.Domain.Models.Image;

public class ImageResponseDto
{
    public Guid Id { get; set; }
    public string Url { get; set; } = string.Empty;
    public string Filename { get; set; } = string.Empty;
    public string? MimeType { get; set; }
    public int? Size { get; set; }
    public DateTime CreatedAt { get; set; }
}
