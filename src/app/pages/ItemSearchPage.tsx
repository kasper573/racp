import { useState } from "react";
import { Header } from "../layout/Header";
import { ItemFilter } from "../../api/services/item/types";
import { ItemSearchFilterForm } from "../forms/ItemSearchFilterForm";
import { ItemGrid } from "../grids/ItemGrid";

export default function ItemSearchPage() {
  const [filter, setFilter] = useState<ItemFilter>({});
  return (
    <>
      <Header>Items</Header>
      <ItemSearchFilterForm value={filter} onChange={setFilter} />
      <ItemGrid filter={filter} sx={{ mt: 1 }} />
    </>
  );
}
