import { useMemo } from "react";
import { Page } from "../../layout/Page";
import { trpc } from "../../state/client";
import { Markdown } from "../../components/Markdown";
import { toBrowserFile } from "../../util/rpcFileUtils";
import { Banner } from "./Banner";
import defaultBannerUrl from "./defaultBanner.png";

export default function HomePage() {
  const { data: settings, isLoading } = trpc.settings.readPublic.useQuery();
  const bannerUrl = useMemo(
    () =>
      isLoading
        ? undefined // Show no banner while loading
        : settings?.homePageBanner
        ? URL.createObjectURL(toBrowserFile(settings.homePageBanner))
        : defaultBannerUrl,
    [settings?.homePageBanner, isLoading]
  );
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
