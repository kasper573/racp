import { useEffect, useState } from "react";
import produce from "immer";
import { uniq, without } from "lodash";
import { Item } from "../../../api/services/item/types";
import { Header } from "../../layout/Header";
import { ItemIdentifier } from "../../components/ItemIdentifier";
import { trpc } from "../../state/client";
import { SearchField } from "../../components/SearchField";
import { CommonPageGrid } from "../../components/CommonPageGrid";
import { HuntedItemTable } from "./HuntedItemTable";
import { HuntedMonsterTable } from "./HuntedMonsterTable";
import { createHuntedItem, HuntedItem, HuntSession } from "./types";

export default function HuntToolPage() {
  const [hunted, setSession] = useState<HuntSession>({
    items: [501, 502, 503, 504, 505].map(createHuntedItem),
    kpm: new Map(),
  });

  useEffect(() => {
    setSession(
      produce(hunted, (draft) => {
        const targetIds = uniq(hunted.items.map((i) => i.targets ?? []).flat());
        const monsterIds = Array.from(hunted.kpm.keys());
        const added = without(targetIds, ...monsterIds);
        const removed = without(monsterIds, ...targetIds);
        for (const id of added) {
          draft.kpm.set(id, 0);
        }
        for (const id of removed) {
          draft.kpm.delete(id);
        }
      })
    );
  }, [hunted]);

  const setItems = (items: HuntedItem[]) =>
    setSession(
      produce(hunted, (draft) => {
        draft.items = items;
      })
    );

  const setKPM = (kpm: HuntSession["kpm"]) =>
    setSession(
      produce(hunted, (draft) => {
        draft.kpm = kpm;
      })
    );

  const addItems = (newItems: Item[]) => {
    const itemsThatDontAlreadyExist = newItems.filter(
      (item) => !hunted.items.some(({ itemId }) => itemId === item.Id)
    );
    setItems([
      ...hunted.items,
      ...itemsThatDontAlreadyExist.map(createHuntedItem),
    ]);
  };

  return (
    <>
      <Header />
      <SearchField<Item>
        sx={{ width: "100%" }}
        onSelected={addItems}
        useQuery={useItemSearchQuery}
        optionKey={(option) => option.Id}
        optionLabel={(option) => option.Name}
        renderOption={(option) => <ItemIdentifier item={option} />}
        startSearchingMessage="Enter the name of the item you want to hunt"
        noResultsText={(searchQuery) => `No items matching "${searchQuery}"`}
        label="Add an item to hunt"
      />
      <CommonPageGrid sx={{ mt: 1 }} flexValues={[2, 1]}>
        <HuntedItemTable hunts={hunted.items} updateHunts={setItems} />
        <HuntedMonsterTable kpm={hunted.kpm} updateKPM={setKPM} />
      </CommonPageGrid>
    </>
  );
}

function useItemSearchQuery(inputValue: string) {
  const enabled = !!inputValue;
  const { data: { entities: items = [] } = {}, isLoading } =
    trpc.item.search.useQuery(
      {
        filter: {
          Name: { value: inputValue, matcher: "contains" },
        },
      },
      { enabled }
    );
  return { data: items, isLoading: enabled && isLoading };
}
