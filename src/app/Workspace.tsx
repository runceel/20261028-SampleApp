import { SalesDashboard } from "../modules/Sales/SalesDashboard";

export default function Workspace() {
  return (
    <div className="workspace">
      <a className="skip-link" href="#main">本文へ移動</a>
      <aside className="sidebar">
        <a className="workspace-brand" href="#main"><span className="brand-symbol" aria-hidden="true">L</span><span>LINO<span className="brand-subtitle">BUSINESS WORKSPACE</span></span></a>
        <div className="workspace-name"><span className="workspace-initial" aria-hidden="true">営</span><div>営業管理部<span>共通ワークスペース</span></div></div>
        <p className="nav-label">ワークスペース</p>
        <nav className="workspace-nav" aria-label="業務メニュー">
          <a className="current" href="#main" aria-current="page"><span aria-hidden="true">▦</span>ダッシュボード</a>
          <a href="#orders"><span aria-hidden="true">≡</span>受注一覧</a>
          <a href="#attention"><span aria-hidden="true">☑</span>要対応の案件</a>
          <a href="#notices"><span aria-hidden="true">▤</span>お知らせ</a>
        </nav>
        <div className="sidebar-note"><strong>参照用サンプル</strong><p>架空の受注データを使用しています。登録・承認機能は未実装です。</p></div>
        <div className="sidebar-footer"><span className="account-initial" aria-hidden="true">営</span><div>営業管理部<span>サンプル環境</span></div></div>
      </aside>
      <div className="workspace-main">
        <header className="workspace-topbar"><div>営業管理 <span aria-hidden="true">/</span> <strong>ダッシュボード</strong></div><span className="environment-badge">SAMPLE</span></header>
        <main className="page-content" id="main"><SalesDashboard /></main>
        <footer className="workspace-footer"><span>LINO 業務管理システム</span><span>参照専用 · 時刻・日付は日本時間</span></footer>
      </div>
    </div>
  );
}
