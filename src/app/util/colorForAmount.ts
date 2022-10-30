import { clamp } from "lodash";
import interpolate = require("color-interpolate");

export function colorForAmount(value: number, colors: Array<[number, string]>) {
  value = Math.max(0, value);
  for (let i = 1; i < colors.length; i++) {
    const [min, colA] = colors[i - 1];
    const [max, colB] = colors[i];
    if (value >= min && value <= max) {
      return interpolate([colA, colB])(
        clamp((value - min) / (max - min), 0, 1)
      );
    }
  }
  return colors[colors.length - 1][1];
}
