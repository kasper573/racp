import { clamp } from "lodash";
import { Monster, MonsterDrop } from "../services/monster/types";
import { Item } from "../services/item/types";
import { Config, ConfigRepository } from "./ConfigRepository";

export function createDropsRates(...[first, ...rest]: ConfigRepository[]) {
  return first.and(...rest).map("drops", (configs): DropRateRegistry => {
    const loadedConfigs = configs.filter((config) => !!config);
    if (!loadedConfigs.length) {
      return [];
    }

    const values: Config = Object.assign({}, ...loadedConfigs);

    return [
      {
        // Mvp items. Items that go directly to the MVP player.
        rates: readDropRates(values, "mvp"),
        determineScale: (monster, item) =>
          monster.MvpDrops.some((d) => d.Item === item.AegisName)
            ? "all"
            : false,
      },
      {
        rates: readDropRates(values, "card"),
        determineScale: (monster, item) =>
          item.Type === "Card" && modesToScaleType(monster.Modes),
      },
      {
        rates: readDropRates(values, "equip"),
        determineScale: (monster, item) =>
          ["Armor", "Weapon"].includes(item.Type ?? "") &&
          modesToScaleType(monster.Modes),
      },
      {
        rates: readDropRates(values, "use"),
        determineScale: (monster, item) =>
          item.Type === "Usable" && modesToScaleType(monster.Modes),
      },
      {
        rates: readDropRates(values, "heal"),
        determineScale: (monster, item) =>
          item.Type === "Healing" && modesToScaleType(monster.Modes),
      },
      {
        rates: readDropRates(values, "common"),
        determineScale: (monster, item) =>
          item.Type === "Etc" && modesToScaleType(monster.Modes),
      },
    ];
  });
}

function readDropRates(values: Config, name: string) {
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

  return {
    scales: {
      all: readProp(`item_rate_${name}`) / 100,
      bosses: readProp(`item_rate_${name}_boss`, name !== "mvp", 100) / 100,
      mvps: readProp(`item_rate_${name}_mvp`, name !== "mvp", 100) / 100,
    },
    min: readProp(`item_drop_${name}_min`),
    max: readProp(`item_drop_${name}_max`),
  };
}

function modesToScaleType(modes: Monster["Modes"]): DropRateScaleType {
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
  for (const { rates, determineScale } of registry) {
    const scaleType = determineScale(monster, item);
    if (scaleType) {
      const scale = rates.scales[scaleType];
      drop.Rate = clamp(drop.Rate * scale, rates.min, rates.max);
      break;
    }
  }
}

export type DropRates = ReturnType<typeof readDropRates>;

export type DropRateScaleType = keyof DropRates["scales"];

export type DropRateRegistry = Array<{
  determineScale: (monster: Monster, item: Item) => DropRateScaleType | false;
  rates: DropRates;
}>;
