import { Typography } from "@mui/material";
import { Header } from "../../layout/Header";
import { trpc } from "../../state/client";
import { ErrorMessage } from "../../components/ErrorMessage";
import { TabbedPaper } from "../../components/TabbedPaper";
import { CommonPageGrid } from "../../components/CommonPageGrid";
import { DropRateTable } from "./DropRateTable";
import { ExperienceConfigTable } from "./ExperienceConfigTable";

export default function ServerInfoPage() {
  const settings = trpc.settings.readPublic.useQuery();
  const dropRates = trpc.drop.rates.useQuery();
  const exp = trpc.exp.config.useQuery();

  if (settings.isLoading || dropRates.isLoading || exp.isLoading) {
    return null;
  }

  if (!settings.data || !dropRates.data || !exp.data) {
    return (
      <ErrorMessage error="Something went wrong, please try again later" />
    );
  }

  return (
    <>
      <Header />
      <Typography paragraph>
        Server is using {settings.data.rAthenaMode} mode.
      </Typography>
      <CommonPageGrid>
        <TabbedPaper
          tabs={[
            {
              label: "Drop rates",
              content: <DropRateTable rates={dropRates.data} />,
            },
          ]}
        />
        <TabbedPaper
          tabs={[
            {
              label: "Experience",
              content: <ExperienceConfigTable config={exp.data} />,
            },
          ]}
        />
      </CommonPageGrid>
    </>
  );
}
