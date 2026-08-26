using BulletinBoard.Domain.Models;

namespace BulletinBoard.Application.Interfaces;

public interface IAdvertisementRepository
{
    Task<Advertisement?> GetByIdAsync(Guid id, CancellationToken cancellationToken);
    Task<IReadOnlyList<Advertisement>> GetAllAsync(CancellationToken cancellationToken);
    Task AddAsync(Advertisement advertisement, CancellationToken cancellationToken);
    Task UpdateAsync(Advertisement advertisement, CancellationToken cancellationToken);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken);
}