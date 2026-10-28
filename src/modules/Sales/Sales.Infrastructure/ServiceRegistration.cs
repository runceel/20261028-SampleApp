using Microsoft.Extensions.DependencyInjection;
using Sales.Application;

namespace Sales.Infrastructure;

public static class ServiceRegistration
{
    public static IServiceCollection AddSalesInfrastructure(this IServiceCollection services)
    {
        services.AddSingleton<ISalesReadStore, SampleSalesReadStore>();
        services.AddSingleton(TimeProvider.System);
        services.AddScoped<GetSalesDashboard>();
        return services;
    }
}
