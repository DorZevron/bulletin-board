using System.Text.Json;
using BulletinBoard.Application.Interfaces;
using BulletinBoard.Domain.Models;

namespace BulletinBoard.Infrastructure.Repositories;

public class JsonAdvertisementRepository : IAdvertisementRepository
{
    private readonly string _filePath;
    private readonly SemaphoreSlim _lock = new(1, 1);

    private static readonly JsonSerializerOptions _jsonOptions = new()
    {
        WriteIndented = true
    };

    public JsonAdvertisementRepository(string filePath)
    {
        _filePath = filePath;
    }

    private async Task<List<Advertisement>> ReadAllAsync(CancellationToken cancellationToken)
    {
        if (!File.Exists(_filePath))
        {
            return new List<Advertisement>();
        }

        await using var stream = File.OpenRead(_filePath);
        var items = await JsonSerializer.DeserializeAsync<List<Advertisement>>(stream, _jsonOptions, cancellationToken);
        return items ?? new List<Advertisement>();
    }

    private async Task WriteAllAsync(List<Advertisement> items, CancellationToken cancellationToken)
    {
        var tempFilePath = _filePath + ".tmp";

        await using (var stream = File.Create(tempFilePath))
        {
            await JsonSerializer.SerializeAsync(stream, items, _jsonOptions, cancellationToken);
        }

        File.Move(tempFilePath, _filePath, overwrite: true);
    }


    public async Task<Advertisement?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        var items = await ReadAllAsync(cancellationToken);
        return items.FirstOrDefault(a => a.Id == id);
    }

    public async Task<IReadOnlyList<Advertisement>> GetAllAsync(CancellationToken cancellationToken)
    {
        return await ReadAllAsync(cancellationToken);
    }


    public async Task AddAsync(Advertisement advertisement, CancellationToken cancellationToken)
    {
        await _lock.WaitAsync(cancellationToken);
        try
        {
            var items = await ReadAllAsync(cancellationToken);
            items.Add(advertisement);
            await WriteAllAsync(items, cancellationToken);
        }
        finally
        {
            _lock.Release();
        }
    }

    public async Task UpdateAsync(Advertisement advertisement, CancellationToken cancellationToken)
    {
        await _lock.WaitAsync(cancellationToken);
        try
        {
            var items = await ReadAllAsync(cancellationToken);
            var index = items.FindIndex(a => a.Id == advertisement.Id);

            if (index == -1)
            {
                throw new KeyNotFoundException($"Advertisement with id {advertisement.Id} was not found.");
            }

            items[index] = advertisement;
            await WriteAllAsync(items, cancellationToken);
        }
        finally
        {
            _lock.Release();
        }
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken)
    {
        await _lock.WaitAsync(cancellationToken);
        try
        {
            var items = await ReadAllAsync(cancellationToken);
            var removed = items.RemoveAll(a => a.Id == id);

            if (removed == 0)
            {
                throw new KeyNotFoundException($"Advertisement with id {id} was not found.");
            }

            await WriteAllAsync(items, cancellationToken);
        }
        finally
        {
            _lock.Release();
        }
    }
}