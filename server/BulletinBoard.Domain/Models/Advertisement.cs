namespace BulletinBoard.Domain.Models;

public class Advertisement
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public AdvertisementCategory Category { get; set; }
    public decimal? Price { get; set; }
    public Location? Location { get; set; }
    public string CreatedByUserId { get; set; } = string.Empty;
    public DateTimeOffset CreatedAtUtc { get; set; }
    public DateTimeOffset? UpdatedAtUtc { get; set; }
}