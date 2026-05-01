using Microsoft.Extensions.DependencyInjection;
using Restaurant.BusinessLayer.Core.Interfaces;
using Restaurant.BusinessLayer.Structure;
using Restaurant.DataAccess;

namespace Restaurant.BusinessLayer;

public static class BusinessLogic
{
    public static IServiceCollection AddBusinessLayer(this IServiceCollection services)
    {
        // Data Access Layer
        services.AddScoped<DbSession>();

        // Business Layer Services
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<ICategoryService, CategoryService>();
        services.AddScoped<ITableService, TableService>();

        return services;
    }
}