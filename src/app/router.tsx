import {
  intParser,
  OptionsRouter,
  Redirect,
  stringParser,
} from "react-typesafe-routes";
import { lazy } from "react";
import {
  AccountCircle,
  AdminPanelSettings,
  EmojiEvents,
  Home,
  Image,
  Login,
  Map,
  Paid,
  PersonAdd,
  PestControlRodent,
  Redeem, School,
  Settings,
  Storefront
} from "@mui/icons-material";
import { UserAccessLevel } from "../api/services/user/types";
import { zodRouteParam } from "../lib/zod/zodRouteParam";
import { itemFilter } from "../api/services/item/types";
import { monsterFilter, mvpFilter } from "../api/services/monster/types";
import { mapInfoFilter } from "../api/services/map/types";
import { vendorItemFilter } from "../api/services/vendor/types";
import { skillFilter } from "../api/services/skill/types";
import { requireAuth } from "./util/requireAuth";
import { requireSettings } from "./util/requireSettings";

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
    {
      component: () => <Redirect to={router.user().settings()} />,
    },
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
      component: () => <Redirect to={router.item().search({})} />,
      options: { title: "Items", icon: <Redeem /> },
    },
    (route) => ({
      search: route("search/:filter?", {
        component: lazy(() => import("./pages/ItemSearchPage")),
        params: { filter: zodRouteParam(itemFilter.type.default({})) },
      }),
      view: route("view/:id", {
        component: lazy(() => import("./pages/ItemViewPage")),
        params: { id: intParser },
      }),
    })
  ),
  skill: route(
    "skill",
    {
      component: () => <Redirect to={router.skill().search({})} />,
      options: { title: "Skills", icon: <School /> },
    },
    (route) => ({
      search: route("search/:filter?", {
        component: lazy(() => import("./pages/SkillSearchPage")),
        params: { filter: zodRouteParam(skillFilter.type.default({})) },
      }),
      view: route("view/:id", {
        component: lazy(() => import("./pages/SkillViewPage")),
        params: { id: intParser },
      }),
    })
  ),
  shop: route("shop/view/:id", {
    component: lazy(() => import("./pages/ShopViewPage")),
    params: { id: stringParser },
  }),
  mvp: route("mvp/:filter?", {
    component: lazy(() => import("./pages/MvpSearchPage")),
    options: { title: "Mvps", icon: <EmojiEvents /> },
    params: { filter: zodRouteParam(mvpFilter.type.default({})) },
  }),
  monster: route(
    "monster",
    {
      component: () => <Redirect to={router.monster().search({})} />,
      options: { title: "Monsters", icon: <PestControlRodent /> },
    },
    (route) => ({
      search: route("search/:filter?", {
        component: lazy(() => import("./pages/MonsterSearchPage")),
        params: { filter: zodRouteParam(monsterFilter.type.default({})) },
      }),
      view: route("view/:id/:tab?", {
        component: lazy(() => import("./pages/MonsterViewPage")),
        params: { id: intParser, tab: stringParser },
      }),
    })
  ),
  map: route(
    "map",
    {
      component: () => <Redirect to={router.map().search({})} />,
      options: { title: "Maps", icon: <Map /> },
    },
    (route) => ({
      search: route("search/:filter?", {
        component: lazy(() => import("./pages/MapSearchPage")),
        params: { filter: zodRouteParam(mapInfoFilter.type.default({})) },
      }),
      view: route("view/:id/:tab?&:x?&:y?&:title?", {
        component: lazy(() => import("./pages/MapViewPage")),
        options: { title: "Map", icon: <Map /> },
        params: {
          id: stringParser,
          x: intParser,
          y: intParser,
          title: stringParser,
          tab: stringParser,
        },
      }),
    })
  ),
  vendor: route("vending/:filter?", {
    component: lazy(() => import("./pages/VendorItemSearchPage")),
    params: { filter: zodRouteParam(vendorItemFilter.type.default({})) },
    options: { title: "Vendings", icon: <Storefront /> },
  }),
  donation: route(
    "donation",
    {
      component: lazy(() => import("./pages/DonationsPage")),
      options: { title: "Donations", icon: <Paid /> },
      middleware: requireSettings((settings) => settings.donations.enabled),
    },
    (route) => ({
      items: route("items/:filter?", {
        component: lazy(() => import("./pages/DonationItemsPage")),
        params: { filter: zodRouteParam(itemFilter.type.default({})) },
      }),
    })
  ),
  admin: route(
    "admin",
    {
      component: () => <Redirect to={router.admin().settings()} />,
      options: { title: "Admin", icon: <AdminPanelSettings /> },
      middleware: requireAuth(UserAccessLevel.Admin),
    },
    (route) => ({
      settings: route("settings", {
        component: lazy(() => import("./pages/AdminSettingsPage")),
        options: { title: "Settings", icon: <Settings /> },
      }),
      assets: route("assets", {
        component: lazy(() => import("./pages/AdminAssetsPage")),
        options: { title: "Assets", icon: <Image /> },
      }),
    })
  ),
  notFound: route("*", {
    component: lazy(() => import("./pages/NotFoundPage")),
  }),
}));

export const logoutRedirect = router.user().login({}).$;
export const loginRedirect = router.user().$;

export type RouterOptions = typeof defaultOptions;

export interface AnyRouteNode<Arg = any> {
  (arg: Arg): { $: string };
  options: RouterOptions;
}
