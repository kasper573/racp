import { Typography } from "@mui/material";

import { useStore } from "zustand";
import { Header } from "../../layout/Header";
import { CardList } from "../../components/CardList";
import { huntStore } from "./huntStore";
import { AddHuntCard, HuntCard } from "./HuntCard";

export default function HuntListPage() {
  const { hunts, newHunt } = useStore(huntStore);
  return (
    <>
      <Header />

      <Typography paragraph>
        Here you can track the items you are hunting for.
      </Typography>

      <CardList>
        <AddHuntCard onClick={newHunt} />

        {hunts.map((hunt) => (
          <HuntCard key={hunt.id} hunt={hunt} />
        ))}
      </CardList>
    </>
  );
}
