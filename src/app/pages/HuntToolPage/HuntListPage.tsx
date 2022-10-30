import { Typography } from "@mui/material";

import { useStore } from "zustand";
import { Header } from "../../layout/Header";
import { CardList } from "../../components/CardList";
import { huntStore } from "./huntStore";
import { AddHuntCard, HuntCard } from "./HuntCard";

export default function HuntListPage() {
  const { hunts, createHunt, deleteHunt } = useStore(huntStore);
  return (
    <>
      <Header />

      <Typography paragraph>
        Here you can track the items you are hunting for.
      </Typography>

      <CardList>
        <AddHuntCard onClick={createHunt} />

        {hunts.map((hunt) => (
          <HuntCard
            key={hunt.id}
            hunt={hunt}
            onDelete={() => deleteHunt(hunt.id)}
          />
        ))}
      </CardList>
    </>
  );
}
