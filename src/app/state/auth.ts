import { History } from "history";
import { createStore, useStore } from "zustand";
import { persist } from "zustand/middleware";
import { useCallback } from "react";
import { loginRedirect, logoutRedirect } from "../router";
import { UserProfile } from "../../api/services/user/types";
import { useHistory } from "../../lib/tsr/react/useHistory";
import { trpc } from "./client";

export const authStore = createStore<{
  token?: string;
  profile?: UserProfile;
  setToken: (token?: string) => void;
  setProfile: (profile?: UserProfile) => void;
}>()(
  persist(
    (set) => ({
      setToken: (token) => set((state) => ({ ...state, token })),
      setProfile: (profile) => set((state) => ({ ...state, profile })),
    }),
    { name: "auth" }
  )
);

export function useLogin(destination = loginRedirect) {
  const auth = useStore(authStore);
  const history = useHistory();
  const { mutateAsync, ...rest } = trpc.user.login.useMutation();
  async function login(...payload: Parameters<typeof mutateAsync>) {
    try {
      const { token, profile } = await mutateAsync(...payload);
      auth.setToken(token);
      auth.setProfile(profile);
    } catch {
      return;
    }
    history.push(destination ?? loginRedirect);
  }
  return [login, rest] as const;
}

export function useLogout() {
  const history = useHistory();
  const logoutWithEmbeddedHistory = useCallback(
    () => logout(history),
    [history]
  );
  return logoutWithEmbeddedHistory;
}

export function logout(history: History) {
  const state = authStore.getState();
  state.setToken(undefined);
  state.setProfile(undefined);
  localStorage.removeItem("auth");
  history.push(logoutRedirect);
}

export function setupAuthBehavior<State>({
  history,
  onTokenChanged,
  interval = 1000,
}: {
  history: History;
  onTokenChanged?: () => void;
  interval?: number;
}) {
  const getToken = () => authStore.getState().token;

  // Logout when token expires
  const intervalId = setInterval(() => {
    const token = getToken();
    if (token && isTokenExpired(token)) {
      logout(history);
    }
  }, interval);

  let prevToken = getToken();
  const unsubscribe = authStore.subscribe(() => {
    const newToken = getToken();
    if (newToken !== prevToken) {
      prevToken = newToken;
      onTokenChanged?.();
    }
  });

  return () => {
    clearInterval(intervalId);
    unsubscribe();
  };
}

function isTokenExpired(token: string) {
  const expiry = JSON.parse(atob(token.split(".")[1])).exp;
  return Math.floor(new Date().getTime() / 1000) >= expiry;
}
