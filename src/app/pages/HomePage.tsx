import { Redirect } from "react-typesafe-routes";
import { router } from "../router";

export default function HomePage() {
  return <Redirect to={router.item()} />;
}
