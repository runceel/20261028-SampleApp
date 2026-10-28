export class ApiError extends Error {
  constructor(message: string, public readonly status: number, public readonly traceId?: string) {
    super(message);
    this.name = "ApiError";
  }
}

export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function apiFetch(url: string, signal?: AbortSignal): Promise<Response> {
  let response: Response;
  try {
    response = await fetch(url, { signal, headers: { Accept: "application/json" } });
  } catch (error) {
    if (signal?.aborted) throw error;
    throw new ApiError("API に接続できませんでした。接続状況を確認し、再読み込みしてください。", 0);
  }
  if (response.ok) return response;

  let payload: unknown;
  try {
    payload = await response.json();
  } catch (error) {
    if (signal?.aborted) throw error;
    throw new ApiError(`データの取得に失敗しました (HTTP ${response.status})。`, response.status);
  }
  const problem = isObject(payload) ? payload : {};
  const message = response.status >= 500
    ? "サーバーでエラーが発生しました。時間をおいて再度お試しください。"
    : typeof problem.title === "string" ? problem.title : `データの取得に失敗しました (HTTP ${response.status})。`;
  throw new ApiError(message, response.status, typeof problem.traceId === "string" ? problem.traceId : undefined);
}

export function errorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : "データを読み込めませんでした。再読み込みしてください。";
}
