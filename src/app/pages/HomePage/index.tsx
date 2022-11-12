import { Page } from "../../layout/Page";
import { trpc } from "../../state/client";
import { Markdown } from "../../components/Markdown";
import { Banner } from "./Banner";
import defaultBannerUrl from "./defaultBanner.png";

export default function HomePage() {
  const { data: settings, isLoading } = trpc.settings.readPublic.useQuery();
  return (
    <>
      <Banner
        role="banner"
        aria-label={settings?.pageTitle}
        style={{
          backgroundImage: isLoading
            ? undefined
            : `url(${settings?.homePageBannerUrl ?? defaultBannerUrl})`,
        }}
      >
        {settings?.pageTitle}
      </Banner>
      <Page>
        <Markdown>{settings?.homePageContent}</Markdown>
      </Page>
    </>
  );
}
