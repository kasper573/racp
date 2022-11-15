import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Divider, Link, styled, Typography } from "@mui/material";
import { ComponentType } from "react";

export function Markdown({ children = "" }: { children?: string }) {
  return (
    <ReactMarkdown
      children={children}
      remarkPlugins={plugins}
      components={components}
    />
  );
}

const plugins = [remarkGfm];

const Span = withProps(Typography, { component: "span" } as any);

const Pre = styled("pre")`
  margin-top: 0;
  line-height: 24px;
`;

const Code = styled("code")`
  background-color: ${({ theme }) => theme.palette.divider};
  line-height: 24px;
  display: inline-block;
  border: 1px solid ${({ theme }) => theme.palette.divider};
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
  padding: 0 4px;
`;

const components = {
  p: withProps(Typography, { paragraph: true }),
  h1: withProps(Typography, { variant: "h1" }),
  h2: withProps(Typography, { variant: "h2" }),
  h3: withProps(Typography, { variant: "h3" }),
  h4: withProps(Typography, { variant: "h4" }),
  h5: withProps(Typography, { variant: "h5" }),
  h6: withProps(Typography, { variant: "h6" }),
  hr: withProps(Divider, { sx: { my: 2 } }),
  code: withProps(Code, {}),
  pre: withProps(Pre, {}),
  strong: withProps(Span, { fontWeight: "bold" }),
  em: withProps(Span, { fontStyle: "italic" }),
  del: withProps(Span, { style: { textDecoration: "line-through" } }),
  span: Span,
  a: Link,
};

function withProps<Props extends Record<string, any>>(
  Component: ComponentType<Props>,
  embeddedProps: Partial<Props>
) {
  function ComponentWithProps(inlineProps: Props) {
    const combinedProps = { ...embeddedProps, ...inlineProps } as Props;
    return <Component {...combinedProps} />;
  }
  return ComponentWithProps;
}
