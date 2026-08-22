import { withClientSourceHeader } from "@/lib/requestHeaders";
import { getArabicApiErrorMessage } from "@/lib/apiErrorMessages";



type ApiFetchOptions = RequestInit & {
  skipRefreshRetry?: boolean;
};

export class ApiHttpError extends Error {
  status: number;
  body: any;

  constructor(status: number, message: string, body: any) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

let refreshInFlight: Promise<boolean> | null = null;

async function safeJsonParse(response: Response): Promise<any> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

async function callRefresh(): Promise<boolean> {
  try {
    const response = await fetch(`/api/v1/auth/refresh`, {
      method: "POST",
      headers: withClientSourceHeader({
        Accept: "application/json",
      }),
      credentials: "include",
    });
    return response.ok;
  } catch {
    return false;
  }
}

async function refreshOnceShared(): Promise<boolean> {
  if (!refreshInFlight) {
    refreshInFlight = callRefresh().finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
}

export async function apiFetch<T = any>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { skipRefreshRetry = false, headers, ...rest } = options;

  const doRequest = () =>
    fetch(path, {
      credentials: "include",
      headers: withClientSourceHeader({
        Accept: "application/json",
        ...(headers as Record<string, string>),
      }),
      ...rest,
    });

  let response = await doRequest();

  if (response.status === 401 && !skipRefreshRetry) {
    const refreshed = await refreshOnceShared();
    if (refreshed) {
      response = await doRequest();
    }
  }

  const body = await safeJsonParse(response);
  if (!response.ok) {
    const localizedMessage = getArabicApiErrorMessage(body);
    const localizedBody = body && typeof body === "object"
      ? { ...body, message: localizedMessage }
      : { success: false, message: localizedMessage };
    throw new ApiHttpError(response.status, localizedMessage, localizedBody);
  }

  return body as T;
}

