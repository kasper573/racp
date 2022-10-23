import { Tooltip } from "@mui/material";
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
          <span>{format(item[valueProp], item)}</span>
        </Tooltip>
      )),
      " / "
    );
  }
  return format(ls);
}
