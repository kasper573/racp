import { clamp } from "lodash";
import { Monster, MonsterDrop } from "../services/monster/types";
import { Item } from "../services/item/types";
import { Config, ConfigRepository } from "./ConfigRepository";
import {
  DropRateGroupName,
  DropRateGroup,
  DropRateScales,
} from "./DropRatesRegistry.types";

export function createDropsRatesRegistry(
  ...[first, ...rest]: ConfigRepository[]
) {
  return first.and(...rest).map("drops", (configs): DropRateRegistry => {
    const loadedConfigs = configs.filter((config) => !!config);
    if (!loadedConfigs.length) {
      return [];
    }

    const values: Config = Object.assign({}, ...loadedConfigs);

    return [
      {
        // Mvp items. Items that go directly to the MVP player.
        ...readDropRates(values, "mvp"),
        determineScale: (monster, item) =>
          monster.MvpDrops.some((d) => d.Item === item.AegisName)
            ? "all"
            : false,
      },
      {
        ...readDropRates(values, "card"),
        determineScale: (monster, item) =>
          item.Type === "Card" && modesToScaleType(monster.Modes),
      },
      {
        ...readDropRates(values, "equip"),
        determineScale: (monster, item) =>
          ["Armor", "Weapon"].includes(item.Type ?? "") &&
          modesToScaleType(monster.Modes),
      },
      {
        ...readDropRates(values, "use"),
        determineScale: (monster, item) =>
          item.Type === "Usable" && modesToScaleType(monster.Modes),
      },
      {
        ...readDropRates(values, "heal"),
        determineScale: (monster, item) =>
          item.Type === "Healing" && modesToScaleType(monster.Modes),
      },
      {
        ...readDropRates(values, "common"),
        determineScale: (monster, item) =>
          item.Type === "Etc" && modesToScaleType(monster.Modes),
      },
    ];
  });
}

function readDropRates(values: Config, name: DropRateGroupName): DropRateGroup {
  function readProp(key: string, isRequired = true, defaultValue = 0) {
    const value = values[key];
    if (value === undefined) {
      if (isRequired) {
        throw new Error(`Config is missing key "${key}"`);
      }
      return defaultValue;
    }
    return parseFloat(value);
  }

  const baseRate = readProp(`item_rate_${name}`);
  return {
    name,
    scales: {
      all: baseRate / 100,
      bosses:
        readProp(`item_rate_${name}_boss`, name !== "mvp", baseRate) / 100,
      mvps: readProp(`item_rate_${name}_mvp`, name !== "mvp", baseRate) / 100,
    },
    min: readProp(`item_drop_${name}_min`),
    max: readProp(`item_drop_${name}_max`),
  };
}

function modesToScaleType(modes: Monster["Modes"]): keyof DropRateScales {
  if (modes.Mvp) {
    return "mvps";
  }
  if (modes.Boss) {
    return "bosses";
  }
  return "all";
}

export function applyDropRates(
  drop: MonsterDrop,
  monster: Monster,
  item: Item,
  registry: DropRateRegistry
) {
  for (const { min, max, scales, determineScale } of registry) {
    const scaleType = determineScale(monster, item);
    if (scaleType) {
      const scale = scales[scaleType];
      drop.Rate = clamp(drop.Rate * scale, min, max);
      break;
    }
  }
}

export type DropRateRegistry = Array<
  DropRateGroup & {
    determineScale: (
      monster: Monster,
      item: Item
    ) => keyof DropRateScales | false;
  }
>;
