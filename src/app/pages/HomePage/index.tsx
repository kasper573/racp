import { Page } from "../../layout/Page";
import { trpc } from "../../state/client";
import { Markdown } from "../../components/Markdown";
import { Hero } from "./Hero";

export default function HomePage() {
  const { data: settings } = trpc.settings.readPublic.useQuery();
  return (
    <>
      <Hero>{settings?.pageTitle}</Hero>
      <Page>
        <Markdown>{settings?.homePageContent}</Markdown>
      </Page>
    </>
  );
}
