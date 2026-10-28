# LINO 業務管理ポータル

React + TypeScript + Vite と .NET 10 Minimal API の参照専用サンプルです。
受注件数・承認待ち・納期確認対象・当月受注金額、受注一覧、お知らせを API から取得します。
日付の基準は日本時間です。企業名・受注は架空で、取得時の日付を基準に生成します。
配色は `app-color-scheme` の標準ライトテーマを使用します。OS 設定や URL パラメーターでダークテーマには切り替わりません。

## 起動

.NET 10 SDK、Node.js 24 以降、Aspire CLI が必要です。Docker は不要です。

```powershell
npm ci
aspire run
```

Visual Studio では `SampleApp.slnx` を開き、`SampleApp.AppHost` をスタートアッププロジェクトにして F5 で実行します。
Aspire ダッシュボードの `web` の URL から画面を開きます。`api` の起動後に `web` が起動します。
API の HTTPS 開発証明書を OS で信頼してください。TLS の検証は無効化していません。
単独の `npm run dev` には `API_BASE_URL` に API の URL を設定してください。

## 構成

- `SampleApp.AppHost`: API と Vite のローカル起動・接続。
- `SampleApp.Api`: Problem Details とモジュールの組み立てを行う単一 API ホスト。
- `SampleApp.ServiceDefaults`: ヘルスチェック・テレメトリー。
- `src\modules\Sales`: 受注業務。バックエンド各層とフロントエンドのダッシュボードを配置。
  - プロジェクト参照方向は Application → Domain、Infrastructure → Application / Domain、Endpoints → Application。
  - 他業務向けの公開契約がないため、空の Contracts プロジェクトは作成していません。
- `src\shared`: 共通通信・表示スタイル。

`GET /api/dashboard` は集計、全サンプル受注、お知らせを返します。`GET /health` は開発時のヘルスチェックです。
画面上のステータス絞り込みは取得済みデータに対して実行します。更新失敗時は前回取得時刻とエラーを表示します。

## 検証

```powershell
npm run build
dotnet build SampleApp.slnx
```

## 制限

認証・認可、登録・承認処理、DB・永続化は未実装です。実データを扱う本番環境として公開しないでください。
サンプルの読み取り実装は `SampleSalesReadStore` です。画面は API 障害時にサンプルデータへフォールバックしません。
