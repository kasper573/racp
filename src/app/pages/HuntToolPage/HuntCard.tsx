import { Add, Delete } from "@mui/icons-material";
import { ComponentProps } from "react";
import {
  CardContent,
  IconButton,
  styled,
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
    <CardListItem>
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          {hunt.name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Lizards are a widespread
        </Typography>
      </CardContent>
      <Tooltip title={`Delete "${hunt.name}"`}>
        <CornerButton
          onClick={(e) => {
            e.stopPropagation();
            onDelete?.();
          }}
        >
          <Delete />
        </CornerButton>
      </Tooltip>
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

const CornerButton = styled(IconButton)`
  position: absolute;
  bottom: 8px;
  right: 8px;
`;
