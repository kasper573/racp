import { t } from "./trpc";
import { UtilService } from "./services/util/service";
import { UserService } from "./services/user/service";
import { MonsterService } from "./services/monster/service";
import { MetaService } from "./services/meta/service";
import { MapService } from "./services/map/service";
import { ItemService } from "./services/item/service";
import { DropService } from "./services/drop/service";
import { VendorService } from "./services/vendor/service";
import { ShopService } from "./services/shop/service";
import { NpcService } from "./services/npc/service";
import { AdminSettingsService } from "./services/settings/service";
import { DonationService } from "./services/donation/service";
import { SkillService } from "./services/skill/service";
import { ExpService } from "./services/exp/service";
import { HuntService } from "./services/hunt/service";
import { AdminService } from "./services/admin/service";
import { CharacterService } from "./services/character/service";

export function createApiRouter(services: ApiServices) {
  return t.router(services);
}

export type ApiServices = {
  admin: AdminService;
  util: UtilService;
  user: UserService;
  character: CharacterService;
  item: ItemService;
  monster: MonsterService;
  skill: SkillService;
  drop: DropService;
  vendor: VendorService;
  shop: ShopService;
  npc: NpcService;
  map: MapService;
  meta: MetaService;
  settings: AdminSettingsService;
  exp: ExpService;
  hunt: HuntService;
  donation: DonationService;
};

export type ApiRouter = ReturnType<typeof createApiRouter>;
