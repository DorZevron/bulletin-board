using BulletinBoard.Domain.Models;

namespace BulletinBoard.Application.DTOs;

public class AdvertisementResponse
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public AdvertisementCategory Category { get; set; }
    public decimal? Price { get; set; }
    public LocationDto? Location { get; set; }
    public string CreatedByUserId { get; set; } = string.Empty;
    public DateTimeOffset CreatedAtUtc { get; set; }
    public DateTimeOffset? UpdatedAtUtc { get; set; }
    public bool IsOwnedByCurrentUser { get; set; }

}