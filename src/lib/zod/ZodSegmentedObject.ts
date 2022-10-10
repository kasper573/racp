import { isPlainObject } from "lodash";
import * as zod from "zod";
import { ZodError, ZodIssue, ZodObject, ZodRawShape } from "zod";
import { ZodCustomObject } from "./ZodCustomObject";

const rawArrayEntity = zod.array(zod.array(zod.any()));

export function createSegmentedObject() {
  return new SegmentBuilder({}, []);
}

class SegmentBuilder<
  Combined extends ZodRawShape,
  Segments extends ZodRawShape[]
> {
  constructor(private combined: Combined, private segments: Segments) {}

  segment<Segment extends ZodRawShape>(segment: Segment) {
    return new SegmentBuilder({ ...this.combined, ...segment }, [
      ...this.segments,
      segment,
    ]);
  }

  build() {
    return new ZodCustomObject(
      this.combined,
      createSegmentParser<Combined, Segments>(this.segments)
    );
  }
}

function createSegmentParser<
  Combined extends ZodRawShape,
  Segments extends ZodRawShape[]
>(segments: Segments) {
  type Entity = zod.infer<ZodObject<Combined>>;
  return (matrix: string[][]): Entity => {
    const entity = {} as Entity;

    // If input is object we use the type shapes directly
    if (isPlainObject(matrix)) {
      for (let i = 0; i < segments.length; i++) {
        Object.assign(entity, zod.object(segments[i]).parse(matrix));
      }
      return entity;
    }

    // Otherwise, we require a matrix
    if (matrix.length < segments.length) {
      throw new Error(
        `Array must contain at least ${segments.length} elements`
      );
    }

    const issues: ZodIssue[] = [];
    for (let segmentIndex = 0; segmentIndex < segments.length; segmentIndex++) {
      const shape = segments[segmentIndex];
      const shapeValues = matrix[segmentIndex];
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
          issues.push(
            ...parseResult.error.issues.map((issue) => ({
              ...issue,
              path: [+segmentIndex, +propIndex],
            }))
          );
        }
      }
    }

    if (issues.length) {
      throw new ZodError(issues);
    }

    return entity;
  };
}
