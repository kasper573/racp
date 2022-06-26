import {
  OptionsRouter,
  RouteMiddleware,
  Redirect,
  stringParser,
} from "react-typesafe-routes";
import { lazy } from "react";
import { useAppSelector } from "./store";
import { selectIsAuthenticated } from "./slices/auth";

const AuthMiddleware: RouteMiddleware = (next) => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  return isAuthenticated ? next : () => <Redirect to={router.login()} />;
};

export const router = OptionsRouter({}, (route) => ({
  home: route("", {
    component: lazy(() => import("./pages/HomePage")),
    exact: true,
  }),
  login: route("login", {
    component: lazy(() => import("./pages/LoginPage")),
  }),
  admin: route(
    "admin",
    {
      component: lazy(() => import("./pages/AdminPage")),
      middleware: AuthMiddleware,
    },
    (route) => ({
      config: route(
        "config",
        { component: lazy(() => import("./pages/AdminConfigPage")) },
        (route) => ({
          edit: route("edit/&:configName", {
            component: lazy(() => import("./pages/AdminConfigEditPage")),
            params: { configName: stringParser },
          }),
        })
      ),
    })
  ),
}));
