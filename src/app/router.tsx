import {
  intParser,
  OptionsRouter,
  Redirect,
  RouteMiddleware,
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
import { UserAccessLevel } from "../api/services/auth/auth.types";
import { useAppSelector } from "./store";
import { RestrictedPage } from "./pages/RestrictedPage";

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
      middleware: requireAuth(UserAccessLevel.Admin),
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

function requireAuth(requiredAccess = UserAccessLevel.User): RouteMiddleware {
  return (next) => {
    const access = useAppSelector(({ auth }) => auth.user?.access);
    if (access === undefined) {
      return () => <Redirect to={router.login()} />;
    }
    if (access < requiredAccess) {
      return () => <RestrictedPage />;
    }
    return next;
  };
}

export type RouterOptions = typeof defaultOptions;

export interface AnyRouteNode<Arg = void> {
  (arg: Arg): { $: string };
  options: RouterOptions;
}
