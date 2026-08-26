using BulletinBoard.Application.Interfaces;
using BulletinBoard.Application.Services;
using BulletinBoard.Infrastructure.Repositories;
using BulletinBoard.Infrastructure.Services;
using BulletinBoard.Api.Middleware;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddHttpContextAccessor(); // HttpContext to IHttpContextAccessor in CurrentUserService

builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();
builder.Services.AddScoped<IAdvertisementRepository>(_ =>
    new JsonAdvertisementRepository(
        Path.Combine(builder.Environment.ContentRootPath, "Data", "advertisements.json"))); // PathCombine handle for Mac and Windows
builder.Services.AddScoped<AdvertisementService>();


// --- CORS --- ///
builder.Services.AddCors(options =>
{
    options.AddPolicy("AngularClient", policy =>
    {
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddExceptionHandler<AdvertisementExceptionHandler>();
builder.Services.AddProblemDetails();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AngularClient");
app.UseExceptionHandler();

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
