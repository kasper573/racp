import { Typography } from "@mui/material";

import { useState } from "react";
import { Hunt } from "@prisma/client";
import { useQueryClient } from "@tanstack/react-query";
import { useStore } from "zustand";
import { Header } from "../../layout/Header";
import { CardList } from "../../components/CardList";
import { ConfirmDialog } from "../../dialogs/ConfirmDialog";
import { trpc } from "../../state/client";
import { ErrorMessage } from "../../components/ErrorMessage";
import { authStore } from "../../state/auth";
import { Link } from "../../components/Link";
import { routes } from "../../router";
import { AddHuntCard, HuntCard } from "./HuntCard";

export default function HuntListPage() {
  const { profile } = useStore(authStore);
  const isSignedIn = !!profile;
  const queryClient = useQueryClient();
  const createHunt = trpc.hunt.create.useMutation();
  const removeHunt = trpc.hunt.delete.useMutation({
    // Clearing cache on delete prevents over eager re-fetching of the deleted hunt by other components
    onSuccess: () => queryClient.getQueryCache().clear(),
  });
  const { data: hunts = [] } = trpc.hunt.list.useQuery(undefined, {
    enabled: isSignedIn,
  });
  const [huntToDelete, setHuntToDelete] = useState<Hunt>();
  const error = removeHunt.error || createHunt.error;

  return (
    <>
      <Header />

      <Typography paragraph>
        Create lists to help track the items you are hunting for.
        <br />
        Each list will automatically estimate how long it will take to farm.
      </Typography>

      {error && <ErrorMessage sx={{ mb: 2 }} error={error} />}

      {isSignedIn ? (
        <CardList>
          <AddHuntCard onClick={() => createHunt.mutate("New hunt")} />
          {hunts.map((hunt) => (
            <HuntCard key={hunt.id} hunt={hunt} onDelete={setHuntToDelete} />
          ))}
        </CardList>
      ) : (
        <Typography paragraph>
          You need to{" "}
          <Link
            to={routes.user.login.$({ destination: routes.tools.hunt.$({}) })}
          >
            sign in
          </Link>{" "}
          before you can use this tool.
        </Typography>
      )}

      <ConfirmDialog
        open={!!huntToDelete}
        title="Delete hunt?"
        onCancel={() => setHuntToDelete(undefined)}
        onConfirm={() =>
          setHuntToDelete((hunt) => {
            if (hunt) {
              removeHunt.mutate(hunt.id);
            }
            return undefined;
          })
        }
      >
        This will permanently delete this hunt. <br />
        Are you sure you want to proceed?
      </ConfirmDialog>
    </>
  );
}
