using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Sales.Application;

namespace Sales.Endpoints;

public sealed record OrderResponse(
    string Number, string Customer, string Subject, string Owner,
    decimal Amount, DateOnly ReceivedOn, DateOnly DueOn, string Status, bool RequiresAttention);

public sealed record NoticeResponse(string Id, DateOnly Date, string Category, string Title, string Body);

public sealed record DashboardResponse(
    DateTimeOffset GeneratedAt, DateOnly BusinessDate, bool IsSampleData,
    int OrderCount, int PendingApprovalCount, int DueCount, decimal MonthlyOrderAmount,
    IReadOnlyList<OrderResponse> Orders, IReadOnlyList<NoticeResponse> Notices);

public static class DashboardEndpoints
{
    public static IEndpointRouteBuilder MapSalesEndpoints(this IEndpointRouteBuilder endpoints)
    {
        endpoints.MapGet("/api/dashboard", async (GetSalesDashboard query, CancellationToken cancellationToken) =>
        {
            var summary = await query.ExecuteAsync(cancellationToken);
            var orders = summary.Orders.Select(order => new OrderResponse(
                order.Number, order.Customer, order.Subject, order.Owner, order.Amount,
                order.ReceivedOn, order.DueOn, order.Status, order.RequiresAttention)).ToArray();
            NoticeResponse[] notices =
            [
                new("closing", summary.BusinessDate, "業務連絡", "月次締め処理の確認について",
                    "月次締め前に、未承認の受注と納期未確定の案件をご確認ください。"),
                new("guide", summary.BusinessDate.AddDays(-1), "運用案内", "受注データの確認手順",
                    "受注一覧のステータスで承認待ち・手配中の案件を絞り込めます。更新ボタンで最新の情報を取得できます。"),
                new("sample", summary.BusinessDate.AddDays(-2), "システム", "サンプル環境のご利用について",
                    "この環境は参照専用です。表示する企業名・受注は架空のデータで、登録や承認の操作は行えません。")
            ];
            return TypedResults.Ok(new DashboardResponse(
                summary.GeneratedAt, summary.BusinessDate, true, summary.OrderCount,
                summary.PendingApprovalCount, summary.DueCount, summary.MonthlyOrderAmount, orders, notices));
        }).WithName("GetDashboard");

        return endpoints;
    }
}
