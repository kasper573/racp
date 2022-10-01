export function durationString(ms: number, maxSteps?: number) {
  let value = ms;
  for (let i = 0; i < steps.length; i++) {
    const nextStep = steps[i + 1];
    if (!nextStep || value < nextStep.factor) {
      let steppingValue = value;
      const names = steps
        .slice(0, i + 1)
        .reverse()
        .map((s) => {
          const floored = Math.floor(steppingValue);
          steppingValue = (steppingValue - floored) * s.factor;
          return floored !== 0 ? s.name(floored) : undefined;
        })
        .filter(Boolean);
      return names.slice(0, maxSteps).join(" ");
    }
    value /= nextStep.factor;
  }
  throw new Error("Unreachable");
}

interface Step {
  name: (val: number) => string;
  factor: number;
}

const steps: Step[] = [
  { name: (val) => `${val}ms`, factor: 1 },
  { name: (val) => `${val}s`, factor: 1000 },
  { name: (val) => `${val}m`, factor: 60 },
  { name: (val) => `${val}h`, factor: 60 },
  { name: (val) => `${val}d`, factor: 24 },
];
