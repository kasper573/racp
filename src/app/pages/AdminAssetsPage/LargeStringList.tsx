import { Typography } from "@mui/material";
import { Fragment } from "react";
import { Link, LinkTo } from "../../components/Link";

export const LargeStringList = function <T>({
  values,
  max = 100,
  link,
}: {
  values: T[];
  link?: (value: T) => LinkTo;
  max?: number;
}) {
  return (
    <Typography sx={{ maxHeight: 300, overflowY: "auto" }}>
      {values.slice(0, max).map((value, index) => (
        <Fragment key={index}>
          {index > 0 && ", "}
          {link ? <Link to={link(value)}>{`${value}`}</Link> : `${value}`}
        </Fragment>
      ))}
      {values.length > 100 && ` (and ${values.length - max} more)`}
    </Typography>
  );
};
