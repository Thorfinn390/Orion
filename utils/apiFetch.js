import * as SecureStore from "expo-secure-store";
import { useAuthStore } from "../stores/useAuthStore";

const BASE_URL = `http://${process.env.EXPO_PUBLIC_BACKEND_URL}`;

export const apiFetch = async (endpoint, options = {}) => {
  const accessToken = await SecureStore.getItemAsync("userToken");

  const defaultHeaders = {
    "Content-Type": "application/json",
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  };

  const config = {
    ...options,
    headers: { ...defaultHeaders, ...options.headers },
  };

  let response = await fetch(`${BASE_URL}${endpoint}`, config);

  //Check for expired token
  if (response.status === 403 || response.status === 401) {
    const refreshToken = await SecureStore.getItemAsync("refreshToken");

    if (refreshToken) {
      const refreshResponse = await fetch(`${BASE_URL}/auth/refresh-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      console.log("Refresh status:", refreshResponse.status);

      if (refreshResponse.ok) {
        const data = await refreshResponse.json();
        await SecureStore.setItemAsync("userToken", data.accessToken);

        config.headers["Authorization"] = `Bearer ${data.accessToken}`;
        response = await fetch(`${BASE_URL}${endpoint}`, config);
      } else if (
        refreshResponse.status === 401 ||
        refreshResponse.status === 403
      ) {
        // The server explicitly rejected the Refresh Token.
        // This means the 7 days are up or the token was expired or invalid.
        useAuthStore.getState().clearAuth();
      } else {
        console.warn(
          "Refresh failed due to server or network error. Keeping session.",
        );
      }
    }
  }

  return response;
};
