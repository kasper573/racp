import { Redirect } from "react-typesafe-routes";
import { router } from "../router";

export default function AdminPage() {
  return <Redirect to={router.admin().config()} />;
}
