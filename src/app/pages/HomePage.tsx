import { router } from "../router";
import { Redirect } from "../../lib/tsr/react/Redirect";

export default function HomePage() {
  return <Redirect to={router.item({})} />;
}
