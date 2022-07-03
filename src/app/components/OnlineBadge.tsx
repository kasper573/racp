import { ComponentProps } from "react";
import { Badge, styled } from "@mui/material";

export function OnlineBadge(
  props: ComponentProps<typeof Badge> & { visible?: boolean }
) {
  return (
    <StyledBadge
      overlap="circular"
      variant="dot"
      color="success"
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      {...props}
    />
  );
}

const StyledBadge = styled(Badge)<{ visible?: boolean }>`
  .MuiBadge-dot {
    transition: ${({ theme }) => theme.transitions.create("opacity")};
    outline: 1px solid rgba(255, 255, 255, 0.7);
    opacity: ${({ visible }) => (visible ? 1 : 0)};
  }
`;
