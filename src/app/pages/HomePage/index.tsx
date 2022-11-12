import { Page } from "../../layout/Page";
import { trpc } from "../../state/client";
import { Markdown } from "../../components/Markdown";
import { useFileUrl } from "../../util/rpcFileUtils";
import { Banner } from "./Banner";
import defaultBannerUrl from "./defaultBanner.png";

export default function HomePage() {
  const { data: settings, isLoading } = trpc.settings.readPublic.useQuery();
  const bannerUrl = useFileUrl(settings?.homePageBanner);
  return (
    <>
      <Banner
        style={{
          backgroundImage: isLoading
            ? undefined
            : `url(${bannerUrl ?? defaultBannerUrl})`,
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
