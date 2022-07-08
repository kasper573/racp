import * as zod from "zod";
import {
  addIssueToContext,
  INVALID,
  ParseInput,
  ParseReturnType,
  ZodRawShape,
  ZodType,
  ZodTypeAny,
} from "zod";
import { isPlainObject } from "lodash";
import { chainParse } from "./chainParse";

const rawArrayEntity = zod.array(zod.array(zod.any()));

export class ZodArrayEntity<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Shapes extends ArrayEntityShapes = any
> extends ZodType<ArrayEntity<Shapes>> {
  constructor(private shapes: Shapes) {
    super({});
  }

  _parse(input: ParseInput): ParseReturnType<ArrayEntity<Shapes>> {
    type Entity = ArrayEntity<Shapes>;
    const context = this._getOrReturnCtx(input);
    const entity = {} as Entity;

    // If input is object we use the type shapes directly
    if (isPlainObject(input.data)) {
      for (const shape of Object.values(this.shapes)) {
        const res = zod.object(shape).safeParse(input.data);
        if (!res.success) {
          for (const issue of res.error.issues) {
            addIssueToContext(context, issue);
          }
        } else {
          Object.assign(entity, res.data);
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

    // Otherwise, we require a matrix
    const array = chainParse(rawArrayEntity, this, input);
    if (array.status !== "valid") {
      return array as ParseReturnType<ArrayEntity<Shapes>>;
    }

    if (array.value.length < this.shapes.length) {
      addIssueToContext(context, {
        code: "custom",
        message: `Array must contain at least ${this.shapes.length} elements`,
      });
      return INVALID;
    }

    for (const shapeIndex in this.shapes) {
      const shapeValues = array.value[shapeIndex];
      const shape = this.shapes[shapeIndex];
      const propTypes = Object.values(shape);
      const propNames = Object.keys(shape);
      for (const propIndex in propTypes) {
        const propName = propNames[propIndex] as keyof Entity;
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
