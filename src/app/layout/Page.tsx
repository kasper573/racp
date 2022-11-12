import { Container, styled } from "@mui/material";
import { ComponentProps } from "react";

export const pageMaxWidth = "xl" as const;

export function Page({
  children,
  maxWidth = pageMaxWidth,
  ...props
}: ComponentProps<typeof Outer>) {
  return (
    <Outer maxWidth={pageMaxWidth} {...props}>
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
