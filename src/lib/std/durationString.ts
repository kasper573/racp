export function durationString(ms: number) {
  let value = ms;
  for (let i = 0; i < steps.length; i++) {
    const nextStep = steps[i + 1];
    if (!nextStep || value < nextStep.ratio) {
      let steppingValue = value;
      const names = steps
        .slice(0, i + 1)
        .reverse()
        .map((s) => {
          const floored = Math.floor(steppingValue);
          steppingValue = (steppingValue - floored) * s.ratio;
          return floored !== 0 ? s.name(floored) : undefined;
        })
        .filter(Boolean);
      return names.join(", ");
    }
    value /= nextStep.ratio;
  }
  throw new Error("Unreachable");
}

interface Step {
  name: (val: number) => string;
  ratio: number;
}

const steps: Step[] = [
  { name: (val) => `${val}ms`, ratio: 1 },
  { name: (val) => `${val}s`, ratio: 1000 },
  { name: (val) => `${val}m`, ratio: 60 },
  { name: (val) => `${val}h`, ratio: 60 },
  { name: (val) => `${val}d`, ratio: 24 },
];
