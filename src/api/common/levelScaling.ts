import * as zod from "zod";
import { ZodRawShape, ZodType } from "zod";
import { ZodTypeAny } from "zod/lib/types";

export type LevelScalingValue = number | string;

export type LevelScaling<
  T extends LevelScalingValue,
  ValueProp extends string,
  ExtraProps extends Record<string, any>
> = T | LevelScalingItem<T, ValueProp, ExtraProps>[];

export type LevelScalingItem<
  T extends LevelScalingValue,
  ValueProp extends string,
  ExtraProps extends Record<string, any>
> = { Level?: number } & Record<ValueProp, T> & ExtraProps;

export function levelScaling<
  T extends ZodType<LevelScalingValue>,
  ValueProp extends string,
  ExtraProps extends ZodRawShape
>(
  itemProp: ValueProp,
  type: T,
  extraItemProps?: ExtraProps
): ZodType<
  LevelScaling<
    zod.infer<T>,
    ValueProp,
    zod.objectOutputType<ExtraProps, ZodTypeAny>
  >
> {
  return type.or(
    zod.array(
      zod.object({
        Level: zod.number().optional(),
        [itemProp]: type,
        ...(extraItemProps ?? {}),
      })
    )
  ) as any;
}
