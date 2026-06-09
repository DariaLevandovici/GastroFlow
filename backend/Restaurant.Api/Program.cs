using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Restaurant.Api.Middleware;
using Restaurant.BusinessLayer;
using Restaurant.DataAccess.Context;
using Restaurant.DataAccess.Seed;
using Restaurant.Domain.Entities;

var builder = WebApplication.CreateBuilder(args);

const string LocalFrontendCorsPolicy = "LocalFrontend";

builder.Services.AddControllers();
builder.Services.Configure<ApiBehaviorOptions>(options =>
{
	options.InvalidModelStateResponseFactory = _ => new BadRequestObjectResult(new { message = "Invalid data" });
});
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddCors(options =>
{
	options.AddPolicy(LocalFrontendCorsPolicy, policy =>
	{
		policy
			.SetIsOriginAllowed(IsLocalDevelopmentOrigin)
			.AllowAnyHeader()
			.AllowAnyMethod();
	});
});

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<AppDbContext>(options =>
{
	options.UseNpgsql(connectionString);
	options.ConfigureWarnings(w => w.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning));
});

builder.Services.AddBusinessLayer();

var secretKey = builder.Configuration["JwtConfig:SecretKey"] ?? throw new InvalidOperationException("Missing JwtConfig:SecretKey");
var issuer = builder.Configuration["JwtConfig:Issuer"];
var audience = builder.Configuration["JwtConfig:Audience"];

builder.Services
	.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
	.AddJwtBearer(options =>
	{
		options.TokenValidationParameters = new TokenValidationParameters
		{
			ValidateIssuer = true,
			ValidateAudience = true,
			ValidateIssuerSigningKey = true,
			ValidateLifetime = true,
			ValidIssuer = issuer,
			ValidAudience = audience,
			IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey))
		};
	});

builder.Services.AddAuthorization();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
	app.UseSwagger();
	app.UseSwaggerUI();
}

app.UseMiddleware<ErrorHandlingMiddleware>();
app.UseHttpsRedirection();
app.UseStaticFiles(); // Serve images from wwwroot
app.UseCors(LocalFrontendCorsPolicy);
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Apply migrations and seed products when the target DB is empty.
using (var scope = app.Services.CreateScope())
{
	var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
	// Apply migrations on startup.
	await db.Database.MigrateAsync();
	// Seed products with correct image references.
	await DatabaseSeeder.SeedAsync(db);
}

app.Run();

static bool IsLocalDevelopmentOrigin(string origin)
{
	if (!Uri.TryCreate(origin, UriKind.Absolute, out var uri))
	{
		return false;
	}

	return (uri.Scheme == Uri.UriSchemeHttp || uri.Scheme == Uri.UriSchemeHttps)
		&& (uri.Host == "localhost" || uri.Host == "127.0.0.1" || uri.Host == "::1");
}
