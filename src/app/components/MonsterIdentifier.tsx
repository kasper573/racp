import { ComponentProps, ReactNode } from "react";
import { routes } from "../router";
import { MonsterFilter } from "../../api/services/monster/types";
import { trpc } from "../state/client";
import { Link } from "./Link";
import { IconWithLabel } from "./IconWithLabel";
import { LoadingSpinner } from "./LoadingSpinner";

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

export interface MonsterIdentifierByFilterProps
  extends Omit<MonsterIdentifierProps, "name" | "id" | "imageUrl"> {
  filter: MonsterFilter;
  fallback?: ReactNode;
  loader?: ReactNode;
}

export function MonsterIdentifierByFilter({
  filter,
  fallback = "Unknown monster",
  loader = <LoadingSpinner />,
  ...props
}: MonsterIdentifierByFilterProps) {
  const { data: { entities: [monster] = [] } = {}, isLoading } =
    trpc.monster.search.useQuery({
      filter: filter,
      limit: 1,
    });
  if (monster) {
    return (
      <MonsterIdentifier
        name={monster.Name}
        id={monster.Id}
        imageUrl={monster.ImageUrl}
        {...props}
      />
    );
  }
  if (isLoading) {
    return <>{loader}</>;
  }
  if (fallback) {
    return <>{fallback}</>;
  }
  return null;
}
