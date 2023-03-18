import Ansi from "ansi-to-react";
import { styled } from "@mui/material";
import { useLayoutEffect, useRef } from "react";
import { Header } from "../layout/Header";
import { Page } from "../layout/Page";
import { TabbedPaper } from "../components/TabbedPaper";
import { trpc } from "../state/client";

export default function AdminLogsPage() {
  return (
    <Page>
      <Header />
      <TabbedPaper
        sx={{ flex: 1, display: "flex", flexDirection: "column" }}
        paperProps={{ sx: { flex: 1 } }}
        tabs={[
          {
            label: "RACP",
            content: <Logs query={logQueries.racp} />,
          },
        ]}
      />
    </Page>
  );
}

const logQueries = {
  racp: () => trpc.admin.racpLog.useQuery(undefined, { cacheTime: 0 }),
};

function Logs({ query: useQuery }: { query: () => { data?: string } }) {
  const { data } = useQuery();
  const ref = useRef<HTMLDivElement | null>(null);
  useLayoutEffect(() => {
    ref.current?.scrollTo(0, ref.current.scrollHeight);
  }, [data]);
  return (
    <LogsRoot ref={ref}>
      <Ansi>{data}</Ansi>
    </LogsRoot>
  );
}

const LogsRoot = styled("div")`
  overflow-y: auto;
  max-height: calc(100vh - 201px);
  padding: 0 12px;
  white-space: pre;
`;
