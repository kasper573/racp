import { Page } from "../../layout/Page";
import { trpc } from "../../state/client";
import { Markdown } from "../../components/Markdown";
import { Banner } from "./Banner";
import defaultBannerUrl from "./defaultBanner.png";

export default function HomePage() {
  const { data: settings, isLoading } = trpc.settings.readPublic.useQuery();
  const backgroundImage = isLoading
    ? undefined
    : `url("${settings?.homePageBannerUrl ?? defaultBannerUrl}")`;
  return (
    <>
      <Banner
        role="banner"
        aria-label={settings?.homePageBannerTitle}
        style={{ backgroundImage }}
      >
        {settings?.homePageBannerTitle}
      </Banner>
      <Page>
        <Markdown>{settings?.homePageContent}</Markdown>
      </Page>
    </>
  );
}
