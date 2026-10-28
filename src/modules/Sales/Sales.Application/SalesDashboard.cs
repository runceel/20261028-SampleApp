using Sales.Domain;

namespace Sales.Application;

public interface ISalesReadStore
{
    Task<IReadOnlyList<SalesOrder>> GetOrdersAsync(DateOnly today, CancellationToken cancellationToken);
}

public sealed record OrderItem(
    string Number, string Customer, string Subject, string Owner,
    decimal Amount, DateOnly ReceivedOn, DateOnly DueOn, string Status, bool RequiresAttention);

public sealed record DashboardSummary(
    DateTimeOffset GeneratedAt, DateOnly BusinessDate, int OrderCount,
    int PendingApprovalCount, int DueCount, decimal MonthlyOrderAmount,
    IReadOnlyList<OrderItem> Orders);

public sealed class GetSalesDashboard(ISalesReadStore store, TimeProvider timeProvider)
{
    public async Task<DashboardSummary> ExecuteAsync(CancellationToken cancellationToken)
    {
        var now = timeProvider.GetUtcNow();
        var today = DateOnly.FromDateTime(now.ToOffset(TimeSpan.FromHours(9)).DateTime);
        var orders = await store.GetOrdersAsync(today, cancellationToken);
        var items = orders.OrderByDescending(order => order.ReceivedOn)
            .ThenBy(order => order.Number, StringComparer.Ordinal)
            .Select(order => new OrderItem(
                order.Number, order.Customer, order.Subject, order.Owner, order.Amount,
                order.ReceivedOn, order.DueOn, order.Status switch
                {
                    OrderStatus.PendingApproval => "pendingApproval",
                    OrderStatus.Processing => "processing",
                    OrderStatus.Completed => "completed",
                    _ => throw new InvalidOperationException("Unknown order status.")
                }, order.RequiresAttention(today)))
            .ToArray();

        return new DashboardSummary(
            now, today, orders.Count,
            orders.Count(order => order.Status == OrderStatus.PendingApproval),
            orders.Count(order => order.RequiresAttention(today)),
            orders.Where(order => order.ReceivedOn.Year == today.Year && order.ReceivedOn.Month == today.Month)
                .Sum(order => order.Amount),
            items);
    }
}
