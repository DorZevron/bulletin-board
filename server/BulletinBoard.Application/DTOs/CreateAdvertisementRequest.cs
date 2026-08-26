using System.ComponentModel.DataAnnotations;
using BulletinBoard.Domain.Models;

namespace BulletinBoard.Application.DTOs;

public class CreateAdvertisementRequest
{

    [Required, StringLength(100, MinimumLength = 2)]
    public string Title { get; set; } = string.Empty;

    [Required, StringLength(500)]
    public string Description { get; set; } = string.Empty;

    public AdvertisementCategory Category { get; set; }

    [Range(0, double.MaxValue, ErrorMessage = "Price cannot be negative")]
    public decimal? Price { get; set; }

    public LocationDto? Location { get; set; }

}