import * as SecureStore from "expo-secure-store";
import { create } from "zustand";

type JwtIdentity = {
  fullName: string | null;
  email: string | null;
  userId: string | null;
};

interface AuthState {
  fullName: string | null;
  email: string | null;
  is_email_verified: boolean;
  is_2fa_enabled: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  isLoggedIn: boolean;
  userId: string | null;

  // Actions
  setFullName: (name: string) => Promise<void>;
  setUserId: (userId: string) => Promise<void>;
  setEmail: (email: string) => Promise<void>;
  setIsEmailVerified: (verified: boolean) => Promise<void>;
  setIs2faEnabled: (enabled: boolean) => Promise<void>;
  setTokens: (accessToken: string, refreshToken: string) => Promise<void>;
  setAuth: (payload: any) => Promise<void>; // Bulk update helper
  initializeAuth: () => Promise<void>;
  clearAuth: () => Promise<void>;
  setIsLoggedIn: (status: boolean) => void;
}

const BASE64_CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

const decodeBase64Url = (value: string) => {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  let buffer = 0;
  let bits = 0;
  let output = "";

  for (const char of normalized) {
    if (char === "=") {
      break;
    }

    const index = BASE64_CHARS.indexOf(char);

    if (index < 0) {
      continue;
    }

    buffer = (buffer << 6) | index;
    bits += 6;

    if (bits >= 8) {
      bits -= 8;
      output += String.fromCharCode((buffer >> bits) & 0xff);
    }
  }

  return output;
};

const decodeJwtPayload = (token?: string | null) => {
  if (!token) {
    return null;
  }

  const [, payload] = token.split(".");

  if (!payload) {
    return null;
  }

  try {
    const decoded = decodeBase64Url(payload);
    const utf8Decoded = decodeURIComponent(
      decoded
        .split("")
        .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, "0")}`)
        .join(""),
    );

    return JSON.parse(utf8Decoded) as Record<string, unknown>;
  } catch {
    try {
      return JSON.parse(decodeBase64Url(payload)) as Record<string, unknown>;
    } catch {
      return null;
    }
  }
};

const readStringClaim = (
  payload: Record<string, unknown> | null,
  keys: string[],
) => {
  for (const key of keys) {
    const value = payload?.[key];

    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return null;
};

export const getAuthIdentityFromJwt = (
  token?: string | null,
): JwtIdentity => {
  const payload = decodeJwtPayload(token);
  const givenName = readStringClaim(payload, ["given_name", "firstName"]);
  const familyName = readStringClaim(payload, ["family_name", "lastName"]);
  const composedName = [givenName, familyName].filter(Boolean).join(" ");

  return {
    fullName:
      readStringClaim(payload, ["fullName", "full_name", "name"]) ||
      composedName ||
      null,
    email: readStringClaim(payload, ["email", "preferred_username"]),
    userId: readStringClaim(payload, ["userId", "user_id", "id", "sub"]),
  };
};

export const useAuthStore = create<AuthState>((set) => ({
  fullName: null,
  email: null,
  is_email_verified: false,
  is_2fa_enabled: false,
  isLoggedIn: false,
  accessToken: null,
  userId: null,
  refreshToken: null,

  setUserId: async (userId: string) => {
    set({ userId });
    await SecureStore.setItemAsync("userId", userId);
  },

  setFullName: async (name: string) => {
    set({ fullName: name });
    await SecureStore.setItemAsync("fullName", name);
  },

  setEmail: async (email: string) => {
    set({ email });
    await SecureStore.setItemAsync("email", email);
  },

  setIsEmailVerified: async (verified: boolean) => {
    set({ is_email_verified: verified });
    await SecureStore.setItemAsync("is_email_verified", String(verified));
  },

  setIs2faEnabled: async (enabled: boolean) => {
    set({ is_2fa_enabled: enabled });
    await SecureStore.setItemAsync("is_2fa_enabled", String(enabled));
  },

  setTokens: async (accessToken: string, refreshToken: string) => {
    set({ accessToken, refreshToken });
    await Promise.all([
      SecureStore.setItemAsync("userToken", accessToken),
      SecureStore.setItemAsync("refreshToken", refreshToken),
    ]);
  },

  setIsLoggedIn: (status: boolean) => {
    set({ isLoggedIn: status });
  },

  // Use this for Login/Signup to update everything in one go
  setAuth: async (payload: any) => {
    const tokenIdentity = getAuthIdentityFromJwt(payload.accessToken);
    const fullName = payload.fullName || tokenIdentity.fullName;
    const email = payload.email || tokenIdentity.email;
    const userId = payload.userId || tokenIdentity.userId;

    set({
      fullName,
      email,
      is_email_verified: payload.is_email_verified,
      is_2fa_enabled: payload.is_2fa_enabled,
      accessToken: payload.accessToken,
      refreshToken: payload.refreshToken,
      userId,
      isLoggedIn: Boolean(payload.accessToken),
    });

    await Promise.all([
      SecureStore.setItemAsync("fullName", fullName || ""),
      SecureStore.setItemAsync("email", email || ""),
      SecureStore.setItemAsync(
        "is_email_verified",
        String(payload.is_email_verified),
      ),
      SecureStore.setItemAsync(
        "is_2fa_enabled",
        String(payload.is_2fa_enabled),
      ),
      SecureStore.setItemAsync("userToken", payload.accessToken || ""),
      SecureStore.setItemAsync("refreshToken", payload.refreshToken || ""),
      SecureStore.setItemAsync("userId", userId || ""),
    ]);
  },

  initializeAuth: async () => {
    const [
      fullName,
      email,
      is_email_verified,
      is_2fa_enabled,
      accessToken,
      refreshToken,
      userId,
    ] = await Promise.all([
      SecureStore.getItemAsync("fullName"),
      SecureStore.getItemAsync("email"),
      SecureStore.getItemAsync("is_email_verified"),
      SecureStore.getItemAsync("is_2fa_enabled"),
      SecureStore.getItemAsync("userToken"),
      SecureStore.getItemAsync("refreshToken"),
      SecureStore.getItemAsync("userId"),
    ]);

    const tokenIdentity = getAuthIdentityFromJwt(accessToken);

    set({
      fullName: fullName || tokenIdentity.fullName,
      email: email || tokenIdentity.email,
      is_email_verified: is_email_verified === "true",
      is_2fa_enabled: is_2fa_enabled === "true",
      accessToken,
      refreshToken,
      isLoggedIn: accessToken ? true : false,
      userId: userId || tokenIdentity.userId,
    });
  },

  clearAuth: async () => {
    set({
      fullName: null,
      email: null,
      is_email_verified: false,
      is_2fa_enabled: false,
      accessToken: null,
      refreshToken: null,
      isLoggedIn: false,
      userId: null,
    });

    await Promise.all([
      SecureStore.deleteItemAsync("fullName"),
      SecureStore.deleteItemAsync("email"),
      SecureStore.deleteItemAsync("is_email_verified"),
      SecureStore.deleteItemAsync("is_2fa_enabled"),
      SecureStore.deleteItemAsync("userToken"),
      SecureStore.deleteItemAsync("refreshToken"),
      SecureStore.deleteItemAsync("userId"),
    ]);
  },
}));
