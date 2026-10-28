import { ApiError, apiFetch, isObject } from "../../shared/api";

export type OrderStatus = "pendingApproval" | "processing" | "completed";
export type Order = {
  number: string;
  customer: string;
  subject: string;
  owner: string;
  amount: number;
  receivedOn: string;
  dueOn: string;
  status: OrderStatus;
  requiresAttention: boolean;
};
export type Notice = { id: string; date: string; category: string; title: string; body: string };
export type Dashboard = {
  generatedAt: string;
  businessDate: string;
  isSampleData: boolean;
  orderCount: number;
  pendingApprovalCount: number;
  dueCount: number;
  monthlyOrderAmount: number;
  orders: Order[];
  notices: Notice[];
};

const isDate = (value: unknown): value is string =>
  typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value));
const isCount = (value: unknown): value is number => typeof value === "number" && Number.isInteger(value) && value >= 0;
const isAmount = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value) && value >= 0;

function isOrder(value: unknown): value is Order {
  return isObject(value) && typeof value.number === "string" && typeof value.customer === "string"
    && typeof value.subject === "string" && typeof value.owner === "string" && isAmount(value.amount)
    && isDate(value.receivedOn) && isDate(value.dueOn) && typeof value.requiresAttention === "boolean"
    && (value.status === "pendingApproval" || value.status === "processing" || value.status === "completed");
}

function isNotice(value: unknown): value is Notice {
  return isObject(value) && typeof value.id === "string" && isDate(value.date)
    && typeof value.category === "string" && typeof value.title === "string" && typeof value.body === "string";
}

function isDashboard(value: unknown): value is Dashboard {
  return isObject(value) && typeof value.generatedAt === "string" && Number.isFinite(Date.parse(value.generatedAt))
    && isDate(value.businessDate) && typeof value.isSampleData === "boolean"
    && isCount(value.orderCount) && isCount(value.pendingApprovalCount) && isCount(value.dueCount)
    && isAmount(value.monthlyOrderAmount) && Array.isArray(value.orders) && value.orders.every(isOrder)
    && Array.isArray(value.notices) && value.notices.every(isNotice);
}

export async function getDashboard(signal: AbortSignal): Promise<Dashboard> {
  const response = await apiFetch("/api/dashboard", signal);
  let payload: unknown;
  try {
    payload = await response.json();
  } catch (error) {
    if (signal.aborted) throw error;
    throw new ApiError("API の応答を読み取れませんでした。API の起動とプロキシ設定を確認してください。", response.status);
  }
  if (!isDashboard(payload)) {
    throw new ApiError("API のデータ形式が正しくありません。システム管理者にお問い合わせください。", response.status);
  }
  return payload;
}
