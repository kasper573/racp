import { ComponentProps } from "react";
import { router } from "../router";
import { Link } from "./Link";
import { IconWithLabel } from "./IconWithLabel";

export interface MonsterIdentifierProps
  extends Omit<ComponentProps<typeof IconWithLabel>, "alt" | "id"> {
  name: string;
  id: number;
  imageUrl?: string;
}

export function MonsterIdentifier({
  name,
  id,
  imageUrl,
  ...props
}: MonsterIdentifierProps) {
  return (
    <IconWithLabel alt={name} src={imageUrl} {...props}>
      <Link to={router.monster.view({ id })}>{name}</Link>
    </IconWithLabel>
  );
}
