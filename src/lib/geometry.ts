export interface Point {
  x: number;
  y: number;
}

export interface Area extends Point {
  width: number;
  height: number;
}

export function center(points: Point[]) {
  const { left, top, right, bottom } = bounds(points);
  const width = right - left;
  const height = bottom - top;
  const x = left + width / 2;
  const y = top + height / 2;
  return { x, y, width, height };
}

export function bounds(points: Point[]) {
  let left: number | undefined;
  let top: number | undefined;
  let right: number | undefined;
  let bottom: number | undefined;
  for (const { x, y } of points) {
    if (left === undefined || x < left) {
      left = x;
    }
    if (top === undefined || y < top) {
      top = y;
    }
    if (right === undefined || x > right) {
      right = x;
    }
    if (bottom === undefined || y > bottom) {
      bottom = y;
    }
  }
  return {
    left: left ?? 0,
    top: top ?? 0,
    right: right ?? 0,
    bottom: bottom ?? 0,
  };
}

export function intersect(
  { x = 0, y = 0, width = 1, height = 1 }: Partial<Area>,
  point?: Point,
  grace = 5
): boolean {
  width += grace * 2;
  height += grace * 2;
  x -= width / 2;
  y -= height / 2;
  return (
    point !== undefined &&
    x <= point.x &&
    x + width >= point.x &&
    y <= point.y &&
    y + height >= point.y
  );
}

export function distance(a: Point, b: Point) {
  const x = a.x - b.x;
  const y = a.y - b.y;
  return Math.sqrt(x * x + y * y);
}

export function isNear(a: Point, b: Point, grace: number) {
  return distance(a, b) < grace;
}
