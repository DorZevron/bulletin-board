using BulletinBoard.Application.Interfaces;
using Microsoft.AspNetCore.Http;

namespace BulletinBoard.Infrastructure.Services;

public class CurrentUserService : ICurrentUserService
{
    private const string DemoUserHeaderName = "X-Demo-User-Id";
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUserService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public string UserId =>
        _httpContextAccessor.HttpContext?.Request.Headers[DemoUserHeaderName].ToString()
        ?? throw new InvalidOperationException("Missing X-Demo-User-Id header.");
}