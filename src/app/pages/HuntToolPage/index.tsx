import { useEffect } from "react";
import { useStore } from "zustand";
import { Item } from "../../../api/services/item/types";
import { Header } from "../../layout/Header";
import { ItemIdentifier } from "../../components/ItemIdentifier";
import { trpc } from "../../state/client";
import { SearchField } from "../../components/SearchField";
import { CommonPageGrid } from "../../components/CommonPageGrid";
import { HuntedItemGrid } from "./HuntedItemGrid";
import { HuntedMonsterTable } from "./HuntedMonsterTable";
import { huntStore } from "./huntStore";

export default function HuntToolPage() {
  const { session, normalizeSession, addItems } = useStore(huntStore);

  useEffect(normalizeSession, [session, normalizeSession]);

  return (
    <>
      <Header />
      <SearchField<Item>
        sx={{ width: "100%" }}
        onSelected={(items) => addItems(items.map((item) => item.Id))}
        useQuery={useItemSearchQuery}
        optionKey={(option) => option.Id}
        optionLabel={(option) => option.Name}
        renderOption={(option) => <ItemIdentifier item={option} />}
        startSearchingMessage="Enter the name of the item you want to hunt"
        noResultsText={(searchQuery) => `No items matching "${searchQuery}"`}
        label="Add an item to hunt"
      />
      <CommonPageGrid sx={{ mt: 1 }} pixelCutoff={1400} flexValues={[2, 1]}>
        <HuntedItemGrid />
        <HuntedMonsterTable />
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
