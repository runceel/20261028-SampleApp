using Sales.Application;
using Sales.Domain;

namespace Sales.Infrastructure;

public sealed class SampleSalesReadStore : ISalesReadStore
{
    public Task<IReadOnlyList<SalesOrder>> GetOrdersAsync(DateOnly today, CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();
        IReadOnlyList<SalesOrder> orders =
        [
            new("SO-1006", "株式会社みなと商事", "オフィス機器入替", "佐藤", 1280000m, today, today.AddDays(7), OrderStatus.PendingApproval),
            new("SO-1005", "東都テクノロジー株式会社", "保守サービス更新", "鈴木", 480000m, today, today, OrderStatus.Processing),
            new("SO-1004", "青葉産業株式会社", "ネットワーク設備追加", "田中", 860000m, today.AddDays(-1), today.AddDays(3), OrderStatus.PendingApproval),
            new("SO-1003", "株式会社中央物流", "拠点端末セットアップ", "佐藤", 324000m, today.AddDays(-2), today.AddDays(-1), OrderStatus.Processing),
            new("SO-1002", "北星サービス株式会社", "業務用ライセンス更新", "鈴木", 216000m, today.AddDays(-3), today.AddDays(-1), OrderStatus.Completed),
            new("SO-1001", "株式会社みなと商事", "周辺機器納入", "田中", 158000m, today.AddDays(-4), today.AddDays(-2), OrderStatus.Completed)
        ];
        return Task.FromResult(orders);
    }
}
