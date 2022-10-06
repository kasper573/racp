import { MvpLifeStatus } from "../types";

export function determineMvpLifeStatus(
  now: number,
  {
    killedAt = now + 1, // If no kill time specified, defaults to future, meaning alive
    spawnWindow = 0,
    spawnDelay = 0,
  }: { killedAt?: number; spawnWindow?: number; spawnDelay?: number }
): MvpLifeStatus {
  if (killedAt > now) {
    return "Alive";
  }
  const spawnStart = killedAt + spawnDelay;
  const spawnEnd = spawnStart + spawnWindow;
  if (now > spawnEnd) {
    return "Alive";
  }
  if (now < spawnStart) {
    return "Dead";
  }
  return "Spawning";
}
