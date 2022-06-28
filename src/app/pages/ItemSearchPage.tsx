import { useState } from "react";
import { Header } from "../layout/Header";
import { useGetItemMetaQuery, useSearchItemsQuery } from "../client";

export default function ItemSearchPage() {
  const [offset] = useState(0);
  const [limit] = useState(1);
  const { data: meta } = useGetItemMetaQuery();
  const { data: items } = useSearchItemsQuery({ offset, limit });
  return (
    <>
      <Header>Item Search</Header>
      <pre>{JSON.stringify(items, null, 2)}</pre>
      <pre>{JSON.stringify(meta, null, 2)}</pre>
    </>
  );
}
