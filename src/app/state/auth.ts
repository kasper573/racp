import { useHistory } from "react-router";
import { History } from "history";
import { createStore, useStore } from "zustand";
import { persist } from "zustand/middleware";
import { useCallback } from "react";
import { loginRedirect, logoutRedirect } from "../router";
import { trpc } from "./client";

export const authStore = createStore<{
  token?: string;
  setToken: (token?: string) => void;
}>()(
  persist(
    (set) => ({
      token: undefined,
      setToken: (token) => set((state) => ({ ...state, token })),
    }),
    { name: "auth" }
  )
);

export function useLogin(destination = loginRedirect) {
  const auth = useStore(authStore);
  const history = useHistory();
  const { mutateAsync, ...rest } = trpc.user.login.useMutation();
  async function login(...payload: Parameters<typeof mutateAsync>) {
    let token: string;
    try {
      token = await mutateAsync(...payload);
    } catch {
      return;
    }
    auth.setToken(token);
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
  authStore.getState().setToken(undefined);
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
