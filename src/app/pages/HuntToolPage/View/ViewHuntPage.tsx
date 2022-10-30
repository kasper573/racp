import { useEffect } from "react";
import { useStore } from "zustand";
import { Stack, Typography } from "@mui/material";
import { Item } from "../../../../api/services/item/types";
import { Header } from "../../../layout/Header";
import { ItemIdentifier } from "../../../components/ItemIdentifier";
import { trpc } from "../../../state/client";
import { SearchField } from "../../../components/SearchField";
import { CommonPageGrid } from "../../../components/CommonPageGrid";
import { TextField } from "../../../controls/TextField";
import { Select } from "../../../controls/Select";
import { huntStore, KpxUnit, kpxUnits } from "../huntStore";
import { HuntedItemGrid } from "./HuntedItemGrid";
import { HuntedMonsterGrid } from "./HuntedMonsterGrid";

export default function ViewHuntPage() {
  const { session, normalizeSession, addItems } = useStore(huntStore);

  useEffect(normalizeSession, [session, normalizeSession]);

  return (
    <>
      <Header />

      <Typography paragraph>
        Here you can track the items you are hunting for.
      </Typography>
      <Typography paragraph>
        The tool will show you an estimate per item how long it will take to
        farm the amount you have specified. <br />
        You decide which monsters to hunt for per item and specify how fast you
        kill them, and the tool will do the rest.
      </Typography>
      <Typography paragraph>
        Data is stored in your local browser storage, so you can safely leave
        this page and return to it later on the same device.
      </Typography>

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

      <Settings />

      <CommonPageGrid
        sx={{ mt: 3, flex: 1 }}
        pixelCutoff={1400}
        flexValues={[5, 3]}
      >
        <HuntedItemGrid />
        <HuntedMonsterGrid />
      </CommonPageGrid>
    </>
  );
}

function Settings() {
  const { dropChanceMultiplier, setDropChanceMultiplier, kpxUnit, setKpxUnit } =
    useStore(huntStore);
  return (
    <Stack
      spacing={2}
      direction="row"
      sx={{
        mt: { xs: 3, md: 0 },
        position: { md: "absolute" },
        top: 0,
        right: 0,
      }}
    >
      <TextField
        type="number"
        label="Drop rate multiplier"
        helperText="(Server rates already applied)"
        value={dropChanceMultiplier}
        onChange={(value) => setDropChanceMultiplier(value)}
      />
      <Select<KpxUnit>
        label="Kill scale"
        options={kpxUnits}
        value={kpxUnit}
        onChange={(newUnit) => (newUnit ? setKpxUnit(newUnit) : undefined)}
      />
    </Stack>
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
