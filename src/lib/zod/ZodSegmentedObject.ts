import * as zod from "zod";
import { ZodError, ZodIssue, ZodObject, ZodRawShape } from "zod";
import { ZodCustomObject } from "./ZodCustomObject";

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
    return this.buildForInput((matrix: string[][]) => matrix);
  }

  buildForInput<Input>(resolveInput: (input: Input) => string[][]) {
    return new ZodCustomObject(
      this.combined,
      createSegmentParser<Input, Combined, Segments>(
        this.segments,
        resolveInput
      )
    );
  }
}

function createSegmentParser<
  Input,
  Combined extends ZodRawShape,
  Segments extends ZodRawShape[]
>(segments: Segments, getMatrix: (input: Input) => string[][]) {
  type Entity = zod.infer<ZodObject<Combined>>;
  return (input: Input): Entity => {
    const matrix = getMatrix(input);
    const entity = {} as Entity;

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
