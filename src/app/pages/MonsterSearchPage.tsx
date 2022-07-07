import { useState } from "react";
import { Header } from "../layout/Header";
import { useSearchMonsterSpawnsQuery } from "../state/client";
import { DataGrid } from "../components/DataGrid";
import { MonsterFilter, MonsterSpawn } from "../../api/services/monster/types";

export default function MonsterSearchPage() {
  const [filter, setFilter] = useState<MonsterFilter>({});
  return (
    <>
      <Header>Monsters</Header>
      <DataGrid<MonsterSpawn, MonsterFilter, MonsterSpawn["id"]>
        filter={filter}
        columns={columns}
        query={useSearchMonsterSpawnsQuery}
        id={(item) => item.id}
      />
    </>
  );
}

const columns = {
  name: "Name",
  map: "Map",
};
