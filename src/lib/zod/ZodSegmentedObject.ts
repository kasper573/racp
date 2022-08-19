import * as zod from "zod";
import {
  addIssueToContext,
  AnyZodObject,
  INVALID,
  ParseInput,
  ParseReturnType,
  ZodObject,
  ZodRawShape,
} from "zod";
import { isPlainObject, without } from "lodash";
import { typedKeys } from "../typedKeys";
import { chainParse } from "./chainParse";

const rawArrayEntity = zod.array(zod.array(zod.any()));

export function createSegmentedObject<Shape extends ZodRawShape>(shape: Shape) {
  return new SegmentBuilder(zod.object(shape), [], typedKeys(shape));
}

type Segment<Source extends AnyZodObject> = Array<keyof Source["shape"]>;

class SegmentBuilder<
  Source extends AnyZodObject,
  Segments extends Array<Segment<Source>>,
  RemainingShape extends ZodRawShape
> {
  constructor(
    private source: Source,
    private segments: Segments,
    private remainingKeys: Array<keyof RemainingShape>
  ) {}

  segment<Segment extends Array<keyof RemainingShape>>(...segment: Segment) {
    type NewRemainingShape = Omit<RemainingShape, Segment[number]>;
    return new SegmentBuilder<
      Source,
      [...Segments, Segment],
      NewRemainingShape
    >(
      this.source,
      [...this.segments, segment],
      without(this.remainingKeys, ...segment) as Array<keyof NewRemainingShape>
    );
  }

  // Hiding type signature to reduce complexity and because ZodArrayEntity is only an implementation detail
  // (avoids "Type instantiation is excessively deep...")
  build(): Source {
    return new ZodSegmentedObject(
      this.source._def,
      this.segments
    ) as unknown as Source;
  }
}

class ZodSegmentedObject<
  CombinedShape extends ZodRawShape,
  Segments extends Array<Segment<ZodObject<CombinedShape>>>
> extends ZodObject<CombinedShape> {
  constructor(
    def: ZodObject<CombinedShape>["_def"],
    private segments: Segments
  ) {
    super(def);
  }

  private getSegmentShape(segmentIndex: number): ZodRawShape {
    return this.segments[segmentIndex].reduce(
      (shape, key) => ({ ...shape, [key]: this.shape[key] }),
      {} as ZodRawShape
    );
  }

  _parse(input: ParseInput): ParseReturnType<this["_output"]> {
    type Entity = zod.infer<this>;
    const context = this._getOrReturnCtx(input);
    const entity = {} as Entity;

    // If input is object we use the type shapes directly
    if (isPlainObject(input.data)) {
      for (
        let segmentIndex = 0;
        segmentIndex < this.segments.length;
        segmentIndex++
      ) {
        const shape = this.getSegmentShape(segmentIndex);
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
      return array as ParseReturnType<this["_output"]>;
    }

    if (array.value.length < this.segments.length) {
      addIssueToContext(context, {
        code: "custom",
        message: `Array must contain at least ${this.segments.length} elements`,
      });
      return INVALID;
    }

    for (
      let segmentIndex = 0;
      segmentIndex < this.segments.length;
      segmentIndex++
    ) {
      const shape = this.getSegmentShape(segmentIndex);
      const shapeValues = array.value[segmentIndex];
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
              path: [+segmentIndex, +propIndex],
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
