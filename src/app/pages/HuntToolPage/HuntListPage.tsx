import { Typography } from "@mui/material";

import { useStore } from "zustand";
import { useState } from "react";
import { Header } from "../../layout/Header";
import { CardList } from "../../components/CardList";
import { ConfirmDialog } from "../../dialogs/ConfirmDialog";
import { Hunt, huntStore } from "./huntStore";
import { AddHuntCard, HuntCard } from "./HuntCard";

export default function HuntListPage() {
  const { hunts, createHunt, deleteHunt } = useStore(huntStore);
  const [huntToDelete, setHuntToDelete] = useState<Hunt>();
  return (
    <>
      <Header />

      <Typography paragraph>
        Create lists to help track the items you are hunting for.
        <br />
        Each list will automatically estimate how long it will take to farm.
      </Typography>

      <CardList>
        <AddHuntCard onClick={createHunt} />

        {hunts.map((hunt) => (
          <HuntCard key={hunt.id} hunt={hunt} onDelete={setHuntToDelete} />
        ))}
      </CardList>

      <ConfirmDialog
        open={!!huntToDelete}
        title="Delete hunt?"
        onCancel={() => setHuntToDelete(undefined)}
        onConfirm={() =>
          setHuntToDelete((hunt) => {
            if (hunt) {
              deleteHunt(hunt.id);
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
