import { styled } from "@mui/material";
import { ComponentProps, Fragment, useMemo } from "react";
import { ClientTextNode } from "../../../api/common/clientTextType";
import tagComponentLookup from "./tags";
import { ClientTextTag } from "./ClientTextTag";

export function ClientText({
  text,
  ...props
}: ComponentProps<typeof ClientTextRoot> & { text: ClientTextNode }) {
  const lines = useMemo(() => [text], [text]);
  return <ClientTextBlock lines={lines} {...props} />;
}

export function ClientTextBlock({
  lines,
  ...props
}: ComponentProps<typeof ClientTextRoot> & { lines: ClientTextNode[] }) {
  const lastIndex = lines.length - 1;
  return (
    <ClientTextRoot {...props}>
      {lines.map((text, index) => (
        <Fragment key={index}>
          <ClientTextImpl text={text} />
          {index !== lastIndex ? "\n" : undefined}
        </Fragment>
      ))}
    </ClientTextRoot>
  );
}

function ClientTextImpl({ text }: { text: ClientTextNode }) {
  const Tag = text.tag ? tagComponentLookup[text.tag] ?? NoTag : NoTag;
  return (
    <Tag node={text}>
      {text.content}
      {text.children?.map((child, index) => (
        <Fragment key={index}>
          <ClientText text={child} />
        </Fragment>
      ))}
    </Tag>
  );
}

const ClientTextRoot = styled("span")`
  white-space: pre-line;
`;

const NoTag: ClientTextTag = ({ children }) => <>{children}</>;
