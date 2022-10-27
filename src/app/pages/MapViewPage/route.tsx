import * as zod from "zod";
import { lazy } from "react";
import { Map } from "@mui/icons-material";
import { t } from "../../tsr";

const params = zod.object({
  id: zod.string(),
  x: zod.number().optional(),
  y: zod.number().optional(),
  title: zod.string().optional(),
  tab: zod.string().optional(),
});

export type MapViewParams = zod.infer<typeof params>;

export const mapViewRoute = t.route
  .path("view/:id/:tab?&:x?&:y?&:title?")
  .params(params.shape)
  .renderer(lazy(() => import("./index")))
  .meta({ title: "Map", icon: <Map /> });
