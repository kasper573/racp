import { useState } from "react";
import { Box, Stack } from "@mui/material";
import produce from "immer";
import { Item } from "../../../api/services/item/types";
import { Header } from "../../layout/Header";
import { ItemIdentifier } from "../../components/ItemIdentifier";
import { trpc } from "../../state/client";
import { SearchField } from "../../components/SearchField";
import { HuntedItemTable } from "./HuntedItemTable";
import { HuntedMonsterTable } from "./HuntedMonsterTable";
import {
  createHuntedItem,
  HuntedItem,
  HuntedMonster,
  HuntSession,
} from "./types";

export default function HuntToolPage() {
  const [hunted, updateSession] = useState<HuntSession>({
    items: [501, 502, 503, 504, 505].map(createHuntedItem),
    monsters: [],
  });

  const setItems = (items: HuntedItem[]) =>
    updateSession(
      produce(hunted, (draft) => {
        draft.items = items;
      })
    );

  const setMonsters = (monsters: HuntedMonster[]) =>
    updateSession(
      produce(hunted, (draft) => {
        draft.monsters = monsters;
      })
    );

  const addItems = (newItems: Item[]) => {
    const itemsThatDontAlreadyExist = newItems.filter(
      (item) => !hunted.items.some(({ id }) => id === item.Id)
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
      <Stack direction="row" spacing={3} sx={{ flex: 1, mt: 3 }}>
        <Box flex={1}>
          <HuntedItemTable hunts={hunted.items} updateHunts={setItems} />
        </Box>
        <Box flex={1}>
          <HuntedMonsterTable
            hunts={hunted.monsters}
            updateHunts={setMonsters}
          />
        </Box>
      </Stack>
    </>
  );
}

function useItemSearchQuery(inputValue: string) {
  const { data: { entities: items = [] } = {}, isLoading } =
    trpc.item.search.useQuery(
      {
        filter: {
          Name: { value: inputValue, matcher: "contains" },
        },
      },
      { enabled: !!inputValue }
    );
  return { data: items, isLoading };
}
