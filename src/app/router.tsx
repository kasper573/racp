import {
  intParser,
  OptionsRouter,
  Redirect,
  RouteMiddleware,
  stringParser,
} from "react-typesafe-routes";
import { lazy } from "react";
import {
  AccountCircle,
  AdminPanelSettings,
  Article,
  Home,
  Image,
  Login,
  Map,
  ModeEdit,
  PersonAdd,
  PestControlRodent,
  Redeem,
} from "@mui/icons-material";
import { useLocation } from "react-router-dom";
import { UserAccessLevel } from "../api/services/user/types";
import { RestrictedPage } from "./pages/RestrictedPage";
import { useGetMyProfileQuery } from "./state/client";
import { LoadingPage } from "./pages/LoadingPage";

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
  user: route(
    "user",
    { component: () => <Redirect to={router.user().settings()} /> },
    (route) => ({
      settings: route("settings", {
        component: lazy(() => import("./pages/UserSettingsPage")),
        options: { title: "Settings", icon: <AccountCircle /> },
        middleware: requireAuth(UserAccessLevel.User),
      }),
      login: route("login/&:destination?", {
        component: lazy(() => import("./pages/LoginPage")),
        options: { title: "Sign in", icon: <Login /> },
        params: { destination: stringParser },
      }),
      register: route("register", {
        component: lazy(() => import("./pages/RegisterPage")),
        options: { title: "Register", icon: <PersonAdd /> },
      }),
    })
  ),
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
  monster: route(
    "monster",
    {
      component: lazy(() => import("./pages/MonsterSearchPage")),
      options: { title: "Monsters", icon: <PestControlRodent /> },
    },
    (route) => ({
      view: route("view/:id/:tab?", {
        component: lazy(() => import("./pages/MonsterViewPage")),
        options: { title: "Monster", icon: <PestControlRodent /> },
        params: { id: intParser, tab: stringParser },
      }),
    })
  ),
  map: route(
    "map",
    {
      component: lazy(() => import("./pages/MapSearchPage")),
      options: { title: "Maps", icon: <Map /> },
    },
    (route) => ({
      view: route("view/:id/:tab?&:x?&:y?", {
        component: lazy(() => import("./pages/MapViewPage")),
        options: { title: "Map", icon: <Map /> },
        params: {
          id: stringParser,
          x: intParser,
          y: intParser,
          tab: stringParser,
        },
      }),
    })
  ),
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
      assets: route("assets", {
        component: lazy(() => import("./pages/AdminAssetsPage")),
        options: { title: "Assets", icon: <Image /> },
      }),
    })
  ),
}));

export const logoutRedirect = router.home().$;
export const loginRedirect = router.user().$;

function requireAuth(requiredAccess = UserAccessLevel.User): RouteMiddleware {
  return (next) => {
    const location = useLocation();
    const { data: profile, isFetching } = useGetMyProfileQuery();
    if (isFetching) {
      return () => <LoadingPage />;
    }
    const access = profile?.access;
    if (access === undefined) {
      return () => (
        <Redirect
          to={router.user().login({
            destination: `${location.pathname}${location.search}`,
          })}
        />
      );
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
