import { useStore } from "zustand";
import { Stack } from "@mui/material";
import { Hunt } from "@prisma/client";
import { Item } from "../../../../api/services/item/types";
import { ItemIdentifier } from "../../../components/ItemIdentifier";
import { trpc } from "../../../state/client";
import { SearchField } from "../../../components/SearchField";
import { CommonPageGrid } from "../../../components/CommonPageGrid";
import { TextField } from "../../../controls/TextField";
import { Select } from "../../../controls/Select";
import { huntStore, KpxUnit, kpxUnits, useMayEditHunt } from "../huntStore";
import { Header } from "../../../layout/Header";
import { RouteComponentProps } from "../../../../lib/tsr/react/types";
import { EditableText } from "../../../components/EditableText";
import { LoadingPage } from "../../LoadingPage";
import { ErrorMessage } from "../../../components/ErrorMessage";
import { HuntedItemGrid } from "./HuntedItemGrid";
import { HuntedMonsterGrid } from "./HuntedMonsterGrid";

export default function HuntViewPage({
  params: { id: huntId },
}: RouteComponentProps<{ id: Hunt["id"] }>) {
  const addItem = trpc.hunt.addItem.useMutation();
  const renameHunt = trpc.hunt.rename.useMutation();
  const { data: hunt, isLoading } = trpc.hunt.read.useQuery(huntId);
  const error = addItem.error || renameHunt.error;
  const mayEdit = useMayEditHunt(hunt);

  if (isLoading) {
    return <LoadingPage />;
  }
  if (!hunt) {
    return <Header title="Unknown hunt" />;
  }

  return (
    <>
      <Header
        sx={{ mb: { md: 5, xs: 3 } }}
        title={
          <EditableText
            value={hunt.name}
            enabled={mayEdit}
            onChange={(name) => renameHunt.mutate({ id: huntId, name })}
            variant="h6"
          />
        }
      />

      {error && <ErrorMessage sx={{ mb: 2 }} error={error} />}

      {mayEdit && (
        <SearchField<Item>
          sx={{ width: "100%", mb: 3 }}
          onSelected={([item]) => {
            if (item) {
              addItem.mutate({ huntId, itemId: item.Id });
            }
          }}
          useQuery={useItemSearchQuery}
          optionKey={(option) => option.Id}
          optionLabel={(option) => option.Name}
          renderOption={(option) => <ItemIdentifier item={option} />}
          startSearchingMessage="Enter the name of the item you want to hunt"
          noResultsText={(searchQuery) => `No items matching "${searchQuery}"`}
          label="Add an item to hunt"
        />
      )}

      <Settings />

      <CommonPageGrid sx={{ flex: 1 }} pixelCutoff={1400} flexValues={[5, 3]}>
        <HuntedItemGrid items={hunt.items} />
        <HuntedMonsterGrid monsters={hunt.monsters} />
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
