import * as zod from "zod";
import { lazy } from "react";
import { Map } from "@mui/icons-material";
import { t } from "../../tsr";

export type MapTab = zod.infer<typeof mapTabType>;
const mapTabType = zod.enum(["warps", "monsters", "shops", "npcs"]);

const params = zod.object({
  id: zod.string(),
  tab: mapTabType.default("warps"),
  pin: zod
    .object({
      title: zod.string(),
      x: zod.number(),
      y: zod.number(),
    })
    .partial()
    .optional(),
});

export type MapViewParams = zod.input<typeof params>;

export const mapViewRoute = t.route
  .path("view/:id/:tab/:pin?")
  .params(params.shape)
  .renderer(lazy(() => import("./index")))
  .meta({ title: "Map", icon: <Map /> });
