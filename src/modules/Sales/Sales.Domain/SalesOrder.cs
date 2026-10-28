namespace Sales.Domain;

public enum OrderStatus
{
    PendingApproval,
    Processing,
    Completed
}

public sealed record SalesOrder(
    string Number,
    string Customer,
    string Subject,
    string Owner,
    decimal Amount,
    DateOnly ReceivedOn,
    DateOnly DueOn,
    OrderStatus Status)
{
    public bool RequiresAttention(DateOnly today) =>
        Status != OrderStatus.Completed && DueOn <= today;
}
