import { Add, Delete } from "@mui/icons-material";
import { ComponentProps } from "react";
import {
  Button,
  CardActions,
  CardContent,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import { CardListItem } from "../../components/CardList";
import { Center } from "../../components/Center";
import { Hunt } from "./huntStore";

export function HuntCard({
  hunt,
  onDelete,
}: {
  hunt: Hunt;
  onDelete?: () => void;
}) {
  return (
    <CardListItem sx={{ display: "flex", flexDirection: "column" }}>
      <CardContent
        sx={{ flex: 1, pb: 0, overflow: "hidden" }}
        style={{ marginBottom: 2 }}
      >
        <Typography gutterBottom variant="h5" component="div">
          {hunt.name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          <HuntSummary hunt={hunt} />
        </Typography>
      </CardContent>
      <CardActions>
        <Button sx={{ mr: "auto" }}>View</Button>
        <Tooltip title={`Delete "${hunt.name}"`}>
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.();
            }}
          >
            <Delete />
          </IconButton>
        </Tooltip>
      </CardActions>
    </CardListItem>
  );
}

export function AddHuntCard({
  sx,
  ...props
}: ComponentProps<typeof CardListItem>) {
  return (
    <CardListItem sx={{ cursor: "pointer", ...sx }} {...props}>
      <Center>
        <Tooltip title="New hunt">
          <Add sx={{ fontSize: 96 }} />
        </Tooltip>
      </Center>
    </CardListItem>
  );
}

function HuntSummary({ hunt }: { hunt: Hunt }) {
  return <>Hunt summary not implemented</>;
}
