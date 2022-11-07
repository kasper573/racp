import { Header } from "../layout/Header";
import { trpc } from "../state/client";
import { KVTable } from "../components/KVTable";

export default function AdminStatsPage() {
  const { data: users } = trpc.user.count.useQuery();
  const { data: hunts } = trpc.hunt.count.useQuery();
  return (
    <>
      <Header />
      <KVTable rows={{ users, hunts }} />
    </>
  );
}
