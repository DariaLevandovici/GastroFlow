using System;
using System.ComponentModel.DataAnnotations;

namespace Restaurant.Domain.Entities;

public class Image
{
    [Key]
    public Guid Id { get; set; }

    [Required]
    public string Url { get; set; } = string.Empty;

    [Required]
    public string Path { get; set; } = string.Empty;

    [Required]
    public string Filename { get; set; } = string.Empty;

    public string? MimeType { get; set; }

    public int? Size { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Product? Product { get; set; }
}
