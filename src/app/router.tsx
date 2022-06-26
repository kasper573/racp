import {
  OptionsRouter,
  RouteMiddleware,
  Redirect,
  stringParser,
} from "react-typesafe-routes";
import { lazy } from "react";
import {
  AdminPanelSettings,
  Article,
  Home,
  Login,
  ModeEdit,
  PestControlRodent,
  Redeem,
} from "@mui/icons-material";
import { useAppSelector } from "./store";
import { selectIsAuthenticated } from "./state/auth";

const AuthMiddleware: RouteMiddleware = (next) => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  return isAuthenticated ? next : () => <Redirect to={router.login()} />;
};

const defaultOptions = {
  title: "",
  icon: <></>,
};

export const router = OptionsRouter(defaultOptions, (route) => ({
  home: route("", {
    component: lazy(() => import("./pages/HomePage")),
    options: { title: "Home", icon: <Home /> },
    exact: true,
  }),
  login: route("login", {
    component: lazy(() => import("./pages/LoginPage")),
    options: { title: "Sign in", icon: <Login /> },
  }),
  item: route("item", {
    component: lazy(() => import("./pages/ItemSearchPage")),
    options: { title: "Items", icon: <Redeem /> },
  }),
  monster: route("monster", {
    component: lazy(() => import("./pages/MonsterSearchPage")),
    options: { title: "Monsters", icon: <PestControlRodent /> },
  }),
  admin: route(
    "admin",
    {
      component: lazy(() => import("./pages/AdminPage")),
      options: { title: "Admin", icon: <AdminPanelSettings /> },
      middleware: AuthMiddleware,
    },
    (route) => ({
      config: route(
        "config",
        {
          component: lazy(() => import("./pages/AdminConfigPage")),
          options: { title: "Config", icon: <Article /> },
        },
        (route) => ({
          edit: route("edit/&:configName", {
            component: lazy(() => import("./pages/AdminConfigEditPage")),
            options: { title: "Edit" },
            params: { configName: stringParser, icon: <ModeEdit /> },
          }),
        })
      ),
    })
  ),
}));

export type RouterOptions = typeof defaultOptions;
export interface AnyRouteNode {
  (): { $: string };
  options: RouterOptions;
}
