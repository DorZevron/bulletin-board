using BulletinBoard.Application.DTOs;
using BulletinBoard.Application.Interfaces;
using BulletinBoard.Domain.Models;

namespace BulletinBoard.Application.Services;

public class AdvertisementService
{
    private readonly IAdvertisementRepository _repository;
    private readonly ICurrentUserService _currentUserService;

    public AdvertisementService(
        IAdvertisementRepository repository,
        ICurrentUserService currentUserService)
    {
        _repository = repository;
        _currentUserService = currentUserService;
    }


    public async Task<AdvertisementResponse> CreateAsync(CreateAdvertisementRequest request, CancellationToken cancellationToken)
    {
        var advertisement = new Advertisement
        {
            Id = Guid.NewGuid(),
            Title = request.Title,
            Description = request.Description,
            Category = request.Category,
            Price = request.Price,
            Location = request.Location is null ? null : new Location
            {
                Address = request.Location.Address,
                Latitude = request.Location.Latitude,
                Longitude = request.Location.Longitude
            },
            CreatedByUserId = _currentUserService.UserId,
            CreatedAtUtc = DateTimeOffset.UtcNow
        };

        await _repository.AddAsync(advertisement, cancellationToken);

        return MapToResponse(advertisement);
    }


    private AdvertisementResponse MapToResponse(Advertisement advertisement)
    {
        return new AdvertisementResponse
        {
            Id = advertisement.Id,
            Title = advertisement.Title,
            Description = advertisement.Description,
            Category = advertisement.Category,
            Price = advertisement.Price,
            Location = advertisement.Location is null ? null : new LocationDto
            {
                Address = advertisement.Location.Address,
                Latitude = advertisement.Location.Latitude,
                Longitude = advertisement.Location.Longitude
            },
            CreatedByUserId = advertisement.CreatedByUserId,
            CreatedAtUtc = advertisement.CreatedAtUtc,
            UpdatedAtUtc = advertisement.UpdatedAtUtc,
            IsOwnedByCurrentUser = advertisement.CreatedByUserId == _currentUserService.UserId
        };
    }

    public async Task<AdvertisementResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        var advertisement = await _repository.GetByIdAsync(id, cancellationToken);
        return advertisement is null ? null : MapToResponse(advertisement);
    }


    public async Task<AdvertisementResponse> UpdateAsync(Guid id, UpdateAdvertisementRequest request, CancellationToken cancellationToken)
    {
        var existing = await GetOwnedAdvertisementAsync(id, cancellationToken);


        existing.Title = request.Title;
        existing.Description = request.Description;
        existing.Category = request.Category;
        existing.Price = request.Price;
        existing.Location = request.Location is null ? null : new Location
        {
            Address = request.Location.Address,
            Latitude = request.Location.Latitude,
            Longitude = request.Location.Longitude
        };
        existing.UpdatedAtUtc = DateTimeOffset.UtcNow;

        await _repository.UpdateAsync(existing, cancellationToken);

        return MapToResponse(existing);
    }


    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken)
    {

        var existing = await GetOwnedAdvertisementAsync(id, cancellationToken);

        await _repository.DeleteAsync(id, cancellationToken);
    }

    private async Task<Advertisement> GetOwnedAdvertisementAsync(Guid id, CancellationToken cancellationToken)
    {
        var existing = await _repository.GetByIdAsync(id, cancellationToken);

        if (existing is null)
        {
            throw new KeyNotFoundException($"Advertisement with id {id} was not found.");
        }

        if (existing.CreatedByUserId != _currentUserService.UserId)
        {
            throw new UnauthorizedAccessException("You are not the owner of this advertisement.");
        }

        return existing;
    }


    public async Task<PagedResult<AdvertisementResponse>> GetAsync(AdvertisementQuery query, CancellationToken cancellationToken)
    {
        var all = await _repository.GetAllAsync(cancellationToken);

        IEnumerable<Advertisement> filtered = all;

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            filtered = filtered.Where(a =>
                a.Title.Contains(query.Search, StringComparison.OrdinalIgnoreCase) ||
                a.Description.Contains(query.Search, StringComparison.OrdinalIgnoreCase));
        }

        if (query.Category.HasValue)
        {
            filtered = filtered.Where(a => a.Category == query.Category.Value);
        }

        if (query.MinPrice.HasValue)
        {
            filtered = filtered.Where(a => a.Price.HasValue && a.Price.Value >= query.MinPrice.Value);
        }

        if (query.MaxPrice.HasValue)
        {
            filtered = filtered.Where(a => a.Price.HasValue && a.Price.Value <= query.MaxPrice.Value);
        }

        if (query.MineOnly)
        {
            filtered = filtered.Where(a => a.CreatedByUserId == _currentUserService.UserId);
        }

        var totalCount = filtered.Count();

        var items = filtered
            .OrderByDescending(a => a.CreatedAtUtc)
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .Select(MapToResponse)
            .ToList();

        return new PagedResult<AdvertisementResponse>
        {
            Items = items,
            TotalCount = totalCount,
            Page = query.Page,
            PageSize = query.PageSize
        };
    }
}

