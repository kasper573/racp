import { Box, Tooltip } from "@mui/material";
import { ReactNode } from "react";
import {
  LevelScaling,
  LevelScalingItem,
  LevelScalingValue,
} from "../../api/common/levelScaling";
import { joinNodes } from "../../lib/joinNodes";

export function renderLevelScaling<
  T extends LevelScalingValue,
  ValueProp extends string,
  ExtraProps extends Record<string, any>
>(
  ls: LevelScaling<T, ValueProp, ExtraProps>,
  valueProp: ValueProp,
  format: (
    value: T,
    item?: LevelScalingItem<T, ValueProp, ExtraProps>
  ) => ReactNode = (value) => `${value}`
) {
  if (Array.isArray(ls)) {
    return joinNodes(
      ls.map((item) => (
        <Tooltip
          title={item.Level !== undefined ? `LVL ${item.Level}` : "All levels"}
        >
          <Box component="span" sx={{ whiteSpace: "nowrap" }}>
            {format(item[valueProp], item)}
          </Box>
        </Tooltip>
      )),
      " / "
    );
  }
  return format(ls);
}
