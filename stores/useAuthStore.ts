import * as SecureStore from "expo-secure-store";
import { create } from "zustand";

interface AuthState {
  fullName: string | null;
  email: string | null;
  is_email_verified: boolean;
  is_2fa_enabled: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  // Actions
  setFullName: (name: string) => Promise<void>;
  setEmail: (email: string) => Promise<void>;
  setIsEmailVerified: (verified: boolean) => Promise<void>;
  setIs2faEnabled: (enabled: boolean) => Promise<void>;
  setTokens: (accessToken: string, refreshToken: string) => Promise<void>;
  setAuth: (payload: any) => Promise<void>; // Bulk update helper
  initializeAuth: () => Promise<void>;
  clearAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  fullName: null,
  email: null,
  is_email_verified: false,
  is_2fa_enabled: false,
  accessToken: null,
  refreshToken: null,

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

  // Use this for Login/Signup to update everything in one go
  setAuth: async (payload: any) => {
    set({
      fullName: payload.fullName,
      email: payload.email,
      is_email_verified: payload.is_email_verified,
      is_2fa_enabled: payload.is_2fa_enabled,
      accessToken: payload.accessToken,
      refreshToken: payload.refreshToken,
    });

    await Promise.all([
      SecureStore.setItemAsync("fullName", payload.fullName || ""),
      SecureStore.setItemAsync("email", payload.email || ""),
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
    ] = await Promise.all([
      SecureStore.getItemAsync("fullName"),
      SecureStore.getItemAsync("email"),
      SecureStore.getItemAsync("is_email_verified"),
      SecureStore.getItemAsync("is_2fa_enabled"),
      SecureStore.getItemAsync("userToken"),
      SecureStore.getItemAsync("refreshToken"),
    ]);

    set({
      fullName,
      email,
      is_email_verified: is_email_verified === "true",
      is_2fa_enabled: is_2fa_enabled === "true",
      accessToken,
      refreshToken,
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
    });

    await Promise.all([
      SecureStore.deleteItemAsync("fullName"),
      SecureStore.deleteItemAsync("email"),
      SecureStore.deleteItemAsync("is_email_verified"),
      SecureStore.deleteItemAsync("is_2fa_enabled"),
      SecureStore.deleteItemAsync("userToken"),
      SecureStore.deleteItemAsync("refreshToken"),
    ]);
  },
}));
