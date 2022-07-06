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

    for (const shapeIndex in this.shapes) {
      const shapeValues = array.value[shapeIndex];
      const shape = this.shapes[shapeIndex];
      const propTypes = Object.values(shape);
      const propNames = Object.keys(shape);
      for (const propIndex in propTypes) {
        const propName = propNames[propIndex] as keyof ArrayEntity<Shapes>;
        const propValue = shapeValues[propIndex];
        const propType = propTypes[propIndex];
        const parseResult = propType.safeParse(propValue);
        if (parseResult.success) {
          entity[propName] = parseResult.data;
        } else {
          for (const issue of parseResult.error.issues) {
            addIssueToContext(context, {
              ...issue,
              path: [+shapeIndex, +propIndex],
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
