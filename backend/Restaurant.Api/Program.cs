using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
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
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddCors(options =>
{
	options.AddPolicy(LocalFrontendCorsPolicy, policy =>
	{
		policy
			.WithOrigins("http://localhost:5173", "http://localhost:5174", "http://localhost:5224")
			.AllowAnyHeader()
			.AllowAnyMethod();
	});
});

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<AppDbContext>(options =>
{
	options.UseNpgsql(connectionString);
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
}

app.Run();
