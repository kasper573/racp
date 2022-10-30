import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  styled,
  Typography,
} from "@mui/material";
import { ComponentProps } from "react";
import { Hunt } from "./huntStore";

export function HuntCard({ hunt }: { hunt: Hunt }) {
  return (
    <BaseCard>
      <HuntGraphicSummary hunt={hunt} />
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          {hunt.name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          <HuntTextSummary hunt={hunt} />
        </Typography>
      </CardContent>
      <CardActions>
        <Button size="small">Share</Button>
        <Button size="small">Learn More</Button>
      </CardActions>
    </BaseCard>
  );
}

export function AddHuntCard(props: ComponentProps<typeof BaseCard>) {
  return (
    <BaseCard {...props}>
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          Add a hunt
        </Typography>
      </CardContent>
    </BaseCard>
  );
}

const BaseCard = styled(Card)`
  max-width: 345px;
`;

function HuntGraphicSummary({ hunt }: { hunt: Hunt }) {
  return <CardMedia sx={{ height: 140 }} />;
}

function HuntTextSummary({ hunt }: { hunt: Hunt }) {
  return (
    <>
      Lizards are a widespread group of squamate reptiles, with over 6,000
      species, ranging across all continents except Antarctica
    </>
  );
}
