import * as zod from "zod";
import {
  addIssueToContext,
  INVALID,
  ParseInput,
  ParseReturnType,
  ZodRawShape,
  ZodType,
  ZodTypeAny,
  ZodTypeDef,
} from "zod";
import { chainParse } from "./chainParse";

type RawArrayEntity = zod.infer<typeof rawArrayEntity>;
const rawArrayEntity = zod.array(zod.array(zod.any()));

export class ZodArrayEntity<Shapes extends ArrayEntityShapes> extends ZodType<
  ArrayEntity<Shapes>,
  ZodTypeDef,
  RawArrayEntity
> {
  constructor(private shapes: Shapes) {
    super({});
  }

  _parse(input: ParseInput): ParseReturnType<ArrayEntity<Shapes>> {
    const array = chainParse(rawArrayEntity, this, input);
    if (array.status !== "valid") {
      return array as ParseReturnType<ArrayEntity<Shapes>>;
    }

    const entity = {} as ArrayEntity<Shapes>;
    const context = this._getOrReturnCtx(input);

    if (array.value.length !== this.shapes.length) {
      addIssueToContext(context, {
        code: "custom",
        message: `Array must contain exactly ${this.shapes.length} elements`,
      });
      return INVALID;
    }

    for (const p in this.shapes) {
      const part = array.value[p];
      const shape = this.shapes[p];
      const types = Object.values(shape);
      const names = Object.keys(shape);
      for (const i in types) {
        const name = names[i] as keyof ArrayEntity<Shapes>;
        const item = part[i];
        const type = types[i];
        const res = type.safeParse(item);
        if (res.success) {
          entity[name] = res.data;
        } else {
          for (const issue of res.error.issues) {
            addIssueToContext(context, {
              ...issue,
              path: [+p, +i],
            });
          }
        }
      }
    }

    if (context.common.issues.length) {
      return INVALID;
    }

    return {
      status: "valid",
      value: entity,
    };
  }
}

export type ArrayEntityShapes = [ZodRawShape, ...ZodRawShape[]];

export type ArrayEntity<Shapes extends ArrayEntityShapes> = inferZodRecord<
  UnionToIntersection<Shapes[number]>
>;

type inferZodRecord<T> = {
  [K in keyof T]: T[K] extends ZodTypeAny ? zod.infer<T[K]> : never;
};

type UnionToIntersection<U> =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (U extends any ? (k: U) => void : never) extends (k: infer I) => void
    ? I
    : never;
