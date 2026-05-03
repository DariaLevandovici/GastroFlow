using Microsoft.Extensions.DependencyInjection;
using Restaurant.BusinessLayer.Core.Interfaces;
using Restaurant.BusinessLayer.Structure;
using Restaurant.DataAccess;
using Restaurant.BusinessLayer.Interfaces;
using Restaurant.BusinessLayer.Services;
using Supabase;
using System;

using Restaurant.BusinessLayer.Mappings;
using AutoMapper;

namespace Restaurant.BusinessLayer;

public static class BusinessLogic
{
    public static IServiceCollection AddBusinessLayer(this IServiceCollection services)
    {
        // AutoMapper
        services.AddAutoMapper(typeof(OrderProfile).Assembly);

        // Data Access Layer
        services.AddScoped<DbSession>();

        // Business Layer Services
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<ICategoryService, CategoryService>();
        services.AddScoped<ITableService, TableService>();
        services.AddScoped<IImageService, ImageService>();
        services.AddScoped<IProductService, ProductService>();
        services.AddScoped<IOrderService, OrderService>();
        services.AddScoped<IRecipeService, RecipeService>();
        services.AddScoped<IUserService, UserService>();

        return services;
    }
}