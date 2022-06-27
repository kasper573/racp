import { Header } from "../layout/Header";
import { useGetItemMetaQuery } from "../client";

export default function ItemSearchPage() {
  const { data } = useGetItemMetaQuery();
  return (
    <>
      <Header>Item Search</Header>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </>
  );
}
