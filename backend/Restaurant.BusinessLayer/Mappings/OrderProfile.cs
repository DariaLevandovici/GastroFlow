using AutoMapper;
using Restaurant.Domain.Entities;
using Restaurant.Domain.Models.Order;

namespace Restaurant.BusinessLayer.Mappings;

public class OrderProfile : Profile
{
    public OrderProfile()
    {
        CreateMap<OrderItem, OrderItemDto>()
            .ForMember(dest => dest.ProductName,
                opt => opt.MapFrom(src => src.Product != null ? src.Product.Name : string.Empty));

        CreateMap<Order, OrderDto>()
            .ForMember(dest => dest.Status,
                opt => opt.MapFrom(src => src.Status.ToString()))
            .ForMember(dest => dest.ClientName,
                opt => opt.MapFrom(src => src.Client != null ? src.Client.FirstName + " " + src.Client.LastName : null))
            .ForMember(dest => dest.WaiterName,
                opt => opt.MapFrom(src => src.Waiter != null ? src.Waiter.FirstName + " " + src.Waiter.LastName : null))
            .ForMember(dest => dest.TableNumber,
                opt => opt.MapFrom(src => src.Table != null ? (int?)src.Table.TableNumber : null))
            .ForMember(dest => dest.Items,
                opt => opt.MapFrom(src => src.OrderItems));
    }
}