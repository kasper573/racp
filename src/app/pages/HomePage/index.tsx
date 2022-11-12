import { Page } from "../../layout/Page";
import { trpc } from "../../state/client";
import { Markdown } from "../../components/Markdown";
import { Banner } from "./Banner";
import defaultBannerUrl from "./defaultBanner.png";

export default function HomePage() {
  const { data: settings, isLoading } = trpc.settings.readPublic.useQuery();
  const bannerUrl = isLoading
    ? undefined // No banner while loading to avoid flickering from one image to another
    : settings?.homePageBannerUrl ?? defaultBannerUrl;
  return (
    <>
      <Banner style={{ backgroundImage: `url(${bannerUrl})` }}>
        {settings?.pageTitle}
      </Banner>
      <Page>
        <Markdown>{settings?.homePageContent}</Markdown>
      </Page>
    </>
  );
}
