using System.ComponentModel.DataAnnotations;

namespace BulletinBoard.Application.DTOs;

public class LocationDto
{
    public string? Address { get; set; }

    [Range(-90, 90)]
    public double Latitude { get; set; }

    [Range(-180, 180)]
    public double Longitude { get; set; }
}