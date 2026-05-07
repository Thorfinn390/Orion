import { apiFetch } from "@/utils/apiFetch";

export type ApiPayload<T = unknown> = {
  status?: boolean;
  message?: string;
  error?: string;
  data?: T;
};

export type SecurityStatus = {
  is_2fa_enabled?: boolean;
};

export type PasswordPayload = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

const QUICK_REQUEST_TIMEOUT_MS = 15000;
const PASSWORD_REQUEST_TIMEOUT_MS = 30000;
const EMAIL_REQUEST_TIMEOUT_MS = 120000;
const USER_ROUTE = "/user";

export const SECURITY_ENDPOINTS = {
  changePassword: `${USER_ROUTE}/change-password`,
  enable2FA: `${USER_ROUTE}/enable-2fa`,
  enable2FAConfirm: `${USER_ROUTE}/confirm-2fa`,
  disable2FA: `${USER_ROUTE}/disable-2fa`,
  disable2FAConfirm: `${USER_ROUTE}/confirm-disable-2fa`,
  accountDeletion: `${USER_ROUTE}/request-account-deletion`,
};

export class SecurityApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "SecurityApiError";
    this.status = status;
  }
}

const apiFetchWithTimeout = async (
  endpoint: string,
  options: RequestInit = {},
  timeoutMs = QUICK_REQUEST_TIMEOUT_MS,
) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return (await apiFetch(endpoint, {
      ...options,
      signal: controller.signal,
    })) as Response;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new SecurityApiError(
        "The server is taking longer than expected. Please try again.",
      );
    }

    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
};

export const readApiPayload = async <T = unknown>(
  response: Response,
): Promise<ApiPayload<T>> => {
  const rawBody = await response.text();

  if (!rawBody) {
    return {};
  }

  try {
    return JSON.parse(rawBody) as ApiPayload<T>;
  } catch {
    return {
      status: response.ok,
      message: rawBody,
    };
  }
};

const assertApiSuccess = <T>(
  response: Response,
  payload: ApiPayload<T>,
  fallbackMessage: string,
) => {
  if (!response.ok || payload.status === false) {
    const responseMessage = payload.message || payload.error;
    const isExpressMissingRoute =
      typeof responseMessage === "string" &&
      /^Cannot\s+(GET|POST|PUT|PATCH|DELETE)\s+/i.test(responseMessage);

    throw new SecurityApiError(
      isExpressMissingRoute ? fallbackMessage : responseMessage || fallbackMessage,
      response.status,
    );
  }
};

export const fetchSecurityStatus = async (_userId: string) => {
  // users.controller.getUser exists, but no users.routes.js revision exposes it.
  // The current screen keeps using the auth store as the source of truth for 2FA state.
  return {} as SecurityStatus;
};

export const changeAccountPassword = async (passwords: PasswordPayload) => {
  const response = await apiFetchWithTimeout(
    SECURITY_ENDPOINTS.changePassword,
    {
      method: "PATCH",
      body: JSON.stringify(passwords),
    },
    PASSWORD_REQUEST_TIMEOUT_MS,
  );
  const payload = await readApiPayload(response);

  assertApiSuccess(response, payload, "Unable to update your password.");

  return payload;
};

export const startTwoFactorChange = async (nextEnabled: boolean) => {
  console.log("Starting two-factor change. Next enabled:", nextEnabled);
  // const response = await apiFetchWithTimeout(
  //   nextEnabled ? SECURITY_ENDPOINTS.enable2FA : SECURITY_ENDPOINTS.disable2FA,
  //   {
  //     method: "POST",
  //   },
  //   EMAIL_REQUEST_TIMEOUT_MS,
  // );
  const response = await apiFetchWithTimeout(
    nextEnabled ? SECURITY_ENDPOINTS.enable2FA : SECURITY_ENDPOINTS.disable2FA,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json", // Ensure backend knows it's JSON
      },
      body: JSON.stringify({}), // <-- ADD THIS: Forces React Native to send the POST request correctly
    },
    EMAIL_REQUEST_TIMEOUT_MS,
  );
  console.log("Two-factor change response:", response);
  const payload = await readApiPayload(response);

  assertApiSuccess(
    response,
    payload,
    nextEnabled
      ? "Two-factor setup is not connected on the backend yet."
      : "Two-factor disable is not connected on the backend yet.",
  );

  return payload;
};

export const confirmTwoFactorChange = async (
  nextEnabled: boolean,
  otp: string,
) => {
  const response = await apiFetchWithTimeout(
    nextEnabled
      ? SECURITY_ENDPOINTS.enable2FAConfirm
      : SECURITY_ENDPOINTS.disable2FAConfirm,
    {
      method: "POST",
      body: JSON.stringify({ otp }),
    },
  );
  const payload = await readApiPayload(response);

  assertApiSuccess(
    response,
    payload,
    nextEnabled
      ? "Unable to confirm two-factor setup."
      : "Unable to confirm two-factor disable flow.",
  );

  return payload;
};

export const requestAccountDeletion = async () => {
  const response = await apiFetchWithTimeout(
    SECURITY_ENDPOINTS.accountDeletion,
    {
      method: "POST",
    },
    EMAIL_REQUEST_TIMEOUT_MS,
  );
  const payload = await readApiPayload(response);

  assertApiSuccess(response, payload, "Unable to request account deletion.");

  return payload;
};
