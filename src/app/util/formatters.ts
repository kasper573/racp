import { MonsterDrop } from "../../api/services/monster/types";

export function dropRateString(rate: MonsterDrop["Rate"]) {
  return dropChanceString(rate / 100);
}

export function dropChanceString(percentage: number) {
  return `${
    percentage < 1 ? percentage.toPrecision(1) : Math.round(percentage)
  }%`;
}
