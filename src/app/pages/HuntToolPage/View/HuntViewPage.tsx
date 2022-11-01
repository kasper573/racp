import { useStore } from "zustand";
import { IconButton, Stack, Tooltip, Typography } from "@mui/material";
import { Hunt } from "@prisma/client";
import { ContentCopy, Visibility, VisibilityOff } from "@mui/icons-material";
import { Item } from "../../../../api/services/item/types";
import { ItemIdentifier } from "../../../components/ItemIdentifier";
import { trpc } from "../../../state/client";
import { SearchField } from "../../../components/SearchField";
import { CommonPageGrid } from "../../../components/CommonPageGrid";
import { TextField } from "../../../controls/TextField";
import { Select } from "../../../controls/Select";
import {
  huntEditorStore,
  KpxUnit,
  kpxUnits,
  useIsHuntOwner,
} from "../huntEditorStore";
import { Header } from "../../../layout/Header";
import { RouteComponentProps } from "../../../../lib/tsr/react/types";
import { LoadingPage } from "../../LoadingPage";
import {
  ErrorMessage,
  getErrorMessage,
} from "../../../components/ErrorMessage";
import { authStore } from "../../../state/auth";
import { useHistory } from "../../../../lib/tsr/react/useHistory";
import { routes } from "../../../router";
import { Spaceless } from "../../../components/Spaceless";
import { huntNameType } from "../../../../api/services/hunt/types";
import { HuntedItemGrid } from "./HuntedItemGrid";
import { HuntedMonsterGrid } from "./HuntedMonsterGrid";

const nameMaxWidth = 320;

export default function HuntViewPage({
  params: { id: huntId },
}: RouteComponentProps<{ id: Hunt["id"] }>) {
  const history = useHistory();
  const { profile } = useStore(authStore);
  const isSignedIn = !!profile;
  const addItem = trpc.hunt.addItem.useMutation();
  const copyHunt = trpc.hunt.copy.useMutation();
  const publish = trpc.hunt.publish.useMutation();
  const unpublish = trpc.hunt.unpublish.useMutation();
  const renameHunt = trpc.hunt.rename.useMutation();
  const { data: hunt, isLoading } = trpc.hunt.read.useQuery(huntId);
  const error =
    addItem.error || copyHunt.error || publish.error || unpublish.error;
  const isOwner = useIsHuntOwner(hunt);

  async function copyAndRedirect() {
    const copy = await copyHunt.mutateAsync(huntId);
    history.push(routes.tools.hunt.view.$({ id: copy.id }));
  }

  if (isLoading) {
    return <LoadingPage />;
  }
  if (!hunt) {
    return <Header title="Unknown hunt" />;
  }

  return (
    <>
      <Stack spacing={2} sx={{ flex: 1 }}>
        <Header
          title={
            <>
              {isOwner ? (
                <TextField
                  type="text"
                  sx={{ width: nameMaxWidth }}
                  value={hunt.name}
                  issues={getErrorMessage(renameHunt.error?.data)}
                  onChange={(name) => renameHunt.mutate({ id: huntId, name })}
                  inputProps={{ maxLength: huntNameType.maxLength }}
                />
              ) : (
                <Typography
                  variant="h6"
                  sx={{
                    maxWidth: nameMaxWidth,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {hunt.name}
                </Typography>
              )}
              {
                <Spaceless>
                  <Stack
                    direction="row"
                    sx={{ transform: "translate(8px, -50%)" }}
                  >
                    {!isOwner && isSignedIn && (
                      <Tooltip title="Add a copy of this hunt to your account">
                        <IconButton onClick={copyAndRedirect}>
                          <ContentCopy />
                        </IconButton>
                      </Tooltip>
                    )}
                    {isOwner &&
                      (hunt.isPublished ? (
                        <Tooltip title="Make private">
                          <IconButton
                            aria-label="Make private"
                            onClick={() => unpublish.mutate(huntId)}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <Tooltip title="Make public">
                          <IconButton
                            aria-label="Make public"
                            onClick={() => publish.mutate(huntId)}
                          >
                            <VisibilityOff />
                          </IconButton>
                        </Tooltip>
                      ))}
                  </Stack>
                </Spaceless>
              }
            </>
          }
        />

        {error && <ErrorMessage error={error} />}

        {isOwner && <Settings />}

        {isOwner && (
          <SearchField<Item>
            sx={{ width: "100%" }}
            onSelected={([item]) => {
              if (item) {
                addItem.mutate({ huntId, itemId: item.Id });
              }
            }}
            useQuery={useItemSearchQuery}
            optionKey={(option) => option.Id}
            optionLabel={(option) => option.Name}
            renderOption={(option) => (
              <ItemIdentifier link={false} item={option} />
            )}
            startSearchingMessage="Enter the name of the item you want to hunt"
            noResultsText={(searchQuery) =>
              `No items matching "${searchQuery}"`
            }
            label="Add an item to hunt"
          />
        )}

        <CommonPageGrid sx={{ flex: 1 }} pixelCutoff={1400} flexValues={[5, 3]}>
          <HuntedItemGrid items={hunt.items} />
          <HuntedMonsterGrid monsters={hunt.monsters} />
        </CommonPageGrid>
      </Stack>
    </>
  );
}

function Settings() {
  const { dropChanceMultiplier, setDropChanceMultiplier, kpxUnit, setKpxUnit } =
    useStore(huntEditorStore);
  return (
    <Stack
      spacing={2}
      direction="row"
      sx={{
        position: { lg: "absolute" },
        mt: { lg: "0 !important" },
        alignSelf: "flex-end",
        top: 0,
        right: 0,
      }}
    >
      <TextField
        type="number"
        label="Drop Rate Multiplier"
        value={dropChanceMultiplier}
        onChange={(value) => setDropChanceMultiplier(value)}
      />
      <Select<KpxUnit>
        label="Kill Scale"
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
