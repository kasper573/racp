import { Container, styled } from "@mui/material";
import { ComponentProps } from "react";

export const maxContentWidth = "xl" as const;

export function ContentContainer({
  children,
  maxWidth = maxContentWidth,
  ...props
}: ComponentProps<typeof Outer>) {
  return (
    <Outer maxWidth={maxContentWidth} {...props}>
      <Inner>{children}</Inner>
    </Outer>
  );
}

const Outer = styled(Container)`
  display: flex;
  flex: 1;
  padding: ${({ theme }) => theme.spacing(3)};
  position: relative;
`;

const Inner = styled("div")`
  flex: 1;
  position: relative;
  display: flex;
  flex-direction: column;
  max-width: 100%;
`;
