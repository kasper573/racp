import { styled, Typography } from "@mui/material";
import { Directions } from "@mui/icons-material";
import { Link } from "../../../components/Link";

export interface PinsProps<T, Id> {
  entities: T[];
  show?: boolean;
  setHighlightId: (id?: Id) => void;
}

export const pinIconCss = {
  color: "#fff",
  filter: `drop-shadow( 0 0 1px rgba(0, 0, 0, 1))`,
};

export const LinkOnMap = styled(Link)`
  text-decoration: none;
  display: flex;
`;

export const PinIcon = Directions;

export const PinLabel = styled(Typography)`
  line-height: 1em;
  font-size: ${(p) => p.theme.typography.caption.fontSize};
  text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000;
`;
