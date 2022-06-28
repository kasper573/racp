import {
  OptionsRouter,
  RouteMiddleware,
  Redirect,
  stringParser,
  intParser,
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

const AuthMiddleware: RouteMiddleware = (next) => {
  const isAuthenticated = useAppSelector(({ auth }) => !!auth.token);
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
  item: route(
    "item",
    {
      component: lazy(() => import("./pages/ItemSearchPage")),
      options: { title: "Items", icon: <Redeem /> },
    },
    (route) => ({
      view: route("view/:id", {
        component: lazy(() => import("./pages/ItemViewPage")),
        options: { title: "Item", icon: <Redeem /> },
        params: { id: intParser },
      }),
    })
  ),
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
            options: { title: "Edit", icon: <ModeEdit /> },
            params: { configName: stringParser },
          }),
        })
      ),
    })
  ),
}));

export type RouterOptions = typeof defaultOptions;
export interface AnyRouteNode<Arg = void> {
  (arg: Arg): { $: string };
  options: RouterOptions;
}
