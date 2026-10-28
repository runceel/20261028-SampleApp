import { useEffect, useRef, useState } from "react";
import { ApiError, errorMessage } from "../../shared/api";
import { getDashboard } from "./dashboardApi";
import type { Dashboard, OrderStatus } from "./dashboardApi";

const statusLabels: Record<OrderStatus, string> = {
  pendingApproval: "承認待ち", processing: "手配中", completed: "完了",
};
const yen = new Intl.NumberFormat("ja-JP", { style: "currency", currency: "JPY", maximumFractionDigits: 0 });
const dateLabel = new Intl.DateTimeFormat("ja-JP", { dateStyle: "long", timeZone: "Asia/Tokyo" });
const timeLabel = new Intl.DateTimeFormat("ja-JP", { hour: "2-digit", minute: "2-digit", second: "2-digit", timeZone: "Asia/Tokyo" });
const shortDate = (date: string) => date.slice(5).replace("-", "/");

export function SalesDashboard() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(true);
  const [revision, setRevision] = useState(0);
  const [filter, setFilter] = useState<OrderStatus | "all">("all");
  const request = useRef<AbortController | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    request.current = controller;
    setBusy(true);
    setError("");
    getDashboard(controller.signal)
      .then((result) => { if (!controller.signal.aborted) setData(result); })
      .catch((cause: unknown) => {
        if (!controller.signal.aborted) {
          const trace = cause instanceof ApiError && cause.traceId ? `（照会 ID: ${cause.traceId}）` : "";
          setError(errorMessage(cause) + trace);
        }
      })
      .finally(() => { if (!controller.signal.aborted) setBusy(false); });
    return () => controller.abort();
  }, [revision]);

  const orders = data?.orders.filter((order) => filter === "all" || order.status === filter) ?? [];
  const attention = data?.orders.filter((order) => order.requiresAttention) ?? [];

  function refresh() {
    request.current?.abort();
    setRevision((value) => value + 1);
  }

  return (
    <>
      <div className="page-heading"><div><p className="page-eyebrow">SALES OVERVIEW</p><h1>ダッシュボード</h1><p className="page-description">受注と対応状況を確認できます。</p></div><div className="page-actions"><span>{data ? dateLabel.format(new Date(`${data.businessDate}T00:00:00+09:00`)) : "営業管理ポータル"}</span><button className="refresh-button" type="button" disabled={busy} onClick={refresh}><span aria-hidden="true">↻</span>{busy ? "取得中…" : "更新"}</button></div></div>
      <p className="data-notice">参照用サンプル <span>表示データは架空のものです。登録や承認は行えません。</span></p>
      <div className="load-status" role="status">{busy ? "業務データを読み込んでいます…" : data ? `最終取得 ${timeLabel.format(new Date(data.generatedAt))}${error ? " · 前回取得した情報を表示中" : " · API から取得済み"}` : "データは未取得です。"}</div>
      {error && <div className="error-panel" role="alert"><strong>業務データを取得できませんでした</strong><p>{error}</p><button type="button" className="refresh-button" disabled={busy} onClick={refresh}>再読み込み</button></div>}
      <div aria-busy={busy}>
        <section className="summary-grid" aria-label="業務サマリー">
          <article className="summary-card"><div className="metric-title">受注件数<span aria-hidden="true">01</span></div><p className="metric-value">{data ? data.orderCount : "—"}<small>件</small></p><p className="metric-note">サンプル内の全受注</p></article>
          <article className="summary-card"><div className="metric-title">承認待ち<span aria-hidden="true">02</span></div><p className="metric-value metric-accent">{data ? data.pendingApprovalCount : "—"}<small>件</small></p><a className="metric-note metric-link" href="#orders" onClick={() => setFilter("pendingApproval")}>対象の受注を確認 <span aria-hidden="true">→</span></a></article>
          <article className="summary-card"><div className="metric-title">納期の確認が必要<span aria-hidden="true">03</span></div><p className="metric-value">{data ? data.dueCount : "—"}<small>件</small></p><p className="metric-note">本日以前が納期の未完了案件</p></article>
          <article className="summary-card"><div className="metric-title">当月受注金額<span aria-hidden="true">04</span></div><p className="metric-value metric-money">{data ? yen.format(data.monthlyOrderAmount) : "—"}</p><p className="metric-note">当月受付分の合計 / 税抜</p></article>
        </section>
        <div className="dashboard-grid">
          <section className="panel orders-panel" id="orders" aria-labelledby="orders-heading">
            <div className="panel-heading"><div><h2 id="orders-heading">受注一覧</h2><p>受付日の新しい順</p></div><span className="panel-meta">{data ? `${data.orderCount} 件` : "未取得"}</span></div>
            <div className="table-toolbar"><label htmlFor="status-filter">ステータス</label><select id="status-filter" value={filter} onChange={(event) => { const value = event.target.value; if (value === "all" || value === "pendingApproval" || value === "processing" || value === "completed") setFilter(value); }}><option value="all">すべて</option><option value="pendingApproval">承認待ち</option><option value="processing">手配中</option><option value="completed">完了</option></select><span>{data ? `${orders.length} 件を表示` : "—"}</span></div>
            <div className="table-scroll" tabIndex={0} role="region" aria-label="受注一覧（横スクロール可能）"><table><caption className="sr-only">受注番号、取引先、金額、担当、納期、ステータスの一覧</caption><thead><tr><th scope="col">受注番号 / 受付日</th><th scope="col">取引先 / 案件名</th><th scope="col" className="numeric">受注金額</th><th scope="col">担当</th><th scope="col">納期</th><th scope="col">ステータス</th></tr></thead><tbody>{orders.map((order) => <tr key={order.number}><td><span className="order-number">{order.number}</span><span className="cell-secondary">{shortDate(order.receivedOn)}</span></td><td><strong className="customer-name">{order.customer}</strong><span className="cell-secondary">{order.subject}</span></td><td className="numeric">{yen.format(order.amount)}</td><td>{order.owner}</td><td><span className={order.requiresAttention ? "due-date" : undefined}>{shortDate(order.dueOn)}</span>{order.requiresAttention && <span className="cell-secondary due-caption">要確認</span>}</td><td><span className={`order-status ${order.status}`}>{statusLabels[order.status]}</span></td></tr>)}</tbody></table></div>
            {orders.length === 0 && <p className="empty-state">{busy ? "一覧を取得中です。" : !data ? "データを取得できていません。再読み込みしてください。" : "該当する受注はありません。"}</p>}
            <div className="table-footer">{data ? "サンプル内の全受注を表示しています。" : "API の接続を待っています。"}</div>
          </section>
          <section className="panel attention-panel" id="attention" aria-labelledby="attention-heading"><div className="panel-heading"><div><h2 id="attention-heading">要対応の案件</h2><p>納期を確認してください</p></div><span className="count-badge">{data ? attention.length : "—"}</span></div><div className="attention-list">{attention.map((order) => <article className="attention-item" key={order.number}><div><span className="order-number">{order.number}</span><span className="attention-due">納期 {shortDate(order.dueOn)}</span></div><h3>{order.subject}</h3><p>{order.customer}</p><span className="attention-owner">担当：{order.owner} · {statusLabels[order.status]}</span></article>)}{attention.length === 0 && <p className="empty-state">{data ? "要対応の案件はありません。" : "データを取得すると表示されます。"}</p>}</div><div className="panel-footnote">納期が本日以前で、まだ完了していない受注が対象です。</div></section>
          <section className="panel notices-panel" id="notices" aria-labelledby="notices-heading"><div className="panel-heading"><div><h2 id="notices-heading">お知らせ</h2><p>営業管理部からのご案内</p></div><span className="panel-meta">{data ? `${data.notices.length} 件` : "未取得"}</span></div><div className="notices-list">{data?.notices.map((notice) => <details className="notice-item" key={notice.id}><summary><time dateTime={notice.date}>{notice.date.replaceAll("-", "/")}</time><span className="notice-category">{notice.category}</span><span className="notice-title">{notice.title}</span><span aria-hidden="true">＋</span></summary><p>{notice.body}</p></details>)}{!data && <p className="empty-state">お知らせを取得できていません。</p>}</div></section>
        </div>
      </div>
    </>
  );
}
