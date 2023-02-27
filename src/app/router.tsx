import {
  AccountCircle,
  AdminPanelSettings,
  EmojiEvents,
  Image,
  ImageSearch,
  Info,
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
import { UserAccessLevel, userProfileFilter } from "../api/services/user/types";
import { itemFilter, itemSearchTypes } from "../api/services/item/types";
import {
  monsterSearchTypes,
  mvpSearchTypes,
} from "../api/services/monster/types";
import { mapInfoSearchTypes } from "../api/services/map/types";
import { vendorItemSearchTypes } from "../api/services/vendor/types";
import { skillSearchTypes } from "../api/services/skill/types";
import { zodLiteralString } from "../lib/zod/zodLiteralString";
import { RouteLocation } from "../lib/tsr/types";
import { huntType } from "../../prisma/zod";
import { Router } from "../lib/tsr/Router";
import { requireAuth } from "./util/requireAuth";
import { requireSettings } from "./util/requireSettings";
import { t } from "./tsr";
import { mapViewRoute } from "./pages/MapViewPage/route";
import { enhancedLazyComponent as lazy } from "./util/enhancedLazyComponent";
import { Layout } from "./layout/Layout";

export const router = new Router(
  t.route.renderer(Layout).children({
    home: t.route
      .path("", { exact: true })
      .renderer(lazy(() => import("./pages/HomePage"))),
    user: t.route
      .path("user", { exact: true })
      .mirror((): RouteLocation => routes.user.settings.$({}))
      .children({
        settings: t.route
          .path("settings")
          .renderer(lazy(() => import("./pages/UserSettingsPage")))
          .meta({ title: "Settings", icon: <AccountCircle /> })
          .use(requireAuth(UserAccessLevel.User)),
        login: t.route
          .path("login/:destination?")
          .params({ destination: zodLiteralString<RouteLocation>().optional() })
          .renderer(lazy(() => import("./pages/LoginPage")))
          .meta({ title: "Sign in", icon: <Login /> }),
        register: t.route
          .path("register")
          .renderer(lazy(() => import("./pages/RegisterPage")))
          .meta({ title: "Register", icon: <PersonAdd /> }),
      }),
    item: t.route
      .path("item", { exact: true })
      .mirror((): RouteLocation => routes.item.search.$({}))
      .meta({ title: "Items", icon: <Redeem /> })
      .children({
        search: t.route
          .path("search/:query?")
          .params({ query: itemSearchTypes.query.optional() })
          .renderer(lazy(() => import("./pages/ItemSearchPage"))),
        view: t.route
          .path("view/:id")
          .params({ id: zod.number() })
          .renderer(lazy(() => import("./pages/ItemViewPage"))),
      }),
    skill: t.route
      .path("skill", { exact: true })
      .mirror((): RouteLocation => routes.skill.search.$({}))
      .meta({ title: "Skills", icon: <School /> })
      .children({
        search: t.route
          .path("search/:query?")
          .params({ query: skillSearchTypes.query.optional() })
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
      .path("mvp/:query?")
      .params({ query: mvpSearchTypes.query.optional() })
      .renderer(lazy(() => import("./pages/MvpSearchPage")))
      .meta({ title: "Mvps", icon: <EmojiEvents /> }),
    monster: t.route
      .path("monster", { exact: true })
      .mirror((): RouteLocation => routes.monster.search.$({}))
      .meta({ title: "Monsters", icon: <PestControlRodent /> })
      .children({
        search: t.route
          .path("search/:query?")
          .params({ query: monsterSearchTypes.query.optional() })
          .renderer(lazy(() => import("./pages/MonsterSearchPage"))),
        view: t.route
          .path("view/:id/:tab")
          .params({
            id: zod.number(),
            tab: zod.enum(["spawns", "drops"]).default("spawns"),
          })
          .renderer(lazy(() => import("./pages/MonsterViewPage"))),
      }),
    map: t.route
      .path("map", { exact: true })
      .mirror((): RouteLocation => routes.map.search.$({}))
      .meta({ title: "Maps", icon: <Map /> })
      .children({
        search: t.route
          .path("search/:query?")
          .params({ query: mapInfoSearchTypes.query.optional() })
          .renderer(lazy(() => import("./pages/MapSearchPage"))),
        view: mapViewRoute,
      }),
    vendor: t.route
      .path("vending/:query?")
      .params({ query: vendorItemSearchTypes.query.optional() })
      .renderer(lazy(() => import("./pages/VendorItemSearchPage")))
      .meta({ title: "Vendings", icon: <Storefront /> }),
    donation: t.route
      .path("donation")
      .meta({ title: "Donations", icon: <Paid /> })
      .mirror((): RouteLocation => routes.donation.donate.$({}))
      .use(requireSettings((settings) => settings.donations.enabled))
      .children({
        donate: t.route
          .path("", { exact: true })
          .renderer(lazy(() => import("./pages/DonationsPage"))),
        items: t.route
          .path("items/:filter?")
          .params({ filter: itemFilter.type.optional() })
          .meta({ title: "Items" })
          .renderer(lazy(() => import("./pages/DonationItemsPage"))),
      }),
    serverInfo: t.route
      .path("serverinfo")
      .renderer(lazy(() => import("./pages/ServerInfoPage")))
      .meta({ title: "Server Info", icon: <Info /> }),
    tools: t.route
      .path("tools")
      .meta({ title: "Tools" })
      .children({
        hunt: t.route
          .path("hunt", { exact: true })
          .mirror((): RouteLocation => routes.tools.hunt.list.$({}))
          .meta({ title: "Hunt", icon: <ImageSearch /> })
          .children({
            list: t.route
              .path("list")
              .renderer(
                lazy(() => import("./pages/HuntToolPage/HuntListPage"))
              ),
            view: t.route
              .path(":id")
              .params({ id: huntType.shape.id })
              .renderer(
                lazy(() => import("./pages/HuntToolPage/View/HuntViewPage"))
              ),
          }),
      }),
    admin: t.route
      .path("admin", { exact: true })
      .mirror((): RouteLocation => routes.admin.settings.$({}))
      .meta({ title: "Admin", icon: <AdminPanelSettings /> })
      .use(requireAuth(UserAccessLevel.Admin))
      .children({
        settings: t.route
          .path("settings")
          .renderer(lazy(() => import("./pages/AdminSettingsPage")))
          .meta({ title: "Settings", icon: <Settings /> }),
        assets: t.route
          .path("assets")
          .renderer(lazy(() => import("./pages/AdminAssetsPage")))
          .meta({ title: "Assets", icon: <Image /> }),
        users: t.route
          .path("users/:filter?")
          .params({ filter: userProfileFilter.type.optional() })
          .renderer(lazy(() => import("./pages/AdminUsersPage")))
          .meta({ title: "Users", icon: <AccountCircle /> }),
      }),
    notFound: t.route
      .path("")
      .renderer(lazy(() => import("./pages/NotFoundPage"))),
  })
);

export const routes = router.routes;

export const logoutRedirect = routes.user.login({});
export const loginRedirect = routes.user({});
