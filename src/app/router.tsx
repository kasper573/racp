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
  Redeem,
  School,
  Settings,
  Storefront,
} from "@mui/icons-material";
import * as zod from "zod";
import { UserAccessLevel } from "../api/services/user/types";
import { itemFilter } from "../api/services/item/types";
import { monsterFilter, mvpFilter } from "../api/services/monster/types";
import { mapInfoFilter } from "../api/services/map/types";
import { vendorItemFilter } from "../api/services/vendor/types";
import { skillFilter } from "../api/services/skill/types";
import { Redirect } from "../lib/tsr/react/Redirect";
import { RouterLocation } from "../lib/tsr/Route";
import { zodLiteralString } from "../lib/zod/zodLiteralString";
import { requireAuth } from "./util/requireAuth";
import { requireSettings } from "./util/requireSettings";
import { t } from "./tsr";

export const router = t.router({
  home: t.route
    .path("", { exact: true })
    .renderer(lazy(() => import("./pages/HomePage")))
    .meta({ title: "Home", icon: <Home /> }),
  user: t.route
    .path("user")
    .renderer(() => <Redirect to={router.user.settings({})} />)
    .children({
      settings: t.route
        .path("settings")
        .renderer(lazy(() => import("./pages/UserSettingsPage")))
        .meta({ title: "Settings", icon: <AccountCircle /> })
        .middleware(requireAuth(UserAccessLevel.User)),
      login: t.route
        .path("login/&:destination?")
        .params({ destination: zodLiteralString<RouterLocation>().optional() })
        .renderer(lazy(() => import("./pages/LoginPage")))
        .meta({ title: "Sign in", icon: <Login /> }),
      register: t.route
        .path("register")
        .renderer(lazy(() => import("./pages/RegisterPage")))
        .meta({ title: "Register", icon: <PersonAdd /> }),
    }),
  item: t.route
    .path("item")
    .renderer(() => <Redirect to={router.item.search({})} />)
    .meta({ title: "Items", icon: <Redeem /> })
    .children({
      search: t.route
        .path("search/:filter?")
        .params({ filter: itemFilter.type.optional() })
        .renderer(lazy(() => import("./pages/ItemSearchPage"))),
      view: t.route
        .path("view/:id")
        .params({ id: zod.number() })
        .renderer(lazy(() => import("./pages/ItemViewPage"))),
    }),
  skill: t.route
    .path("skill")
    .renderer(() => <Redirect to={router.skill.search({})} />)
    .meta({ title: "Skills", icon: <School /> })
    .children({
      search: t.route
        .path("search/:filter?")
        .params({ filter: skillFilter.type.optional() })
        .renderer(lazy(() => import("./pages/SkillSearchPage"))),
      view: t.route
        .path("view/:id")
        .params({ id: zod.number() })
        .renderer(lazy(() => import("./pages/SkillViewPage"))),
    }),
  shop: t.route
    .path("shop/view/:id")
    .params({ id: zod.string() })
    .renderer(lazy(() => import("./pages/ShopViewPage"))),
  mvp: t.route
    .path("mvp/:filter?")
    .params({ filter: mvpFilter.type.optional() })
    .renderer(lazy(() => import("./pages/MvpSearchPage")))
    .meta({ title: "Mvps", icon: <EmojiEvents /> }),
  monster: t.route
    .path("monster")
    .renderer(() => <Redirect to={router.monster.search({})} />)
    .meta({ title: "Monsters", icon: <PestControlRodent /> })
    .children({
      search: t.route
        .path("search/:filter?")
        .params({ filter: monsterFilter.type.optional() })
        .renderer(lazy(() => import("./pages/MonsterSearchPage"))),
      view: t.route
        .path("view/:id/:tab?")
        .params({ id: zod.number(), tab: zod.string().optional() })
        .renderer(lazy(() => import("./pages/MonsterViewPage"))),
    }),
  map: t.route
    .path("map")
    .renderer(() => <Redirect to={router.map.search({})} />)
    .meta({ title: "Maps", icon: <Map /> })
    .children({
      search: t.route
        .path("search/:filter?")
        .params({ filter: mapInfoFilter.type.optional() })
        .renderer(lazy(() => import("./pages/MapSearchPage"))),
      view: t.route
        .path("view/:id/:tab?&:x?&:y?&:title?")
        .params({
          id: zod.string(),
          x: zod.number().optional(),
          y: zod.number().optional(),
          title: zod.string().optional(),
          tab: zod.string().optional(),
        })
        .renderer(lazy(() => import("./pages/MapViewPage")))
        .meta({ title: "Map", icon: <Map /> }),
    }),
  vendor: t.route
    .path("vending/:filter?")
    .params({ filter: vendorItemFilter.type.optional() })
    .renderer(lazy(() => import("./pages/VendorItemSearchPage")))
    .meta({ title: "Vendings", icon: <Storefront /> }),
  donation: t.route
    .path("donation")
    .renderer(lazy(() => import("./pages/DonationsPage")))
    .meta({ title: "Donation", icon: <Paid /> })
    .middleware(requireSettings((settings) => settings.donations.enabled))
    .children({
      items: t.route
        .path("items/:filter?")
        .params({ filter: itemFilter.type.optional() })
        .renderer(lazy(() => import("./pages/DonationItemsPage"))),
    }),
  admin: t.route
    .path("admin")
    .renderer(() => <Redirect to={router.admin.settings({})} />)
    .meta({ title: "Admin", icon: <AdminPanelSettings /> })
    .middleware(requireAuth(UserAccessLevel.Admin))
    .children({
      settings: t.route
        .path("settings")
        .renderer(lazy(() => import("./pages/AdminSettingsPage")))
        .meta({ title: "Settings", icon: <Settings /> }),
      assets: t.route
        .path("assets")
        .renderer(lazy(() => import("./pages/AdminAssetsPage")))
        .meta({ title: "Assets", icon: <Image /> }),
    }),
  notFound: t.route
    .path("")
    .renderer(lazy(() => import("./pages/NotFoundPage"))),
});

export const logoutRedirect = router.user.login({});
export const loginRedirect = router.user({});
