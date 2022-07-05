import { styled } from "@mui/material";
import {
  ComponentProps,
  ComponentType,
  createElement,
  Fragment,
  useMemo,
} from "react";
import { ClientTextNode } from "../../api/common/clientTextType";

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
  const Tag = text.tag ? knownTags[text.tag] : undefined;
  const content = (
    <>
      {text.content}
      {text.children?.map((child, index) => (
        <Fragment key={index}>
          <ClientText text={child} />
        </Fragment>
      ))}
    </>
  );
  return Tag ? createElement(Tag, content) : content;
}

const ClientTextRoot = styled("span")`
  white-space: pre-line;
`;

const knownTags: Record<string, ComponentType> = {};
