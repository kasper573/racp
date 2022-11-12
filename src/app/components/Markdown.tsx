import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Link, Typography } from "@mui/material";
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

const components = {
  p: withProps(Typography, { paragraph: true }),
  h1: withProps(Typography, { variant: "h1" }),
  h2: withProps(Typography, { variant: "h2" }),
  h3: withProps(Typography, { variant: "h3" }),
  h4: withProps(Typography, { variant: "h4" }),
  h5: withProps(Typography, { variant: "h5" }),
  h6: withProps(Typography, { variant: "h6" }),
  strong: withProps(Typography, { fontWeight: "bold" }),
  em: withProps(Typography, { fontStyle: "italic" }),
  del: withProps(Typography, { style: { textDecoration: "line-through" } }),
  span: withProps(Typography, { component: "span" } as any),
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
