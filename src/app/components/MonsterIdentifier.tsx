import { ComponentProps } from "react";
import { routes } from "../router";
import { Link } from "./Link";
import { IconWithLabel } from "./IconWithLabel";

export interface MonsterIdentifierProps
  extends Omit<ComponentProps<typeof IconWithLabel>, "alt" | "id"> {
  name: string;
  id: number;
  imageUrl?: string;
  link?: boolean;
}

export function MonsterIdentifier({
  name,
  id,
  imageUrl,
  children,
  link = true,
  ...props
}: MonsterIdentifierProps) {
  return (
    <IconWithLabel alt={name} src={imageUrl} {...props}>
      {link ? <Link to={routes.monster.view({ id })}>{name}</Link> : name}
      {children}
    </IconWithLabel>
  );
}
